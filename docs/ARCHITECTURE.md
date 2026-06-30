# System Architecture — Trauma Education Platform

---

## Full System Pipeline (End-to-End)

```
┌──────────────────────────────────────────────────────────────────────────┐
│  USER VISITS APP                                                         │
└──────────────────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  AUTH LAYER  [auth_route.py]                                             │
│                                                                          │
│  Register / Login → JWT issued                                           │
│  On login: look up quiz session by auth_user_id  (any device)           │
│            fallback to quiz_user_id from request body (first login)      │
│            write auth_user_id onto session for future cross-device use   │
│  → If session found: persona + score returned immediately                │
│  → New user: continue to quiz ↓                                         │
└──────────────────────────────────────────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  QUIZ  [chat_route.py + chat_prompts.py]                                 │
│                                                                          │
│  Every message → distress.py BEFORE reaching LLM                        │
│    weighted keyword score ≥ 4 → interrupt quiz immediately               │
│    return Israeli crisis hotlines (ERAN 1201, NATAL, SAHAR)             │
│                                                                          │
│  LLM Call 1 (per turn, Groq/LLaMA)                                      │
│    reads full conversation history                                       │
│    generates next question probing: knowledge level, interest area,      │
│    professional background, primary topic                                │
│                                                                          │
│  LLM Call 2 (once, at completion)                                        │
│    extracts structured persona profile:                                  │
│    {                                                                     │
│      persona:            "beginner" | "informed learner" | "researcher" │
│      emotional_state:    "grieving" | ... | "neutral"                    │
│      content_preference: "stories" | "research" | "mixed"                │
│      interest_tags:      ["PTSD", "children", "October 7"]              │
│      primary_topic:      "children"                                      │
│      search_query:       "trauma AND Israel AND children AND ..."        │
│    }                                                                     │
│    _clean_tags() strips generic tags, deduplicates, caps at 5           │
│    score derived: beginner→1  informed learner→2  researcher→3          │
│    if user is logged in: auth_user_id written to session immediately     │
└──────────────────────────────────────────────────────────────────────────┘
      ↓                                          ↓ (runs in parallel)
┌──────────────────────────────────┐  ┌─────────────────────────────────────┐
│  ARTICLE PIPELINE                │  │  UI THEMING  [index.css +           │
│                                  │  │  PersonaProvider]                   │
│  FETCH  [openalex_articles.py]   │  │                                     │
│  One query per interest_tag:     │  │  PersonaProvider sets data-persona  │
│    "trauma AND Israel AND PTSD"  │  │  on <html>, persists to localStorage│
│      → 20 candidates             │  │                                     │
│    "trauma AND Israel AND        │  │  CSS custom properties apply theme: │
│      children"  → 20 candidates  │  │  beginner       → warm cream,       │
│    (repeat per tag)              │  │                    terracotta, 17px  │
│  + AI search_query → 15 more     │  │  informed learner → neutral,        │
│  Deduplicated by OpenAlex ID     │  │                    teal, 15px        │
│  Filtered: pub year > 2014       │  │  researcher     → dark, cyan, 15px  │
│  Pool: 40–80 candidates          │  │                                     │
│      ↓                           │  │  Animations tiered by persona:      │
│  RANK  [ranker.py]               │  │  beginner       → staggered slide-up│
│  Runs ONCE at ingestion          │  │  informed learner → fade            │
│  BM25: keyword match,            │  │  researcher     → none              │
│    term saturation,              │  │  prefers-reduced-motion disables    │
│    length normalisation          │  │  all animations app-wide            │
│  Embeddings: all-MiniLM-L6-v2   │  └─────────────────────────────────────┘
│    384-dim cosine similarity     │
│    "veterans" ↔ "soldiers"       │
│    "October 7" ↔ "Nova victims"  │
│  content_score =                 │
│    0.5 × BM25 + 0.5 × embedding │
│  Top 15 written to MongoDB       │
│  with content_score stored       │
│  (model behind threading.Lock)   │
└──────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  ARTICLES PAGE  [ArticlePage.jsx + articles_route.py]                    │
│                                                                          │
│  Client checks sessionStorage cache (articles_cache_<userId>)            │
│    HIT (< 5 min) → return immediately, no network request               │
│    MISS → render skeleton shimmer cards → fetch from server              │
│                                                                          │
│  GET /api/articles                                                       │
│    reads content_score from MongoDB  (no ML at read time)               │
│    final_score = 0.60 × content_score      (stored at ingestion)        │
│               + 0.25 × click_count/10      (capped at 1.0)              │
│               + 0.15 × recency_score       (pub year, 2000–2026)        │
│    returns articles sorted by final_score                                │
│                                                                          │
│  Cache written to sessionStorage with 5-min timestamp                    │
│  Cache busted on: topic profile save, quiz retake                        │
└──────────────────────────────────────────────────────────────────────────┘
      ↓                                          ↓
┌──────────────────────────────────┐  ┌─────────────────────────────────────┐
│  CLICK FEEDBACK LOOP             │  │  ARTICLE CHAT                       │
│  [articles_route.py +            │  │  [ai_assistant_route.py +           │
│   ArticlePage.jsx]               │  │   ArticleChatBubble.jsx]            │
│                                  │  │                                     │
│  User clicks article link        │  │  Floating chat bubble on page       │
│  → silent POST                   │  │                                     │
│    /api/articles/:id/click       │  │  System message (static per call):  │
│  → MongoDB click_count += 1      │  │    all 15 stored articles           │
│                                  │  │    abstracts truncated to 400 chars │
│  Next page load:                 │  │    tone set by persona:             │
│    updated click_count raises    │  │    researcher → academic            │
│    that article's final_score    │  │    beginner   → warm + simple       │
│  No ML re-ranking — arithmetic   │  │                                     │
│  only (implicit feedback loop)   │  │  Last 4 turns as user/assistant     │
│                                  │  │  Articles cached server-side 5 min  │
│                                  │  │  Persona: JWT identity first,       │
│                                  │  │    quiz_user_id fallback            │
│                                  │  │  max_tokens: 800                    │
│                                  │  │  Guard: choices=None → 503          │
└──────────────────────────────────┘  └─────────────────────────────────────┘
      ↓
┌──────────────────────────────────────────────────────────────────────────┐
│  DATA EXPLORATION PAGES  (all behind Navbar, no auth required)           │
│                                                                          │
│  /map              → CallsMapPage.jsx                                    │
│    Animated choropleth — ERAN/NATAL crisis call records from MongoDB     │
│    Filters: date range, gender, age group (5 buckets)                   │
│    Two API endpoints:                                                    │
│      GET /api/v1/calls-map          — static count per city             │
│      GET /api/v1/calls-map-aggregated — month-by-month time series       │
│    Playback mode: steps through timeline snapshots automatically         │
│    MapContext holds shared filter state across map + filter drawer       │
│                                                                          │
│  /graphs/israel    → IsraelWarPage.jsx      GET /graphs/israel          │
│  /graphs/addictions → AddictionsPage.jsx    GET /graphs/addictions       │
│  /graphs/health    → HealthPage.jsx         GET /graphs/health           │
│  /graphs/sleep     → SleepPage.jsx          GET /graphs/sleep            │
│  /graphs/traffic   → TrafficAccidentsPage.jsx  GET /graphs/traffic       │
│  /graphs/domestic-violence → DomesticViolencePage.jsx                   │
│    All backed by graph_data.py — static JSON datasets compiled from      │
│    State Comptroller, Ministry of Health, academic sources               │
│    Each page renders its charts inline (Recharts/SVG, per chart_type)   │
│                                                                          │
│  /trends           → ExploreSearchPage.jsx  GET /api/trends             │
│    Area + line charts (Recharts) of Google Trends data stored in MongoDB │
│    google_trends.py runs as a standalone script (cron/manual) to        │
│    refresh the trends_collection with pytrends (IL geo, 1-month window) │
│    Retry on 429: tenacity exponential back-off, 3 attempts              │
│    Bulk-upsert by date keeps collection idempotent                       │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 1. Adaptive Quiz with LLM Persona Extraction

**Files:** `server/routes/chat_route.py`, `server/utils/chat_prompts.py`

The quiz is a dynamic conversation powered by Groq/LLaMA. Two LLM calls drive it:

**Call 1 — Dynamic question generation:** After each user answer the LLM reads the full conversation history and generates a follow-up question. It probes for knowledge level, specific interest area, and professional background — including the user's primary topic (e.g. children, veterans, October 7 survivors).

**Call 2 — Persona extraction:** When all questions are answered the LLM returns a structured JSON profile:
```json
{
  "persona": "informed learner",
  "emotional_state": "grieving",
  "content_preference": "stories",
  "interest_tags": ["PTSD", "children", "October 7"],
  "primary_topic": "children",
  "search_query": "trauma AND Israel AND children AND (PTSD OR anxiety OR treatment)"
}
```
The `persona` field determines the results layout + theme; `emotional_state` and `content_preference` drive results copy tone, content mix, and article-rank persona boost. The `interest_tags` and `search_query` drive the article pipeline.

**Score derivation:** Derived deterministically from persona — `beginner` → 1, `informed learner` → 2, `researcher` → 3. No separate scoring call.

---

## 2. Article Fetching — Per-Tag Query Strategy

**File:** `server/services/openalex_articles.py`

Articles come from **OpenAlex** (200M+ academic works, free API).

**Problem with a single combined query:**
```
trauma AND Israel AND (PTSD OR resilience OR depression)
```
OpenAlex ranks by its own relevance. The dominant tag takes 13 of 15 slots; other topics are starved.

**Solution — query expansion:** One query per tag:
```
trauma AND Israel AND PTSD        → 20 candidates
trauma AND Israel AND resilience  → 20 candidates
trauma AND Israel AND depression  → 20 candidates
```
The AI-generated `search_query` adds 15 more cross-topic candidates. All results are merged with a `seen` set (O(1) dedup by OpenAlex ID) producing a pool of 40–80 candidates.

**Date filter:** `.filter(publication_year=">2014")` keeps only post-2015 research.

**"Israel" stripped from tags:** Prevents redundant `trauma AND Israel AND Israel` queries.

---

## 3. Candidate Generation + Hybrid BM25 + Embedding Ranking Pipeline

**Files:** `server/services/ranker.py`, `server/services/openalex_articles.py`, `server/routes/articles_route.py`

TF-IDF was replaced because it is purely keyword-based: "soldiers" and "veterans" score zero similarity, "PTSD" and "post-traumatic stress" are completely unrelated to it.

### How BM25 works

BM25 (Best Match 25) improves on TF-IDF in two ways:

**Term saturation:** Extra repetitions of a term barely increase the score after a few mentions — one focused mention is almost as strong as many.

**Document length normalisation:** Shorter, more focused abstracts are not penalised relative to long ones.

BM25 is still keyword-based — "soldiers" and "veterans" still score zero. Embeddings fix that.

### How sentence embeddings work

`all-MiniLM-L6-v2` (~90 MB) encodes the full text of each article into a 384-dimension dense vector capturing semantic meaning:

- "soldiers traumatized by combat" → vector A
- "veterans with PTSD from war" → vector B  
- A · B ≈ 1 (near-identical direction) → high cosine similarity

"October 7 survivors" matches "Nova festival victims". "children" matches "youth and adolescents". "EMDR" matches "eye movement desensitization" — without any synonym appearing in the text.

### Hybrid score

```
content_score = 0.5 × BM25_normalised + 0.5 × embedding_cosine
```

When BM25 finds no keyword matches (all scores zero), the embedding score is used at full weight so the output stays in [0, 1]. BM25 covers exact acronyms ("EMDR", "CBT", "IDF"); embeddings cover semantic relationships BM25 misses.

### Where the ranker runs

**At ingestion only.** `_rerank()` in `openalex_articles.py` runs the hybrid ranker once on the 40–80 candidate pool, stores `content_score` on each document, and writes only the top 15 to MongoDB.

`GET /api/articles` never runs the ML model. It reads stored `content_score` from MongoDB and applies the final formula purely arithmetically:

```
final_score = 0.60 × content_score   (stored at ingestion)
            + 0.25 × click_score     (click_count / 10, capped at 1.0)
            + 0.15 × recency_score   (publication year, normalised 2000–2026)
```

This means the articles page loads in milliseconds regardless of model size.

### Thread safety

The `SentenceTransformer` model is loaded lazily on first call and protected by a `threading.Lock` with double-checked locking — only one thread ever loads it.

---

## 4. Click Feedback Loop

**Files:** `server/routes/articles_route.py`, `client/src/pages/Articles/ArticlePage.jsx`

When a user clicks an article link the frontend fires a silent POST to `/api/articles/:id/click`. The server increments `click_count` on that MongoDB document by 1.

On the next page load, the final score formula picks up the updated `click_count`. An article with 4 clicks contributes +0.10; 10+ clicks contributes the maximum +0.25. No ML re-ranking is needed — only the arithmetic changes.

This is the **implicit feedback** pattern from recommender systems: user behaviour (clicks) becomes a relevance signal without any explicit rating.

---

## 5. Article Chat

**Files:** `server/routes/ai_assistant_route.py`, `client/src/pages/Articles/ArticleChatBubble.jsx`

A floating chat bubble on the articles page lets users ask questions about their personalised article set. Powered by Groq/LLaMA.

**How it works:**
1. All of the user's stored articles (up to 15, abstracts truncated to 400 chars each) are placed in the **system message**, which is static across turns — sent once per API call, not repeated in the user turn.
2. The AI's tone is calibrated to the user's persona: academic for researchers, simple and warm for beginners.
3. The last 4 conversation turns are sent as properly structured `user`/`assistant` messages.
4. The article list is cached server-side per user for 5 minutes — no DB round-trip on every chat message.
5. `max_tokens` is set to 800, giving the model room to reference multiple articles in a single response.

**Persona lookup:** The server looks up the user's persona using the JWT identity first, then falls back to the `quiz_user_id` supplied in the request body (needed while quiz sessions are stored under a separate UUID).

**Guard:** If the Groq API returns `choices = None` or empty content, the endpoint returns 503 with a clean message instead of crashing.

---

## 6. Session Storage Cache (Articles Page)

**File:** `client/src/pages/Articles/ArticlePage.jsx`

When articles load successfully they are written to `sessionStorage` under `articles_cache_<userId>` with a 5-minute timestamp. Subsequent page visits within that window return immediately from cache — no network request.

The cache is explicitly busted (removed + `bustCache: true` flag) after:
- Saving a changed topic profile
- Quiz retake (cleared in `ResultsPage` on the retake flow)

---

## 7. Skeleton Loading Cards

**Files:** `client/src/pages/Articles/ArticlePage.jsx`, `client/src/pages/Articles/ArticlePage.css`

While the articles fetch is in-flight the page renders four shimmer skeleton cards instead of a blank white area. The shimmer is a CSS `linear-gradient` animated with `background-position` — no JavaScript, no layout shift.

---

## 8. Crisis Distress Detection

**Files:** `server/utils/distress.py`, `server/routes/chat_route.py`

Every quiz message is scanned for distress signals before being passed to the AI.

**Weighted keyword scoring:**
```
"suicide"     → 10   "want to die"  → 10
"hopeless"    → 5    "can't go on"  → 5
"can't cope"  → 3    "overwhelmed"  → 2
```
Score ≥ 8 → Severe, ≥ 4 → Moderate, ≥ 2 → Mild. Level 2+ interrupts the quiz and returns Israeli crisis hotlines (ERAN 1201, NATAL 1800-363-363, SAHAR online chat).

Zero false-negatives by design — better to show a hotline to someone who doesn't need it than to miss someone who does.

---

## 9. Tag Quality Filtering

**Files:** `server/routes/chat_route.py`, `server/utils/chat_prompts.py`

Two-layer defence against generic tags:

**Layer 1 — Prompt:** The persona extraction prompt forbids generic tags (`"trauma"`, `"Israel"`, `"mental health"`, etc.) and lists good examples (`"PTSD"`, `"children"`, `"veterans"`, `"October 7"`, `"EMDR"`, `"CBT"`).

**Layer 2 — `_clean_tags()` filter:** Post-processing strips any tag matching a hardcoded generic set, deduplicates case-insensitively, and caps at 5 tags. Falls back to `primary_topic` if all tags are filtered.

---

## 10. Persona-Based UI Theming

**File:** `client/src/index.css`

Three visual themes applied via CSS custom properties on the `<html>` element:

| Persona | Background | Primary | Font | Radius |
|---|---|---|---|---|
| Beginner | `#fdf6ef` warm cream | `#c07840` terracotta | 17px | 14px |
| Informed Learner | `#f4f7f6` neutral | `#41645a` teal | 15px | 10px |
| Researcher | `#0f1a18` dark | `#4fc3a1` cyan | 15px | 4px |

All spacing, padding, and font sizes use `rem` — changing `html font-size` scales everything automatically. `PersonaProvider` sets `data-persona` on `<html>` and persists the persona to `localStorage` so the theme survives page refresh.

---

## 11. Persona-Based Animation System

**Files:** `client/src/pages/Articles/ArticlePage.css`, `client/src/index.css`

Animations are tiered by persona:

| Feature | Beginner | Informed Learner | Researcher |
|---|---|---|---|
| Article cards | Staggered slide-up, 50ms apart | Simple fade | None |
| Chat bubbles | Slide in from side | Fade in | None |
| Typing indicator | Breathing pulse | Breathing pulse | Static |
| Results hero | Scale + rise, children cascade | Fade in | None |

All animations use `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutQuint). A `prefers-reduced-motion` media query in `index.css` neutralises every animation app-wide — critical for a trauma platform where motion can be distressing.

---

## 12. Infrastructure

### Groq Client Singleton
`client_groq()` previously instantiated a new Groq HTTP client (with its own connection pool) on every request. Now a module-level singleton: `_groq_client = Groq(api_key=...)`. All routes import and reuse the same instance.

### Parallel PDF Fetching
PDF extraction for up to 15 articles now runs concurrently via `ThreadPoolExecutor(max_workers=8)`. Worst-case time drops from ~150 s (sequential, 10 s timeout each) to ~10 s.

### MongoDB Indexes
- `chat_collection`: `user_id` (unique), `completed`
- `token_blocklist_collection`: `revoked_at` (TTL 1 day), `jti` (unique)
- `articles_collection`: compound `{user_id, openalex_id}` (unique) — makes every article query and upsert use the index instead of a full collection scan

### Ollama Health Check Cache
`check_ollama()` made a blocking HTTP round-trip (5 s timeout) on every `/ai/assistant` request. Now cached with a 60-second TTL using `time.monotonic()`.

### Rate Limiter
`Flask-Limiter` was instantiated inside `chat_route.py` without being bound to the Flask app object. Fixed by moving it to `extensions.py` and calling `limiter.init_app(app)` in `app.py`. Chat endpoint now enforces 30 requests/hour/IP.

### MongoDB Startup Crash
`None` was passed to `MongoClient` when pool-size env vars were missing, crashing silently and leaving `mongo_client` undefined. Fixed with `_int_env()` helper that only passes parameters when present.

### OpenAlex Journal Field Crash
`work.get("primary_location", {}).get("source", {})` crashed when `primary_location` was `None`. Fixed with `or {}` guards:
```python
((work.get("primary_location") or {}).get("source") or {}).get("display_name")
```

---

## 13. Bug Fixes

### Articles Never Deleted on Quiz Reset
The delete route called `ObjectId(auth_user_id_str)` on a UUID string — always raised `InvalidId`, silently caught, articles never deleted. Fixed by querying with the string directly.

### Server Crash on Malformed Auth Requests
`request.get_json()` returns `None` on a missing body. `.get()` on `None` crashed the server. Fixed with `request.get_json() or {}` on register and login routes.

### Article Fetch: POST Failure Fell Through to GET
If the POST to trigger article ingestion returned a 500, `postRes.ok` was unchecked — the GET ran anyway, returned empty, user saw nothing with no error. Fixed by throwing on `!postRes.ok`.

### Wrong Login Redirect URL
Articles page redirected to `/login` (doesn't exist) instead of `/auth/login`. React Router fell through to the wildcard and sent users to the quiz.

### Persona Restored on Login (any device)
Quiz sessions are stored under a device-local UUID (`quiz_user_id`). On first login, the client sends this UUID; the server finds the completed session and returns `score` and `persona_profile`. It also writes `auth_user_id` onto that document. On every subsequent login — from any device — the server looks up by `auth_user_id` first, so no `quiz_user_id` is needed.

If the user retakes the quiz while already logged in, `postChat` sends the JWT; the server extracts the auth identity from it and stores `auth_user_id` on the new session at completion, so the link is established immediately rather than waiting for the next login.

A sparse index on `auth_user_id` in the chat collection keeps both lookups fast.

### OpenAlex Abstract Missing
`abstract_inverted_index` was not in the default pyalex field set. All articles stored with `abstract: null`. Fixed with an explicit `.select(_SELECT_FIELDS)` on every fetch.

### Article Chat: Abstract `None` Crash (second 500 error)
`a.get('abstract', 'No abstract.')[:400]` raised `TypeError: 'NoneType' object is not subscriptable` when MongoDB stores `{"abstract": null}` explicitly. `.get(key, default)` returns `None` (not the default) when the key exists but its value is `None` — it only falls back when the key is completely absent. Fixed with `(a.get('abstract') or 'No abstract.')[:400]`.

### Animation Scoping in Vite CSS Modules
`@keyframes` defined inside a CSS Module get locally hashed names. Global persona-selector overrides cannot target them reliably. Fixed by moving all quiz animations to `index.css` (global) and adding plain global class names alongside module classes.

---

## 14. All Changes Made (by file)

A flat reference of every file changed and exactly what was changed.

### Server

**`server/Requirements.txt`**
Restored deleted packages: `pyalex`, `pypdf`, `rank-bm25`, `sentence-transformers`, `scikit-learn`, `numpy`, `pandas`, `pytrends`, `semanticscholar`, `requests`. These are required by the ranking and article fetching pipeline and their absence caused import errors at startup.

**`server/services/openalex_articles.py`**
- Removed hardcoded debug PDF URL that overwrote the parameter on every call (was on line 18)
- `_rerank()` now stores `doc['content_score'] = float(score)` on each document at ingestion so the ranking result survives into MongoDB and the read path never needs to re-run the model
- Sequential PDF fetch loop replaced with `ThreadPoolExecutor(max_workers=8)` — worst-case time drops from ~150 s to ~10 s
- Removed `persona_query` and `cited_by_count` from stored documents (written but never read)

**`server/services/ranker.py`**
- Added `threading.Lock` with double-checked locking around the `SentenceTransformer` model load — prevents multiple threads from each loading the ~90 MB model simultaneously
- Fixed hybrid score range: when BM25 finds no keyword matches (all scores zero), returns embedding scores at full weight instead of `0.5 × 0 + 0.5 × emb`

**`server/services/groq.py`**
- `client_groq()` changed from a factory (new `Groq()` instance per call) to a module-level singleton — eliminates a new HTTP connection pool per request

**`server/services/ai_assistant.py`**
- `check_ollama()` now caches its result for 60 seconds — previously made a blocking HTTP call (5 s timeout) on every `/ai/assistant` request

**`server/services/mongo.py`**
- Added compound unique index `{user_id, openalex_id}` on `articles_collection`
- Added sparse index on `chat_collection.auth_user_id` — supports cross-device persona lookup without indexing documents that predate the feature
- `MongoClient` pool-size parameters now only passed when env vars are present (`_int_env()` helper) — previously passed `None`, crashing silently on startup

**`server/routes/articles_route.py`**
- Removed `import numpy as np` and `from services.ranker import hybrid_rank` — ML no longer runs on the read path
- `rank_articles()` rewritten: reads `content_score` stored at ingestion, applies the weighted formula arithmetically — page load no longer blocks on the embedding model
- Added `"content_score": 1` to the MongoDB projection in `get_articles()` so the field is actually returned to the sort function

**`server/routes/ai_assistant_route.py`**
- Added `return jsonify({"error": "Assistant unavailable."}), 500` to the bare `except` in `ai_assistant()` (was silently swallowing errors)
- Fixed crash when Groq returns `choices = None`: `choices = response.choices or []` before indexing
- Fixed IDOR: `quiz_user_id` from the request body was used directly to look up persona without verifying the caller's identity — now uses JWT identity first, body value only as fallback
- Fixed `TypeError: 'NoneType' is not subscriptable`: replaced `a.get('abstract', 'No abstract.')[:400]` with `(a.get('abstract') or 'No abstract.')[:400]`
- Added 5-minute in-process TTL cache for article DB reads (`_articles_cache`) — no DB round-trip on every chat message
- Moved articles context and tone into the system message (static per call); conversation history sent as structured `user`/`assistant` turns
- Removed arbitrary `[:10]` cap — AI now sees all stored articles (up to 15)
- Increased `max_tokens` from 600 to 800

**`server/routes/auth_route.py`**
- Login now queries by `auth_user_id` first (works from any device), falls back to `quiz_user_id` from the request body
- When session is found via `quiz_user_id`, writes `auth_user_id` to that document so future logins skip the fallback

**`server/routes/chat_route.py`**
- At quiz completion, if `Authorization: Bearer` header is present (user is already logged in), extracts `auth_user_id` from the JWT and stores it on the session document immediately — covers the retake-from-new-device case

### Client

**`client/src/utils/api.js`**
- `postChat()` now includes `Authorization: Bearer <token>` when the user is logged in, so the server can link the quiz session to the auth identity at completion

**`client/src/pages/Articles/ArticleChatBubble.jsx`**
- Fixed React Rules of Hooks violation: `useEffect` was declared after a conditional `return null`, crashing in React strict mode
- Added `quiz_user_id` to the POST body so the persona fallback lookup in `article-chat` works

**`client/src/pages/ResultsPage.jsx`**
- Session storage cache clear moved to a `finally` block so it runs even when the session-delete API call fails

**`client/src/index.css`**
- Researcher persona base font size changed from 13 px to 15 px

---

## 15. Calls Map System

**Files:** `server/routes/map_route.py`, `server/services/mongo.py` (`calls_collection`), `client/src/pages/CallsMapPage.jsx`, `client/src/components/map/MapView.jsx`, `client/src/components/map/InputsFilter.jsx`, `client/src/context/MapContext.jsx`

The calls map visualises historical ERAN/NATAL crisis-line call records stored in `calls_collection`. Each document holds `city`, `date`, `datetime`, `latitude`, `longitude`, `gender`, `age`.

**Two API endpoints:**

`GET /api/v1/calls-map?from=YYYY-MM-DD&to=YYYY-MM-DD&gender=male&gender=female`
— Returns one point per city with a total `count`. Accepts repeated or comma-separated `gender` params; normalises English aliases (`male`/`m`) to Hebrew DB values (`זכר`/`נקבה`).

`GET /api/v1/calls-map-aggregated?from=…&to=…&gender=…&ages=1,2,3`
— Groups by `(city, year, month)` using a MongoDB aggregation pipeline. Age groups are bucketed into 5 ranges (0–12, 13–17, 18–24, 25–40, 40+). Date strings are parsed into `dateObj` via `$dateFromString` inside the pipeline so string-stored dates can be range-queried. Returns month-by-month time series for timeline playback.

`GET /api/calls-map-dates` — returns `minDate`/`maxDate` to bound the date-range slider.

**Client timeline playback:** `CallsMapPage` builds a sorted array of `(year, month)` steps from the aggregated response, then steps through them on an interval when play is active. `MapContext` holds all shared filter state (gender, age groups, date range, step index, aggregated cache) so the filter drawer and map view stay in sync without prop-drilling.

---

## 16. Data Visualisation Graph Pages

**Files:** `server/routes/graphs_route.py`, `server/utils/graph_data.py`, `client/src/pages/IsraelWarPage.jsx`, `AddictionsPage.jsx`, `HealthPage.jsx`, `SleepPage.jsx`, `TrafficAccidentsPage.jsx`, `DomesticViolencePage.jsx`

Six static data pages serve pre-compiled datasets via `graphs_route.py`. Each endpoint (`/graphs/israel`, `/graphs/addictions`, etc.) imports and returns the matching constant from `graph_data.py` as JSON.

`graph_data.py` contains Python dicts for six topic areas (Israel war mental health, addictions, health system, sleep, traffic accidents, domestic violence). Each entry carries bilingual labels (`labels_he`/`labels_en`), `chart_type` (`risk_curve`, `causal_loop`, `risk_matrix`, `sankey_flow`, `network_graph`, `horizontal_bar`, etc.), numeric `values`, a `source` citation, and bilingual `explain_he`/`explain_en` paragraphs.

Each graph page renders its charts **inline** (no shared `EmbeddedChart` component): the page defines self-contained Recharts/SVG chart components plus a local `renderChart(chart, locale)` router that switches on `chart_type` — see `AddictionsPage.jsx` for the canonical pattern. (An earlier `EmbeddedChart.jsx` / `YouTubePlaceholder.jsx` design was removed; the current pages embed their own chart renderers.)

The data is static by design — sourced from the 2025 State Comptroller Report, Ministry of Health estimates, and peer-reviewed literature. No DB queries are needed at read time.

---

## 17. Google Trends Ingestion

**File:** `server/services/google_trends.py`

A standalone script (run manually or on a cron schedule) that pulls Google Trends data for Israeli trauma-related search terms into MongoDB.

**Flow:**
1. Connects to Google Trends via `pytrends` (`TrendReq(hl='en-US', tz=180)`).
2. Iterates over `GROUPS` dict — each group is a list of Hebrew search terms (currently `Trauma_Index: ["טראומה"]`). Fetches `today 1-m` window, `geo=IL`.
3. Retries on `ResponseError` (429/503) using `tenacity` exponential back-off (2× multiplier, 10–60 s, 3 attempts).
4. Averages keyword scores within each group into a single index column.
5. Bulk-upserts into `trends_collection` by `date` — idempotent, so re-running never duplicates rows.

`GET /api/trends` returns all rows with `_id` stripped. The client reads `features` (all non-date keys) from the first row to know which series to render.

---

## 18. Results Page

**Files:** `client/src/pages/ResultsPage.jsx`, `client/src/components/results/BeginnerResults.jsx`, `InformedResults.jsx`, `ResearcherResults.jsx`, `client/src/components/results/resultsCopy.js`, `natalData.js`, `NatalCharts.jsx`, plus the card components (`GuardianCard.jsx`, `GuardianCardVertical.jsx`, `AcademicCard.jsx`, `AcademicCardTeal.jsx`, `ArticleRow.jsx`).

`ResultsPage` is the landing page after quiz completion or login redirect. It resolves the score from three sources in priority order:
1. React Router `location.state.score` — passed directly from the quiz on completion.
2. `localStorage` (`SCORE_CACHE_KEY`) — survives a hard refresh mid-session.
3. `GET /result/<user_id>` — fetched from MongoDB when neither of the above is available (e.g. direct URL navigation).

The resolved **persona** (from `persona_profile.persona`, falling back to score→persona) selects one of three self-contained wrapper components — `BeginnerResults`, `InformedResults`, or `ResearcherResults`. Each owns its entire layout (hero + persona/tags + content sections); there are no separate Hero/PersonaCard/ScoreNContent files. (Earlier `BeginnerHero.jsx` etc. exist in the tree but are **not** imported by the current results components — dead.)

**Bilingual copy** lives in `resultsCopy.js` (hero copy per persona × locale × `emotional_state`, plus section headings) and in the shared `config/uiStrings.js` table (nav/edit-tags/CTA/"also explore" chrome). Components read `useDirection()` for the active locale.

**Preference-driven content:** `natalData.js` defines `PREF_COUNTS` (per `content_preference`: how many Guardian stories, OWID charts, NATAL research charts, and academic articles to show) plus the hardcoded NATAL Israel-cohort dataset (charts + prose stat blocks, sourced from Mor et al., 2026). `NatalCharts.jsx` renders those charts with the same inline-Recharts/SVG method as the graph pages, tinted per persona. ResultsPage fetches live articles (`getArticles`) and, for non-researcher personas, Guardian stories (`getExternalStories`); each component slices to the preference counts (no backfill).

**Retake flow:** The retake button calls `resetQuizSession()` (deletes the quiz session + clears cached transcript/score/persona) then hard-navigates to `/`.

---

## 19. Session Score Recovery

**File:** `server/routes/chat_score_route.py`

`GET /result/<user_id>` fetches the final score and `persona_profile` for a completed quiz session identified by its UUID. Returns 400 if the session exists but the quiz is not yet finished. Used by `ResultsPage` to recover state after a hard page refresh when the in-memory score is gone.

---

## 20. Session Delete

**File:** `server/routes/delete_session.py`

`DELETE /session/<user_id>` — JWT optional. Deletes the quiz session document by UUID (`user_id`). If a valid JWT is present, also deletes all articles stored under that `auth_user_id`. Articles are only cleaned up when auth is present because they are keyed by the MongoDB ObjectId, not the quiz UUID.

---

## 21. JWT Blocklist

**File:** `server/jwt_blocklist.py`

Revoked JWTs are persisted to `token_blocklist_collection` so they remain invalid across server restarts. An in-memory `set` acts as a fast-path cache: `is_jti_revoked` checks the cache first and only queries MongoDB on a miss, then populates the cache. `revoke_jti` writes to both. The MongoDB TTL index on `revoked_at` auto-expires entries after 1 day, bounding collection growth.

---

## 22. Direction / Locale System

**Files:** `client/src/context/DirectionProvider.jsx`, `client/src/context/directionContext.js`, `client/src/context/useDirection.js`, `client/src/config/storageKeys.js`, `client/src/config/uiStrings.js`

The app is fully bilingual (Hebrew / English). `DirectionProvider` reads the preferred locale from `localStorage` on mount (with a legacy key migration from `TEXT_DIR_KEY` to `UI_LOCALE_KEY`). On locale change it sets `dir` and `lang` attributes on `<html>` so all CSS RTL/LTR rules apply automatically and the browser spell-checker uses the right language.

`getUiStrings(locale)` returns the full string table for the selected locale. Components call `useDirection()` to get `{ dir, locale, setLocale, toggleLocale }` — the Navbar toggle calls `toggleLocale`.

---

## 23. Application Routing

**File:** `client/src/App.jsx`

React Router v6 `<Routes>` tree. All routes are flat (no nested layouts). `GuestRoute` wraps `/auth/login` and `/auth/register` — redirects authenticated users away. All unknown paths fall through to `<Navigate to="/" replace />`.

Three React context providers wrap the entire tree: `PersonaProvider` (outermost), `DirectionProvider`, `MapProvider`.

**Route map:**

| Path | Component |
|---|---|
| `/` | `QuizPage` |
| `/results` | `ResultsPage` |
| `/articles` | `ArticlePage` |
| `/map` | `CallsMapPage` |
| `/graphs/israel` | `IsraelWarPage` |
| `/graphs/addictions` | `AddictionsPage` |
| `/graphs/health` | `HealthPage` |
| `/graphs/sleep` | `SleepPage` |
| `/graphs/traffic` | `TrafficAccidentsPage` |
| `/graphs/domestic-violence` | `DomesticViolencePage` |
| `/trends` | `ExploreSearchPage` |
| `/auth/login` | `Login` (GuestRoute) |
| `/auth/register` | `Register` (GuestRoute) |

---

## 24. MongoDB Collections

| Collection | Purpose | Key indexes |
|---|---|---|
| `conversation` | Quiz sessions (one per user UUID) | `user_id` (unique), `completed`, `auth_user_id` (sparse) |
| `users` | Auth accounts | — |
| `articles` | Ranked articles per user | `{user_id, openalex_id}` compound unique |
| `calls` | Crisis-line call records for the map | queried by `date` / `dateObj`, `gender`, `age` |
| `trends` | Google Trends time series | `date` (unique) |
| `token_blocklist` | Revoked JWT JTIs | `revoked_at` (TTL 1 day), `jti` (unique) |
| `ai_assistant` | (reserved) | — |

---

## 25. Health Check

**File:** `server/routes/keep_alive.py`

`GET /health` returns `{"status": "ok"}`. Used by uptime monitors and deployment health checks to confirm the Flask server is accepting connections.
