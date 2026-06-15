# Changelog — Trauma Education Platform

---

## How the Full System Works (End-to-End)

The platform's core loop connects the quiz, the AI, the article database, and the ranking algorithm:

```
User takes quiz
      ↓
LLM generates a persona profile:
  { persona, interest_tags, search_query }
      ↓
Per-tag queries sent to OpenAlex academic API
  → 20 candidates fetched per tag, deduplicated
  → TF-IDF reranks all candidates, top 15 stored in MongoDB
      ↓
On articles page load:
  TF-IDF vectorizer fits on all article texts
  Cosine similarity computed: each article vs. user's tags
  Click engagement + recency added to final score
  Articles returned in ranked order
      ↓
User clicks article → click_count incremented
  → Article ranks higher on next load (feedback loop)
```

Every part of this pipeline was designed, built, and debugged as part of this project.

---

## 1. Adaptive Quiz with LLM Persona Extraction

**Files:** `server/routes/chat_route.py`, `server/utils/chat_prompts.py`

The quiz is not a static form — it is a dynamic conversation powered by a large language model (Groq/LLaMA). The system uses two distinct LLM calls:

**Call 1 — Dynamic question generation:** After each user answer, the LLM reads the full conversation history and generates a follow-up question that flows naturally from what the user just said. The AI is instructed to probe for knowledge level, specific interest area, and professional background.

**Call 2 — Persona extraction:** When all questions are answered, the LLM analyzes the full conversation and returns a structured JSON profile:
```json
{
  "persona": "informed learner",
  "interest_tags": ["PTSD", "children", "October 7"],
  "preferred_content": "research data and practical support",
  "primary_topic": "children",
  "search_query": "trauma AND Israel AND children AND (PTSD OR anxiety OR treatment)"
}
```
The `persona` field determines the visual theme shown to the user. The `interest_tags` and `search_query` drive the entire article pipeline.

**Score derivation:** The score (1–3) is deterministically derived from the persona:
- `beginner` → 1, `informed learner` → 2, `researcher` → 3

No separate scoring AI call is needed. The persona IS the score.

---

## 2. Article Fetching — Per-Tag Query Strategy

**File:** `server/services/openalex_articles.py`

Articles are fetched from **OpenAlex**, a free academic paper index of 200M+ works.

**Problem with the original approach:** One combined query was sent:
```
trauma AND Israel AND (PTSD OR resilience OR depression)
```
OpenAlex returns results ranked by its own internal relevance. The most popular tag dominates — typically 13 out of 15 results were about PTSD, with nothing about resilience or depression.

**Solution — Query Expansion:** A separate query is sent for each tag:
```
trauma AND Israel AND PTSD        → 20 candidates fetched
trauma AND Israel AND resilience  → 20 candidates fetched
trauma AND Israel AND depression  → 20 candidates fetched
```
This guarantees every topic is represented in the candidate pool. The AI-generated `search_query` is also used as one additional fetch of 15 candidates, capturing broader cross-topic papers. The full pool is then reranked by TF-IDF and trimmed to the best 15.

Results from all queries are merged. A `seen` set of OpenAlex IDs prevents duplicates — O(1) lookup per article using a hash set.

**Date filter:** `.filter(publication_year=">2014")` ensures only post-2015 research is returned. This is important for a topic like trauma in Israel where events like October 7 (2023) are central.

**"Israel" stripped from tags:** If the AI included "Israel" in the interest tags (it occasionally does), the query would become `trauma AND Israel AND Israel`. Israel is now removed from the tag list before building queries since it is already anchored in every query.

---

## 3. Candidate Generation + TF-IDF Reranking Pipeline

**Files:** `server/services/openalex_articles.py`, `server/routes/articles_route.py`

TF-IDF + cosine similarity runs in **two places** — during ingestion (deciding what to store) and at display time (deciding the order to show).

### Phase 1 — Candidate generation + reranking at fetch time

OpenAlex is queried with a wide net — **20 articles per tag** instead of 5. After deduplication this produces a pool of up to 60–80 candidates. TF-IDF + cosine similarity then scores every candidate against the user's tags. Only the **top 15 highest-scoring articles** survive into MongoDB.

This is the **candidate generation + reranking** pattern used by Google, Netflix, and Spotify: cast a wide net, then filter aggressively by relevance. The database only ever stores the best articles — not just whatever OpenAlex happened to return first.

### Phase 2 — Reranking at display time

When the articles page loads, TF-IDF runs again on the stored articles incorporating click engagement and recency, producing the final ranked order shown to the user.

### What was broken before

The old code checked whether user tags appeared in `persona_query` — the query string used to fetch the article. Since every article was fetched with the same query (which contained all the tags), every article scored identically on relevance. The ranking was essentially random.

### How TF-IDF works

TF-IDF assigns each word in a document a weight based on two factors:

**TF — Term Frequency:** How often does this word appear in this document?
A word that appears many times in an abstract is likely important to that article.
With `sublinear_tf=True`, the formula uses `log(1 + count)` to prevent very frequent words from dominating:
```
TF(term, doc) = log(1 + count of term in doc)
```

**IDF — Inverse Document Frequency:** How rare is this word across all documents?
A word like "trauma" appears in every article — it tells us nothing about which article is more relevant. A word like "hypervigilance" appears in only a few — it is a strong relevance signal.
```
IDF(term) = log(total number of articles / number of articles containing term)
```

**Combined:**
```
TF-IDF(term, doc) = TF(term, doc) × IDF(term)
```
Common words across all articles get low scores. Rare, specific terms get high scores.

### How cosine similarity works

Once every article and the user's query are represented as TF-IDF vectors (one dimension per unique word), cosine similarity measures how similar two vectors are by computing the angle between them:

```
cosine_similarity(query, article) = (query · article) / (|query| × |article|)
```

This produces a value between 0 (completely unrelated) and 1 (identical direction). Crucially, it is **length-independent** — a short abstract that is highly focused on the user's topic scores higher than a long abstract where the topic is mentioned only in passing.

### How it works in this system

1. All article texts (title + abstract) are collected into a list
2. The user's interest tags are joined into a query string: `"PTSD children October 7"`
3. The TF-IDF vectorizer fits on all article texts plus the query — building a shared vocabulary
4. Each article and the query become vectors in that vocabulary space
5. Cosine similarity is computed between the query vector and every article vector
6. Articles closest in direction to the user's interests rank highest

**Bigrams** (`ngram_range=(1,2)`) are included so phrases like "mental health", "post-traumatic", and "October 7" are treated as single meaningful units rather than split into individual words.

**English stopwords** ("the", "a", "is", "of") are removed — they carry no relevance signal.

### Final ranking formula

```
final_score = 0.60 × cosine_similarity   (TF-IDF content relevance)
            + 0.25 × click_score          (click_count / 10, capped at 1.0)
            + 0.15 × recency_score        (publication year, normalised 2000–2026)
```

Content relevance carries the most weight (0.60) since it is now a meaningful signal. Click engagement (0.25) reflects real user behavior. Recency (0.15) favors recent research without letting it override content relevance.

---

## 4. Click Feedback Loop

**Files:** `server/routes/articles_route.py`, `client/src/pages/Articles/ArticlePage.jsx`, `client/src/utils/api.js`

When a user clicks an article link, the frontend sends a silent POST to `/api/articles/:id/click`. The server increments `click_count` on that MongoDB document by 1.

On the next page load, the TF-IDF + cosine similarity ranking runs again and the click score contributes 0.25 to the final score. An article with 4 clicks scores +0.10 on top of its content relevance. An article with 10+ clicks scores the maximum +0.25.

This implements the **implicit feedback** pattern from recommender systems — user behavior (clicks) is used as a relevance signal without requiring the user to explicitly rate anything.

---

## 5. Crisis Distress Detection

**Files:** `server/utils/distress.py`, `server/routes/chat_route.py`, `client/src/pages/QuizPage.jsx`

Every message sent during the quiz is scanned for distress signals before being passed to the AI. This is a safety feature appropriate for a platform focused on trauma.

**How it works — Weighted keyword scoring:**

Each keyword in a predefined list has an assigned severity weight:
```
"suicide"        → 10  (immediate crisis)
"want to die"    → 10
"hopeless"       → 5   (significant distress)
"can't go on"    → 5
"can't cope"     → 3   (moderate distress)
"overwhelmed"    → 2
```

The weights of all matched keywords are summed. Thresholds:
- Score ≥ 8 → **Severe** (level 3)
- Score ≥ 4 → **Moderate** (level 2)
- Score ≥ 2 → **Mild** (level 1)

Level 2 or above interrupts the quiz. Instead of a quiz question, the server returns a crisis response and the frontend renders a banner with Israeli crisis hotlines:
- **ERAN** — 1201 (24/7 emotional support)
- **NATAL** — 1800-363-363 (trauma hotline)
- **SAHAR** — online chat support

The user can dismiss the banner and continue the quiz. The detection is **zero false-negative by design** for the most critical phrases — it is better to show a hotline to someone who doesn't need it than to miss someone who does.

---

## 6. Infrastructure Fixes

### Rate Limiter
The rate limiter (`Flask-Limiter`) was instantiated inside `chat_route.py` without being bound to the Flask app object, so it never enforced any limits. Fixed by moving it to a shared `extensions.py` and calling `limiter.init_app(app)` in `app.py`. The chat endpoint now enforces 30 requests per hour per IP.

### MongoDB Startup Crash
`mongo.py` crashed silently at startup if pool-size environment variables were missing — `None` was passed to `MongoClient`, raising a `ValueError` that was caught and suppressed, leaving `mongo_client` undefined. Any subsequent database call then raised a `NameError`. Fixed with an `_int_env()` helper that only passes parameters to `MongoClient` when they are present in the environment.

### OpenAlex Journal Field Crash
`work.get("primary_location", {}).get("source", {})` crashed when `primary_location` existed in the response but had a `None` value — Python raises `AttributeError` when calling `.get()` on `None`. Fixed using `or {}` guards at every level:
```python
((work.get("primary_location") or {}).get("source") or {}).get("display_name")
```

---

## 7. Persona-Based UI Theming

**File:** `client/src/index.css`

Three visual themes applied based on quiz outcome, built from a curated 5-color palette (Mint Cream, Muted Teal, Granite, Bright Snow, Light Blue):

| Persona | Background | Primary color | Font size | Border radius |
|---|---|---|---|---|
| Beginner | `#e1ebe2` Mint Cream | `#7da984` Muted Teal | 17px | 14px (rounded) |
| Informed Learner | `#f0f5f2` | `#4b645f` Granite | 15px | 10px |
| Researcher | `#eaf4f7` | `#4a8fa3` Light Blue (darkened) | 13px | 4px (sharp) |

Implemented via CSS custom properties on the `<html>` element (`data-persona` attribute). `PersonaContext` owns the state, reads from `localStorage` on init so the theme survives page refresh and login. Every component inherits theme variables — no component-level theme logic required anywhere in the codebase.

A global `transition: background-color 0.35s ease, border-color 0.3s ease, color 0.25s ease` on `*` ensures the theme change animates smoothly when the persona first loads.

---

## 8. Tag Quality Filtering

**Files:** `server/routes/chat_route.py`, `server/utils/chat_prompts.py`

The LLM extracts interest tags from the quiz conversation. Without filtering, it sometimes returns generic terms like `"trauma"`, `"Israel"`, or `"mental health"` — which are already anchored in every OpenAlex query and add no differentiation.

**Two-layer defense:**

**Layer 1 — Prompt:** The persona extraction prompt now explicitly forbids generic tags and lists what makes a good tag:
- Forbidden: `"trauma"`, `"Israel"`, `"mental health"`, `"psychology"`, `"stress"`, `"support"`
- Good: `"PTSD"`, `"children"`, `"veterans"`, `"October 7"`, `"EMDR"`, `"CBT"`, `"bereavement"`, `"resilience"`

**Layer 2 — `_clean_tags()` filter:** Even if the LLM ignores the prompt, a post-processing function strips any tag matching a hardcoded generic list, deduplicates case-insensitively, and caps at 5 tags. If all tags are filtered out, it falls back to `primary_topic` so the article fetch always has something specific to work with.

```python
_GENERIC_TAGS = {
    "trauma", "israel", "mental health", "psychology", "stress",
    "health", "support", "wellbeing", "awareness", "disorder", ...
}
```

This means a generic tag can never reach the article fetch pipeline regardless of what the LLM returns.

---

## 9. Persona-Based Animation System

**Files:** `client/src/pages/Articles/ArticlePage.css`, `client/src/pages/QuizPage.module.css`, `client/src/components/results/results-components.css`, `client/src/index.css`

Animations are tiered by persona — the interface becomes progressively more animated for users who need more engagement and progressively more static for users who want to focus on content.

| Feature | Beginner | Informed Learner | Researcher |
|---|---|---|---|
| Article cards | Staggered slide-up, 50ms apart | Simple fade | None |
| Chat bubbles | Slide in from side (AI←, User→) | Fade in | None |
| Typing indicator | Breathing pulse (1.2s loop) | Breathing pulse | Static |
| Results hero | Scale + rise entrance, children cascade | Fade in | None |
| Persona card | Slides up 200ms after hero | Fades in | None |

All animations use `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutQuint) — a smooth decelerate with no bounce. Bounce/overshoot was deliberately avoided as tonally inappropriate for a trauma-focused platform.

The stagger covers the full article fetch size (`:nth-child(1)` through `:nth-child(n+15)`) so no cards pop in simultaneously after the cascade.

**Accessibility guard:** A `prefers-reduced-motion` media query in `index.css` neutralizes every animation and transition app-wide with a single rule:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }
}
```
This is critical for a trauma app — users with PTSD or vestibular sensitivity can be physically affected by motion.

---

## 10. Bug Fixes

### Articles Never Deleted on Quiz Reset
**File:** `server/routes/delete_session.py`

JWT identity is stored as a UUID string (`str(uuid.uuid4())`). The delete route was calling `ObjectId(auth_user_id_str)` to convert it before querying `articles_collection`. UUID strings are not valid MongoDB ObjectIds — this always raised `InvalidId`, was silently caught, and articles were **never deleted** when a user reset their quiz. Fixed by querying with the string directly: `{"user_id": auth_user_id_str}`.

### Server Crash on Malformed Auth Requests
**File:** `server/routes/auth_route.py`

`request.get_json()` returns `None` when a request has no JSON body. `validate_register(None)` then called `.get()` on `None`, crashing the server with `AttributeError`. Fixed with `request.get_json() or {}` on both register and login routes.

### Article Fetch: POST Failure Fell Through to GET
**File:** `client/src/pages/Articles/ArticlePage.jsx`

When the articles page found an empty DB, it POST'd to generate articles then GET'd to retrieve them. If the POST returned a 500 error, `postRes.ok` was never checked — the GET ran anyway, returned an empty list, and the user saw no articles with no error message. Fixed by throwing on `!postRes.ok` before proceeding to the GET.

### Wrong Login Redirect URL
**File:** `client/src/pages/Articles/ArticlePage.jsx`

The articles page redirected unauthenticated users to `/login`, which doesn't exist in the router. React Router hit the wildcard `*` route and sent the user to the quiz page (`/`) instead of the login page. Fixed to `/auth/login`.

### Dead Code Removal
**Files:** `server/routes/articles_route.py`, `server/routes/chat_score_route.py`, `server/routes/auth_route.py`

- Three `try/except InvalidId` blocks in the articles routes were unreachable — `user_id = user_id_str` is a plain assignment that can never raise `InvalidId`. Removed.
- `score_reason` field in `chat_score_route.py` was always empty — it was set by a scoring system deleted in a previous session. Removed.
- Two commented-out lines in `auth_route.py` leftover from an earlier refactor. Removed.

---

## 11. Persona Restored on Login

**Files:** `server/routes/auth_route.py`, `client/src/pages/Auth/Login.jsx`, `client/src/utils/api.js`

**Problem:** Quiz sessions are stored in MongoDB under a random quiz UUID (device-specific, stored in `localStorage`). When a user logged in, the app tried to find their quiz session using the local UUID — which worked on the same device but failed on any other device or after clearing localStorage.

**Fix:** The login request now sends the local `quiz_user_id` (quiz UUID from `localStorage`) to the server alongside email and password. The server looks up the completed quiz session and returns `score` and `persona_profile` directly in the login response. The client uses those immediately to navigate to `/results` with the correct persona — no second round-trip, no `localStorage` dependency.

```python
# auth_route.py — login now returns saved persona
quiz_user_id = data.get("quiz_user_id")
if quiz_user_id:
    session = chat_collection.find_one(
        {"user_id": quiz_user_id, "completed": True},
        {"score": 1, "persona_profile": 1}
    )
    if session:
        score = session.get("score")
        persona_profile = session.get("persona_profile")
```

The persona is now restored from the database at login time, not from `localStorage`.

---

## 12. OpenAlex Abstract Fix

**File:** `server/services/openalex_articles.py`

OpenAlex's `abstract_inverted_index` field was not being explicitly requested in the API call. Without an explicit `.select()`, pyalex returns a default field set that may omit the abstract. All articles were being stored with `abstract: null`, causing every article card to display "No abstract available" — and degrading TF-IDF ranking quality since it was only scoring on titles.

Fixed by adding an explicit field selection to every OpenAlex fetch:

```python
_SELECT_FIELDS = [
    "id", "title", "publication_year", "doi",
    "primary_location", "host_venue", "authorships",
    "abstract_inverted_index", "cited_by_count",
]

Works().search(query).filter(...).select(_SELECT_FIELDS).get(per_page=per_page)
```

---

## 13. Animation Implementation Fix

**Files:** `client/src/index.css`, `client/src/pages/QuizPage.jsx`

The quiz bubble animations were defined inside `QuizPage.module.css`. In Vite, CSS Modules locally scope `@keyframes` names by hashing them. When animations are referenced inside `:global()` persona-selector overrides, the scoping becomes inconsistent and animations silently fail to run.

Fixed by moving all quiz animations out of the CSS module and into `index.css` (global, never hashed). Plain global class names (`quiz-bubble-ai`, `quiz-bubble-user`, `quiz-typing`) were added alongside the module classes on the elements so they can be targeted reliably from global CSS.

```jsx
// QuizPage.jsx — global class alongside module class
className={m.role === "user"
  ? `${styles.bubbleUser} quiz-bubble-user`
  : `${styles.bubbleAi} quiz-bubble-ai`}
```

```css
/* index.css — global, never hashed, always reliable */
.quiz-bubble-ai   { animation: quizSlideInLeft  0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.quiz-bubble-user { animation: quizSlideInRight 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
.quiz-typing      { animation: quizTypingPulse  1.4s ease-in-out infinite; }
```
