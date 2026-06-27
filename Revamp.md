# Full Revamp Plan — Trauma Education Platform
# Planned over ~1 hour of detailed discussion

---

## Context & Motivation

The current system assigns users one of 3 personas (beginner / informed learner / researcher) but barely uses that information. The quiz collects 5 fields but only `persona` reaches the article chat — everything else (`preferred_content`, `interest_tags`, `primary_topic`) is stored in MongoDB and then ignored. The adaptive UI applies the same layout for all 3 personas and only changes colors and font size, which isn't impressive or meaningful. The results page is a thin redirect, not a real destination. This revamp makes the collected data actually drive the experience end-to-end across every system: quiz extraction, article ranking, RAG chat, and a completely redesigned results page that serves as the user's main destination.

---

## PART 1 — QUIZ: SMARTER EXTRACTION (NO EXTRA QUESTIONS)

### The Problem
The quiz currently asks 5 questions and extracts 5 fields. But two of those fields (`preferred_content` and the implicit `reason_for_visit`) are redundant and overlap heavily. More importantly, the LLM already has enough signal in the 5 answers to tell us the user's emotional state and why they're here — we just aren't asking it to extract those things.

### The Solution
Keep exactly 5 questions. Change what the LLM extracts from the same conversation. No extra questions means no extra friction for users who may already be in a fragile emotional state.

### New Extracted Fields (replacing old 5-field schema)

**Old schema:**
```json
{
  "persona": "beginner",
  "interest_tags": ["PTSD", "children"],
  "preferred_content": "personal stories and basic explanations",
  "primary_topic": "children",
  "search_query": "trauma AND Israel AND children AND ..."
}
```

**New schema:**
```json
{
  "persona": "beginner",
  "emotional_state": "grieving",
  "content_preference": "stories",
  "interest_tags": ["PTSD", "children", "October 7"],
  "primary_topic": "children",
  "search_query": "trauma AND Israel AND children AND ..."
}
```

### Field Definitions

**`persona`** (unchanged)
- Values: `"beginner"` | `"informed learner"` | `"researcher"`
- Drives: entire results page layout, article page layout, RAG tone
- Existing classification logic in `PERSONA_PROFILE_SYSTEM_PROMPT` stays the same

**`emotional_state`** (NEW)
- Values: `"grieving"` | `"distressed"` | `"curious"` | `"professional"` | `"neutral"`
- How to infer from conversation:
  - `"grieving"` — user mentions personal loss, a family member, October 7 personally, bereavement
  - `"distressed"` — signs of current active struggle, overwhelm, crisis language (note: distress.py already catches crisis keywords and interrupts the quiz — emotional_state="distressed" is for sub-threshold cases)
  - `"curious"` — explicitly exploratory, intellectual, enthusiastic about learning, asks broad questions
  - `"professional"` — detached clinical framing, uses third-person ("my clients", "the population I work with"), no personal emotional language
  - `"neutral"` — no strong emotional signal either way, matter-of-fact tone, most common case
- Default fallback if LLM omits: `"neutral"`
- Drives: RAG chat tone and emotional guidance, results page hero copy tone, article ranking boost for support articles

**`content_preference`** (NEW — replaces both `preferred_content` and implicit `reason_for_visit` which were redundant)
- Values: `"stories"` | `"research"` | `"mixed"`
- How to infer from conversation:
  - `"stories"` — user wants human accounts, personal testimonies, accessible journalism, came for personal reasons
  - `"research"` — user wants data, statistics, academic papers, clinical frameworks, came for professional/academic reasons
  - `"mixed"` — user wants both, or is unclear
- Default fallback if LLM omits: `"mixed"`
- Drives: content mix on results page (how many Guardian stories vs OWID charts vs academic previews), article ranking boost, RAG chat style

**`interest_tags`** (unchanged in structure, more important in usage)
- Values: 3-5 specific topic tags e.g. `["PTSD", "children", "October 7", "veterans", "EMDR"]`
- NOT generic: "trauma", "Israel", "mental health", "psychology" are filtered by `_clean_tags()` in `chat_route.py` (existing logic, keep it)
- `_clean_tags()` also deduplicates case-insensitively and caps at 5 tags
- Drives: article fetching queries (one query per tag), Guardian story fetching, displayed as pills on results page and article cards

**`primary_topic`** (unchanged in structure, elevated in importance)
- Value: single most specific topic e.g. `"children"` or `"PTSD treatment"` or `"October 7 survivors"`
- This is the MOST IMPORTANT signal for content fetching — it gets the highest weight in article search and is the primary filter for Guardian API queries
- The `interest_tags` are supporting topics around this anchor
- Drives: Guardian API query (primary filter), article ranking weight, results page hero copy

**`search_query`** (unchanged, but demoted — internal use only)
- Value: OpenAlex Boolean query string e.g. `"trauma AND Israel AND children AND (PTSD OR anxiety OR treatment)"`
- Used ONLY for: OpenAlex article fetching at ingestion. (DESCOPED 2026-06-27: the researcher results-page clipboard-copy of this query was removed — query is internal-only now.)
- NOT used for: RAG chat, ranking, Guardian fetching, anything else
- Existing `_ISRAEL_TERMS` filter in `build_query()` still strips "Israel" from tags to prevent redundant queries

### Implementation: Extraction Prompt Changes

**File:** `server/utils/chat_prompts.py`

The `PERSONA_PROFILE_SYSTEM_PROMPT` (currently lines 38-107) needs these additions:

1. Add `emotional_state` field definition with signal examples for each value
2. Add `content_preference` field definition replacing `preferred_content`
3. Remove `preferred_content` (replaced by `content_preference`)
4. Keep all existing persona classification logic (beginner/informed/researcher signals at lines 40-66 are good and stay)
5. Keep existing edge case rules (lines 67-75: when in doubt between personas, choose the less specialized one)
6. Update the output JSON example to show the new 6-field schema

**File:** `server/routes/chat_route.py`

Update `parse_persona_profile()` (currently lines 111-135):
- Add parsing for `emotional_state` with fallback to `"neutral"`
- Add parsing for `content_preference` with fallback to `"mixed"`
- Remove parsing for `preferred_content`
- Keep all other parsing logic

The session document saved to MongoDB at completion (line 308: `"persona_profile": persona_profile`) will now contain the new fields automatically since it saves the full dict.

---

## PART 2 — QUIZ: SMARTER MID-CONVERSATION ADAPTATION

### The Problem
Currently the dynamic question generation (Call 1 in `chat_route.py`) generates follow-up questions based on the full conversation history but the system prompt doesn't give the LLM any guidance on HOW to adapt based on what it heard. Q2 might ask about professional background even when Q1 made it clear the user is a grieving parent — that's tone-deaf.

### The Solution
Update the dynamic question generation system prompt in `chat_prompts.py` to include adaptation rules:

- If Q1 mentions personal loss, grief, family, October 7 personally → Q2 probes emotional context gently ("How has this been affecting you or your family?"), does NOT immediately jump to professional background questions
- If Q1 sounds professional/clinical ("my clients", "the people I work with", "for my research") → Q2 immediately explores work context ("What's your professional role?", "What kind of support do you provide?")
- If Q1 is vague, very short, or exploratory → Q2 asks a broader follow-up to give the user room to share more before narrowing
- The LLM should read the TONE of Q1 and match it — don't be clinical with someone who's emotional, don't be overly warm with someone who's being academic

This is a prompt-only change in `chat_prompts.py`. No structural code changes needed.

---

## PART 3 — RAG / ARTICLE CHAT: WIRE ALL FIELDS INTO SYSTEM PROMPT

### The Problem
`server/routes/ai_assistant_route.py` currently extracts only `persona` from the user's session (line 79):
```python
persona = (session.get("persona_profile") or {}).get("persona", "informed learner")
```
The remaining 5 fields are stored in MongoDB but never reach the article chat LLM. The tone system is 3 hardcoded strings:
- researcher: "Use academic language. Be precise and data-focused. Reference specific articles by number."
- beginner: "Use simple, warm language. Avoid jargon. Explain concepts clearly and gently."
- informed learner: "Balance accessibility with depth. Reference specific articles when relevant."

This is too shallow — a grieving beginner and a curious beginner get identical responses.

### The Solution

**File:** `server/routes/ai_assistant_route.py`

Expand session field extraction (after line 79):
```python
profile = session.get("persona_profile") or {}
persona = profile.get("persona", "informed learner")
emotional_state = profile.get("emotional_state", "curious")
content_preference = profile.get("content_preference", "mixed")
primary_topic = profile.get("primary_topic", "")
interest_tags = profile.get("interest_tags", [])
```

Build `emotional_guidance` string based on `emotional_state`:
- `"grieving"` → "This user may be processing personal loss. Be gentle and warm. Validate their emotional experience before presenting facts. Do not lead with statistics or clinical language. If they seem overwhelmed, it is appropriate to mention ERAN 1201 (crisis support line)."
- `"distressed"` → "This user may be struggling. Keep responses short, clear, and warm. Avoid overwhelming them with information. If crisis language appears, mention ERAN 1201."
- `"curious"` → "This user is exploring intellectually. Be engaging, thorough, and willing to go deep on topics they ask about."
- `"professional"` → "This user works with trauma survivors professionally. Focus on practical clinical frameworks, intervention strategies, and citable findings they can use with clients. Be direct and information-dense."
- `"neutral"` → "This user has not expressed strong emotional signals. Be informative, clear, and balanced. Match their tone." (default — most common case)

Build `tone` string based on `persona` AND `emotional_state` together (not just persona alone):
- researcher + professional/curious/neutral → "Use academic language. Be precise and data-focused. Reference specific articles by number."
- researcher + grieving/distressed → "Be precise but compassionate. This researcher may have a personal connection to the topic."
- beginner + grieving/distressed → "Use very simple, warm language. No jargon at all. Lead with empathy before information."
- beginner + curious → "Use simple, friendly language. Explain concepts clearly. Make it accessible and engaging."
- beginner + neutral → "Use simple, clear language. Be welcoming and informative without being clinical."
- informed learner + any → "Balance accessibility with depth. Reference articles when relevant. Match the user's tone."

Rebuild `system_content` to include all signals:
```python
system_content = (
    f"You are an assistant helping a user explore academic articles about trauma in Israel.\n\n"
    f"User profile:\n"
    f"- Persona: {persona}\n"
    f"- Emotional state: {emotional_state}\n"
    f"- Main topic of interest: {primary_topic}\n"
    f"- Also interested in: {', '.join(interest_tags)}\n"
    f"- Content preference: {content_preference}\n\n"
    f"Tone: {tone}\n"
    f"Emotional guidance: {emotional_guidance}\n\n"
    f"Answer only based on the articles below. If the question is unrelated, say so briefly.\n\n"
    f"Articles:\n{articles_context}"
)
```

The article context format stays the same (numbered, title + year + 400 char abstract). The `max_tokens` stays at 800. The 5-minute server-side article cache stays.

---

## PART 4 — ARTICLE RANKING: PERSONA BOOST + MATCHED TAGS

### The Problem
`rank_articles()` in `server/routes/articles_route.py` uses this formula:
```
final_score = 0.60 × content_score + 0.25 × click_score + 0.15 × recency_score
```
This is the same for every user regardless of emotional state or content preference. A grieving user and a clinical researcher with the same interest tags get identical article ordering.

### Solution A — Persona Boost Term

Extend `rank_articles()` signature:
```python
def rank_articles(articles, user_tags, emotional_state="curious", content_preference="mixed"):
```

New formula:
```
final_score = 0.60 × content_score
            + 0.25 × click_score
            + 0.05 × recency_score      (reduced from 0.15 — recency matters less than persona fit)
            + 0.10 × persona_boost      (NEW — bumped from 0.05 to be noticeable)
```

`persona_boost` computation rules (simple keyword matching on abstract, no ML):
- `content_preference = "stories"` → boost articles whose abstract contains: "case study", "narrative", "interview", "testimony", "survivor", "personal account", "qualitative"
- `content_preference = "research"` → boost articles whose abstract contains: "prevalence", "epidemiological", "randomized", "meta-analysis", "systematic review", "cohort", "longitudinal"
- `emotional_state = "grieving"` or `"distressed"` → boost articles with: "support", "intervention", "treatment", "therapy", "recovery", "coping", "resilience"; demote purely epidemiological abstracts
- `emotional_state = "professional"` → boost articles with: "clinical", "framework", "protocol", "evidence-based", "intervention", "efficacy"

**IMPORTANT — MongoDB projection fix:** `persona_boost` requires keyword matching on abstract text at request time. The current MongoDB projection in `get_articles()` does NOT return `abstract`. Must add `"abstract": 1` to the projection in `articles_route.py` or `persona_boost` will silently fail (all boosts will be 0).

Pass `emotional_state` and `content_preference` into `rank_articles()` by reading them from the user's session at request time in the `GET /api/articles` handler.

### Solution B — Matched Tags

After ranking, compute which of the user's `interest_tags` appear in each article:

```python
for article in ranked:
    article["matched_tags"] = [
        tag for tag in user_tags
        if tag.lower() in (article.get("title") or "").lower()
        or tag.lower() in (article.get("abstract") or "").lower()
    ]
```

Return `matched_tags` with each article in the API response. The client renders these as small pills on each article card — both on the results page article previews AND on the full articles page. This tells the user exactly why each article was included in their set.

---

## PART 5 — GUARDIAN API INTEGRATION

### Why Guardian
The Guardian API is free (12 calls/second, 5000/day), returns full article content, covers Israel/trauma topics well, and writes accessibly for non-academic audiences. It's the right source for beginners and informed learners who want readable journalism rather than academic abstracts.

### New Backend Route

**New file:** `server/routes/external_content_route.py`

Endpoint: `GET /api/external/stories?topic=<primary_topic>`

**No Hebrew translation.** Translating trauma/October 7 content about specific people, places, and operations via LLM is too risky on a platform where mistranslation could genuinely distress users. Guardian stories are English-only. Translation can be added later with proper QA. The fallback (return English) is not good enough here — we just don't translate at all for now.

Full flow:
1. Normalize topic: `topic.lower().strip()` before using as cache key — prevents cache misses from casing differences
2. Check MongoDB `guardian_cache` collection — document structure: `{topic, stories, fetched_at}` with TTL index of 1 hour on `fetched_at`. Using MongoDB (not in-process dict) so cache survives server restarts (Render free tier sleeps and restarts frequently, which would otherwise cause burst API calls)
3. Cache hit → return stored stories immediately
4. Cache miss → Query Guardian API: `https://content.guardianapis.com/search` with params:
   - `q`: `f"{topic} Israel trauma"`
   - `section`: `world`
   - `show-fields`: `thumbnail,trailText,headline`
   - `page-size`: 3
   - `api-key`: from environment variable `GUARDIAN_API_KEY`
5. Parse response: extract headline, trailText (summary), thumbnail URL, webUrl, webPublicationDate
6. Upsert result into `guardian_cache` collection with current timestamp
7. Return array of story objects: `{headline, summary, thumbnail, url, date, source: "The Guardian"}`

**Fallback behavior:**
- Guardian API returns 0 results → return empty array, don't cache empty result (try again next request)
- Guardian API fails/times out → return empty array
- Client receives empty array → stories block simply doesn't render, no error message shown to user

**Register route** in `server/app.py` alongside other blueprints.

**New MongoDB collection:** `guardian_cache` — add to `server/services/mongo.py` with TTL index on `fetched_at` (1 hour) and unique index on `topic`.

---

## PART 6 — OWID CHART INTEGRATION

### Why OWID
Our World in Data charts are beautiful, credible, automatically updated, free to embed, and trusted by researchers and general audiences alike. No API key needed — just iframe embeds. Far superior to the static `graph_data.py` charts already in the codebase.

### Approach
Three hardcoded iframe URLs, one per persona. The persona drives which chart is shown — no dynamic selection logic needed:

| Persona | Chart Topic | Why This Chart |
|---|---|---|
| Beginner | Share of population with mental health disorders (global) | Relatable — shows "you're not alone", accessible framing, not scary |
| Informed Learner | PTSD prevalence by country | Contextualizes Israel in a global picture, professional-level data |
| Researcher | DALYs from mental and substance use disorders | Epidemiological, burden-of-disease framing, exactly what researchers cite |

These 3 charts are always relevant to a trauma platform regardless of the user's specific `primary_topic` or `interest_tags`. Hardcoding them means zero maintenance, no broken links from failed topic-matching logic, and predictable behavior.

### Client Implementation

New component: `client/src/components/results/OwidChart.jsx`

- Renders an iframe with the appropriate OWID URL based on `persona` prop
- Loading state: skeleton shimmer placeholder (same CSS technique already used in ArticlePage.jsx — reuse it)
- Failure state: if iframe fires onerror or times out → hide iframe, show a single line of text: "Data visualization temporarily unavailable." — no broken frame, no empty white box
- Caption below iframe explaining what the chart shows (hardcoded per persona, bilingual)
- Responsive: iframe fills container width, fixed height

---

## PART 7 — RESULTS PAGE: FULL REDESIGN

### The Core Idea
The results page is currently a thin card that shows the user their persona and redirects them to articles. We are making it a **destination** — a page where the user spends real time, feels genuinely understood, and gets immediate value before clicking anywhere else.

### What Every Results Page Contains

These are the building blocks. Layout, order, visual weight, and styling differ completely per persona:

**1. Hero Section**
- Persona label (displayed as a badge/chip)
- AI-generated dynamic headline — **generated during Call 2 at quiz completion** (NOT at results page load time — generating it fresh on every results load would add Groq latency at exactly the moment users are most eager to see results). Stored in the session document as `"headline"` field alongside `persona_profile`. Results page simply reads it from MongoDB. Examples:
  - Grieving beginner, primary_topic "children": "We're here with you. We've found accessible resources about children and trauma."
  - Curious informed learner, primary_topic "veterans": "Here's a balanced view of veteran trauma — stories, data, and research."
  - Professional researcher, primary_topic "PTSD treatment": "Your research profile: PTSD treatment in conflict-affected populations."
- Interest tag pills labeled "Your focus areas:" — displays all `interest_tags`

**2. Guardian Story Cards** (Beginner: 2 stories, Informed Learner: 1-2 stories, Researcher: none)
- Thumbnail image, headline (may be Hebrew-translated), 2-line summary, "The Guardian" source label, publication date, "Read story →" link
- Must be visually distinct from academic cards — different card shape, color, typography treatment so users instantly know it's journalism not academic content

**3. OWID Chart** (all personas)
- Iframe embed, persona-specific chart
- Loading skeleton while iframe loads
- Graceful text fallback if it fails

**4. Academic Article Preview Cards** (all personas, varying density)
- Title, year, journal name, first author, 2-line abstract excerpt, matched tag pills, "Read article →" link
- Must be visually distinct from Guardian cards
- Researcher version: denser — also shows DOI (copyable), abstract expands on click

**5. "Adjust Your Topics" Inline Panel**
- Subtle trigger (pencil icon + "Adjust topics" text — NOT a prominent button)
- Opens inline on the page, no navigation away
- Shows current interest tags as removable pills
- Input to add new tags (max 5 total)
- **On save — two-step approach (NOT triggering full re-ingestion):**
  - Step 1: Update stored tags in the session document via a lightweight PATCH endpoint (no OpenAlex, no ML)
  - Step 2: Re-rank the already-stored articles client-side using updated `matched_tags` recomputation only — fast, no server round-trip for ranking
  - Full re-ingestion (OpenAlex + BM25 + embedding, ~10s) only triggers if user explicitly clicks a separate "Refresh my article set" button — clearly labeled so expectations are set
  - Busts `articles_cache_<userId>` in sessionStorage
- Reuses tag editing logic already built in ArticlePage.jsx profile tab

**6. "Also Explore" Section** (bottom of all personas)
- Subtle discovery section — gentle prompts not navigation pressure
- Three links with brief descriptions:
  - **Interactive Map** — "See crisis call patterns across Israeli cities over time"
  - **Trends** — "Explore how trauma-related searches have changed in Israel"
  - **Data Graphs** — "Browse data on mental health, addictions, sleep, and more"
- Beginner/Informed: icons + descriptions, warm presentation
- Researcher: text links only, minimal chrome

**7. CTA to Full Articles Page**
- Beginner: large warm button "Explore your full reading list →"
- Informed Learner: "See your curated article set →"
- Researcher: "Open your article set →" as a text link, not a prominent button

**8. Navbar**
- Adapts visually to each persona's color theme
- Light navbar for beginner and informed learner
- Dark navbar for researcher (matches dark background)

### Content Mix Per Persona

The `content_preference` field fine-tunes within each persona's baseline:

| Persona | Baseline | content_preference="stories" adjustment | content_preference="research" adjustment |
|---|---|---|---|
| Beginner | 2 Guardian + 1 OWID + 2-3 academic | 2 Guardian (no change, already story-focused) | 1 Guardian + 1 OWID + 3 academic |
| Informed Learner | 1-2 Guardian + 1 OWID + 2 academic | 2 Guardian + 1 OWID + 1 academic | 1 Guardian + 1 OWID + 3 academic |
| Researcher | 0 Guardian + 1 OWID + 3 academic | No change (researchers don't get stories regardless) | No change |

### Per-Persona Experience in Detail

#### BEGINNER RESULTS PAGE

**Who:** New to trauma topics. Possibly grieving or emotionally affected. Came for personal reasons. Not academic. Needs to feel safe and understood first, informed second.

**Emotional state handling:**
- `emotional_state = "grieving"` → hero headline is soft and warm ("We're here with you..."), copy acknowledges their experience before presenting information
- `emotional_state = "distressed"` → similar to grieving, ERAN 1201 mention woven naturally into the page (not as a warning banner — as a resource)
- `emotional_state = "curious"` → more inviting and exploratory ("Here's what we found about...")

**Page flow:**
1. Hero — persona badge, warm dynamic headline, interest tag pills
2. "Stories for you" section — 2 Guardian story cards (primary content for this persona)
3. "Did you know?" section — OWID chart with accessible caption ("Data showing how common these experiences are worldwide")
4. "Start reading" section — 2-3 academic article preview cards shown accessibly (big title, readable abstract, warm CTA button per card)
5. "Adjust your topics" subtle control
6. Big warm CTA button to articles page
7. "Also explore" section

**Visual direction (to be finalized in Claude Design session):**
- Warm, safe, human — magazine or supportive blog feel
- Generous whitespace — nothing crammed or overwhelming
- Big readable typography
- Rounded corners everywhere
- Soft shadows
- Nothing clinical, nothing cold

#### INFORMED LEARNER RESULTS PAGE

**Who:** Some knowledge — social worker, journalist, teacher, student. Professional or mixed reasons. Wants both human context AND data. Capable and engaged.

**Emotional state handling:**
- `emotional_state = "professional"` → copy is more structured ("Here's your learning path...")
- `emotional_state = "curious"` → slightly warmer ("Here's a balanced look at...")
- `emotional_state = "grieving"` → acknowledge personal connection while maintaining professional framing

**Content preference label in hero:**
- `content_preference = "stories"` → "Showing you: stories with supporting research"
- `content_preference = "research"` → "Showing you: research with human context"
- `content_preference = "mixed"` → "Showing you: a balanced mix of stories and research"

**Page flow:**
1. Hero — persona label, dynamic headline, content preference label, interest tag pills
2. Mixed content section — Guardian story cards + academic previews interleaved or in clear sections ("Human Context" + "Go Deeper")
3. OWID chart with contextual caption ("Contextualising trauma prevalence globally")
4. "Adjust your topics" subtle control
5. CTA to articles
6. "Also explore" section

**Visual direction (to be finalized in Claude Design):**
- Structured, organized, professional but not cold
- Clear section headers
- Two-column layout feels natural here (but Claude Design decides)
- Neither too emotional nor too clinical
- Balance is the key word

#### RESEARCHER RESULTS PAGE

**Who:** Academic, clinician, serious researcher. Came for research/professional reasons. Wants maximum information density. No hand-holding. Treats this as a tool not a product.

**Emotional state handling:**
- `emotional_state` is extracted but **NEVER displayed on the results page when `persona == "researcher"`** — full stop, regardless of `content_preference`. No researcher wants to see their emotional state labelled on a research tool. The hiding logic is `if persona == "researcher": omit emotional_state from profile card display` — not tied to content_preference at all.
- The emotional guidance still affects RAG chat tone but is invisible on the results page for researchers

**Profile card displayed at top:**
All extracted fields shown as a clean data display:
- Persona: Researcher
- Primary topic: [value]
- Focus areas: [interest_tags as pills]
- Content preference: [value]
- OpenAlex search query: DESCOPED 2026-06-27 — NOT displayed on the results page (was: monospace code block with copy button)
- emotional_state: HIDDEN (see above)

**Page flow:**
1. Extracted profile card (all fields, clipboard for search query) — immediate, no animation
2. OWID chart — epidemiological DALYs chart with technical caption
3. Article list — dense table/list format:
   - Each article on its own row
   - Columns: Title (linked) | Year | Journal | First Author | DOI (copy button) | Matched tags (pills)
   - Abstract hidden by default, expands inline on row click
   - Alternating row styling for readability
4. Minimal "Adjust your topics" control
5. Text link CTA to articles
6. "Also explore" — text links only

**Visual direction (from approved design):**
- Light tool aesthetic — background `#eef3f5`, IBM Plex Mono + IBM Plex Sans
- Blue-teal accent `#2f6675` (NOT green — green is P1/P2 only)
- Dense, information-first
- Sharp corners (4–8px border radius maximum)
- No illustrations, no decorative elements
- No animations
- Immediate display of everything
- Feels like an academic database or research tool
- Credibility over beauty

### Fallback States (All Personas)

These must be handled gracefully on every persona's page:
- **Guardian API fails or returns 0 results** → stories section simply doesn't render. No error message. No empty box. The page still looks complete without it.
- **OWID iframe fails to load** → hide iframe, show one line: "Data visualization temporarily unavailable." No broken frame.
- **OWID iframe loading** → skeleton shimmer placeholder while it loads (same technique as ArticlePage.jsx article card skeletons)
- **No matched tags on an article** → matched_tags pills section simply doesn't render on that card. No empty pill row.
- **Guardian stories are English-only** — no translation. Hebrew UI users see English Guardian cards. This is intentional.

### RTL / Hebrew Considerations

- All layouts must work mirrored for Hebrew (RTL) mode
- Guardian story cards are always in English (no translation) — card layout must handle English text inside an otherwise RTL page without breaking alignment
- Interest tag pills flow RTL in Hebrew mode
- Two-column layouts (informed learner) flip columns in RTL
- The `DirectionProvider` already sets `dir` and `lang` on `<html>` — CSS RTL rules inherit from this automatically

---

## PART 8 — VISUAL DESIGN SESSION

### Why Design Before Implementation
The results page is a visual-first problem. Building components before the design is approved wastes effort — we'd have to rebuild them. The right order is: design → backend (parallel) → frontend against approved mockups.

### What We're Designing
3 full-page desktop mockups of the results page — one per persona. Nothing else (article page layout stays as-is for now).

### Claude Design Brief

Paste this entire brief into Claude Design:

---

**Product Background:**
This is a trauma education platform for Israeli users dealing with the psychological aftermath of events like October 7, ongoing conflict, and related trauma. The platform helps people understand trauma — whether they're personally affected, working professionally with trauma survivors, or researching the topic academically.

The core flow: user completes a 5-question conversational quiz → AI extracts their profile → they land on a Results Page which is their **main destination**. This is not a redirect page — it's where the user spends meaningful time. It shows personalized content based on everything the quiz learned about them.

The platform serves 3 radically different user types:
- A grieving mother who lost her son in October 7 and wants to understand what he went through
- A social worker who supports trauma survivors professionally and needs clinical resources
- A PhD researcher studying PTSD prevalence in conflict zones

These 3 users should feel like they're using a completely different product when they land on their results page — same platform, radically different experience. The design must be sensitive, trustworthy, and credible. This is a serious topic — nothing should feel gamified, cheap, or dismissive. The platform is bilingual Hebrew/English and must support RTL layouts.

This is a React app using custom CSS. No Tailwind, no component library.

---

**What the Results Page Contains:**

The page is built from these content blocks — how they're presented, ordered, weighted, and styled should be completely different per persona. You decide the design. Here are the building blocks:

- **Hero section** — contains: persona label, a personalized AI-generated headline (dynamic text, not static — it changes based on the user's emotional state, reason for visit, and primary topic), and their interest topic pills (e.g. "PTSD", "children", "October 7", "veterans")

- **Guardian news stories** — real journalism fetched from The Guardian, filtered by the user's primary topic. Guardian card format: thumbnail image, headline, 2-line summary, "The Guardian" source label, date, read link. Important: Guardian headlines may appear in either English or Hebrew (AI-translated) so card designs must handle both short and long text gracefully without breaking layout.

- **Academic article preview cards** — from the platform's own research pipeline. Format: title, year, journal name, first author, 2-line abstract, read link. Each card also shows small "matched tag" pills — these indicate which of the user's personal interest tags (e.g. "PTSD", "children") were found in that article. These pills are part of the card design.

- **Guardian cards and Academic cards must look clearly visually distinct from each other** — users should instantly know what type of content they're reading without having to read a label. They are two different content types that coexist on the same page.

- **OWID chart** — an embedded iframe from Our World in Data showing relevant mental health statistics. Has a caption below it. Design must handle the case where the iframe is still loading (skeleton/placeholder state) and the case where it fails to load entirely (graceful fallback — show a text message, not a broken frame).

- **"Adjust your topics" control** — a subtle inline control (not a new page) where users can edit their interest tags (add/remove, max 5 tags) without retaking the quiz. Opens inline on the page as a small edit panel. Should feel subtle and secondary — not a prominent feature.

- **"Also explore" section** — subtle links at the bottom to other parts of the platform:
  - **Interactive Map** — visualizes crisis hotline call records across Israeli cities over time
  - **Trends** — Google Trends data for trauma-related search terms in Israel
  - **Data Graphs** — static data visualizations on topics like addictions, sleep, domestic violence, health system impact
  These should feel like gentle discovery prompts, not navigation items.

- **CTA** — sends the user to the full articles page for their complete personalized reading list

- **Navbar** — simple top navbar with logo and language toggle (Hebrew/English). Should feel native to each persona's visual theme.

- **Fallback states** — the page must look good even if Guardian returns no stories or OWID fails. Content blocks that fail to load should disappear or show a minimal fallback message — never show broken UI or empty white boxes.

**Important about content mix:** The amount of Guardian stories vs. OWID charts vs. academic articles shown depends on the user's content preference — some users prefer personal stories, some prefer data and research, some want both. The design should accommodate varying amounts of each content type gracefully.

---

**Persona 1 — Beginner:**

Who they are: New to trauma topics. Likely came for personal reasons — possibly grieving or emotionally affected. They are not academics. They want to feel understood, not lectured. They need accessible, human content. They may be in a fragile emotional state.

Content on their page:
- Hero with AI-generated personalized emotional copy — warm and gentle if grieving, curious and inviting if exploratory. The headline is dynamic and references their primary topic and emotional context.
- Their interest tag pills
- 2 Guardian news stories — human, story-driven journalism (this persona leans heavily toward stories)
- 1 OWID chart — something relatable showing how common these experiences are globally
- 2-3 academic article previews with matched tag pills — shown accessibly, not intimidating
- "Adjust your topics" inline control — subtle
- Warm CTA to full articles
- "Also explore" at bottom

Design direction: Make this feel warm, safe, and human. This person needs to feel the platform cares about them as a person, not as a data point. Think about what visual language makes someone who may be grieving feel held rather than overwhelmed. The experience should feel supportive. Credibility still matters — it should not feel cheap or infantilizing.

---

**Persona 2 — Informed Learner:**

Who they are: Has some knowledge — a social worker, journalist, teacher, or student. Came for professional or mixed reasons. Comfortable reading but not a clinical researcher. Wants both human context AND data. Balanced, curious, capable.

Content on their page:
- Hero with profile summary — persona label, AI-generated headline referencing their professional/mixed context, primary topic, content preference label ("Showing you: stories + research" or weighted toward one side based on their preference)
- Their interest tag pills
- Mixed content: 1-2 Guardian stories + 2 academic article previews with matched tag pills — the balance shifts based on their content preference
- 1 OWID chart contextualizing trauma in a broader data picture
- "Adjust your topics" inline control
- CTA to full articles
- "Also explore" at bottom

Design direction: This person is capable and engaged. They want structure and depth without being overwhelmed. Think about how to present both journalistic and academic content together in a way that feels intentional and organized, not cluttered. Balance is the key word — neither too emotional nor too clinical.

---

**Persona 3 — Researcher:**

Who they are: Academic, clinician, or serious researcher. Came for research or professional purposes. Wants maximum information density. Respects credible sources. Does not want hand-holding, decorative elements, or emotional framing. Treats this like a tool, not a product experience.

Content on their page:
- Full extracted profile card displaying all fields: persona, primary topic, interest tags, content preference. (DESCOPED 2026-06-27: the OpenAlex Boolean query copyable code block was removed — not shown.) Note: if this researcher came for personal/emotional reasons, the emotional state field is hidden from this display — we don't show it back to them.
- 1 OWID chart — epidemiological, data-heavy
- Academic article previews in a dense, information-rich format — title, year, journal, authors, DOI (copyable), matched tag pills, abstract expandable on click. No Guardian stories — researchers don't want journalism.
- Minimal "Adjust your topics" control
- Minimal CTA
- "Also explore" at bottom — minimal, text-only

Design direction: This person wants a tool, not an experience. Think about what visual language communicates credibility, density, and respect for their intelligence. Consider how academic databases or research tools look and feel. Decoration is noise to this user — remove it. Dark theme fits this persona's serious, focused mindset.

---

**Hard Constraints:**

- The 3 pages must feel like radically different products visually — not just color swaps. Layout, information density, typography weight, and visual language should all differ.
- All layouts must support RTL (Hebrew) — design LTR but ensure the layout would work mirrored. Guardian card headlines may be in Hebrew so text containers must handle RTL text.
- This platform deals with trauma, grief, and mental health — nothing can feel playful, gamified, or dismissive under any circumstances.
- Trustworthiness and credibility are more important than beauty.
- The two content card types (Guardian journalism vs. academic articles) must be visually distinct so users always know what type of content they're reading.
- All content blocks must have graceful fallback states — no broken UI, no empty white boxes if content fails to load.
- Desktop only.
- Show all 3 pages as separate full-page designs.

---

## PART 9 — IMPLEMENTATION ORDER

**Revised priority:** Design is approved (see `client/design-refs/`). Frontend goes first — build all three persona layouts against the approved mockups. Backend wiring comes after.

### Phase C — Frontend (NOW — design approved)

Build order: Persona 1 → Persona 2 → Persona 3 → wire to real data.

### Phase B — Backend (after frontend is built)
All backend changes are independent of the visual design. Implement in priority order:

1. **`server/utils/chat_prompts.py`**
   - Add `emotional_state` and `content_preference` to `PERSONA_PROFILE_SYSTEM_PROMPT`
   - Remove `preferred_content` from extraction schema
   - Update dynamic question generation prompt with adaptation rules
   - Keep all existing persona classification logic

2. **`server/routes/chat_route.py`**
   - Update `parse_persona_profile()` to parse new fields with safe fallbacks
   - No other changes needed — session save already saves the full dict

3. **`server/routes/ai_assistant_route.py`**
   - Expand session field extraction to all 6 fields
   - Add `emotional_guidance` string builder
   - Rebuild system prompt to include all signals
   - Keep article context format, max_tokens, and cache unchanged

4. **`server/routes/articles_route.py`**
   - Extend `rank_articles()` with `emotional_state` and `content_preference` params
   - Add `persona_boost` computation (keyword matching on abstract)
   - Add `matched_tags` computation after ranking
   - Update `GET /api/articles` handler to read new fields from session and pass to ranker

5. **`server/routes/external_content_route.py`** (NEW FILE)
   - Guardian API fetch with topic param (English-only, no translation)
   - MongoDB cache with 1-hour TTL
   - Graceful fallback to empty array on any failure
   - Register blueprint in `server/app.py`

### Phase C steps (frontend — do these first)

- **C-1**: Persona 1 (Beginner) — `ResultsPage.jsx` shell + `BeginnerResults.jsx` + `GuardianCard.jsx` (horizontal) + `AcademicCard.jsx` (warm) + `results-components.css`
- **C-2**: Persona 2 (Informed Learner) — `InformedResults.jsx` + `GuardianCardVertical.jsx` + `AcademicCardTeal.jsx` + P2 CSS
- **C-3**: Persona 3 (Researcher) — `ResearcherResults.jsx` + `ArticleRow.jsx` + P3 CSS
- **C-4**: Wire ResultsPage to real data (Guardian fetch, articles fetch, session profile)

No existing results components to preserve — full rewrite.

---

## PART 10 — COMPLETE FILE CHANGE LIST

| File | Type | What Changes |
|---|---|---|
| `server/utils/chat_prompts.py` | MODIFY | Add emotional_state + content_preference to extraction prompt; remove preferred_content; add dynamic question adaptation rules |
| `server/routes/chat_route.py` | MODIFY | Update parse_persona_profile() for new fields with fallbacks |
| `server/routes/ai_assistant_route.py` | MODIFY | Pull all 6 profile fields; add emotional_guidance strings; rebuild system prompt |
| `server/routes/articles_route.py` | MODIFY | Extend rank_articles() with persona_boost; add matched_tags computation; pass new fields from GET handler |
| `server/routes/external_content_route.py` | NEW | Guardian API fetch + MongoDB cache (no translation) + graceful fallbacks |
| `server/services/mongo.py` | MODIFY | Add guardian_cache collection with TTL index on fetched_at + unique index on topic |
| `server/app.py` | MODIFY | Register external_content blueprint |
| `client/src/pages/ResultsPage.jsx` | REWRITE | 3 persona layouts, dynamic copy, Guardian + OWID fetches, all fallback states |
| `client/src/components/results/BeginnerHero.jsx` | REWRITE | New warm layout |
| `client/src/components/results/InformedHero.jsx` | REWRITE | New structured balanced layout |
| `client/src/components/results/ResearcherHero.jsx` | REWRITE | New dense dark profile card |
| `client/src/components/results/GuardianCard.jsx` | NEW | Guardian story card component |
| `client/src/components/results/AcademicPreviewCard.jsx` | NEW | Academic preview with matched tag pills |
| `client/src/components/results/OwidChart.jsx` | NEW | OWID iframe with skeleton + fallback |
| `client/src/components/results/AdjustTopics.jsx` | NEW | Inline topic editor panel |
| `client/src/components/results/AlsoExplore.jsx` | NEW | Bottom discovery links section |
| `client/src/index.css` | MAYBE MODIFY | Minor palette enrichments based on design output |

---

## PART 11 — VERIFICATION

1. **Quiz extraction:** Complete quiz as a grieving personal user → check MongoDB session document contains `emotional_state: "grieving"` and `content_preference: "stories"` (not the old `preferred_content` field)

2. **Quiz adaptation:** Answer Q1 with emotional personal content → verify Q2 probes gently for context rather than jumping to professional background questions

3. **RAG emotional guidance:** Open article chat as a grieving beginner, ask "what should I read first?" → verify response is warm, doesn't lead with statistics, validates emotional experience first

4. **RAG professional guidance:** Open article chat as a professional researcher → verify response is data-focused, references specific articles by number, uses clinical language

5. **Guardian stories:** Load results page as beginner with primary_topic "children" → verify Guardian stories appear, filtered to children/trauma content

6. **Guardian failure fallback:** Kill Guardian API key temporarily → verify stories section disappears silently, page still looks complete

8. **OWID loading state:** Load results page on slow connection → verify skeleton shimmer appears while OWID iframe loads

9. **OWID failure fallback:** Block OWID domain in browser → verify graceful text message appears, no broken frame

10. **Matched tags:** Verify each article preview card shows pills only for interest_tags that actually appear in that article's title or abstract

11. **Persona boost ranking:** Create two users with identical interest_tags but one with content_preference="stories" and one with content_preference="research" → verify article ordering differs

12. **Researcher profile display:** Complete quiz as researcher with personal grief → verify emotional_state is NOT shown in the profile card on results page

13. **Adjust topics:** Click "Adjust your topics" on results page → verify inline panel opens, add a new tag, save → verify article previews re-fetch and cache is busted

14. **3 persona layouts:** Complete quiz as each persona → verify results pages look dramatically different from each other (not just color changes)

15. **Also explore:** Verify all 3 links in "Also explore" section navigate to correct pages (/map, /trends, /graphs/israel)
