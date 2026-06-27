# Revamp Progress

## Completed Steps

### C-1: Build Persona 1 (Beginner) Results Page — COMPLETE
Commits: `45931cd..7e370f6`
Files: ResultsPage.jsx (shell), BeginnerResults.jsx, GuardianCard.jsx, AcademicCard.jsx, results-components.css, index.html
Review: all invariants passed — no server/auth/test files touched, lint unchanged at 24 (pre-existing)

### C-2: Build Persona 2 (Informed Learner) Results Page — COMPLETE
Commits: `7e370f6..bf20d05` (impl `74c46c8` + fix `bf20d05`)
Files: InformedResults.jsx, GuardianCardVertical.jsx, AcademicCardTeal.jsx, results-components.css (P2 block), ResultsPage.jsx (import), index.html (fonts)
Review: all invariants passed — no server/auth/test files touched, lint unchanged at 24 (pre-existing)
Fix applied: removed dead `dir` state, added `dir="auto"` to AcademicCardTeal h3+abstract, removed duplicate preconnects

### C-3: Build Persona 3 (Researcher) Results Page — COMPLETE
Commits: `a902660..0475a19` (impl `62c3b1a` + fix `0475a19`)
Files: ResearcherResults.jsx (CREATE), ArticleRow.jsx (CREATE), results-components.css (P3 block appended), ResultsPage.jsx (import + MOCK_ARTICLES expanded to 5)
Review: all invariants passed — no server/auth/test files touched, lint unchanged at 24 (pre-existing)
Fixes applied: removed `index` prop from ArticleRow (prop is now `{ article }` only), placeholder HTML entity replaced with Unicode ellipsis, `.p3-stripe` unused rule removed, section order (OWID before articles) confirmed against Persona3.dc.html design ref

### B-1: `server/utils/chat_prompts.py` — new extraction schema (emotional_state, content_preference) — COMPLETE
Commits: `0475a19..88f2e8f`
Files: server/utils/chat_prompts.py (14 lines: field count "5"→"7", added emotional_state + content_preference fields with closed enums)
Review: all invariants passed — only chat_prompts.py touched, no server routes/auth/tests/client files modified, parse_persona_profile in chat_route.py backward-compatible via .get() pattern, enum values all lowercase/snake_case for B-2 defaulting
> ANNOTATION 2026-06-27 (B-fix): The enum VALUES committed here were OFF-SPEC vs
> Revamp.md (the source of truth). B-1 used emotional_state {distressed,
> seeking_support, curious, neutral, analytical} and content_preference {stories,
> mixed, data}. Revamp.md (PART 1, lines 52-70) authoritatively defines
> emotional_state {grieving, distressed, curious, professional, neutral} and
> content_preference {stories, research, mixed}. The frontend (C-1/2/3) and
> client/design-refs/README.md already use the Revamp.md values. B-fix corrects
> chat_prompts.py to match. History above left intact for the record.

---

## B-fix: align emotional_state + content_preference enums to Revamp.md — COMPLETE

**Why:** A spec conflict was found. The committed backend (B-1 chat_prompts.py, B-2
chat_route.py) used OFF-SPEC enum values. Revamp.md is the SOURCE OF TRUTH and the
frontend + design-refs already match it. The backend is the wrong side and must be
corrected.

**Authoritative values (Revamp.md PART 1):**
- `emotional_state` ∈ {grieving, distressed, curious, professional, neutral} (lines 52-61)
- `content_preference` ∈ {stories, research, mixed} (lines 63-70)
- Defaults unchanged: emotional_state → "neutral"; content_preference → "mixed"
  (both remain valid members of the corrected enums).

Review (2026-06-27): all invariants passed. Exact enum values verified line-by-line
against Revamp.md PART 1 (lines 52-70): MATCH. chat_route.py lines 78-79 and
chat_prompts.py enum lines correct. No old off-spec values anywhere. No tests touched.
- Test suite: pre-existing ImportError on test_chat_parsing.py (`parse_score_response`
  missing from chat_route) confirmed unchanged — tracked for B-2a.

---

### B-2: `server/routes/chat_route.py` — parse new fields, fallback emotional_state → "neutral" — COMPLETE
Committed `a9a4c84`. `parse_persona_profile()` returns the full 7-key schema; enum sets
later corrected by B-fix to the Revamp.md values. (Full plan retained in git history.)

---

## C-3a: Results-page design-fidelity polish vs `client/design-refs/` — COMPLETE
(Full plan + review retained in git history.) Lint baseline dropped 24 → ~18-19 (legit:
removed dead `url` var + "Read source" link from ArticleRow).

### C-3b: Fix pre-existing `BeginnerResults.jsx` build-breaking unescaped apostrophes — COMPLETE
Commit: `5e4181a`. MOOD_COPY distressed-state string delimiters single→double; trauma
copy TEXT unchanged. `npm run build` now passes.
> LINT BASELINE: live baseline is **~18 problems (14 errors, 4 warnings)** as of C-4
> review. Hold lint at baseline (no regression). Note: this is a JS/lint baseline; it is
> SEPARATE from the Python test gate that B-2a establishes.

---

## C-4: Wire ResultsPage to REAL data — COMPLETE
Committed `8ba5bce`. 2 files (client/src/utils/api.js, client/src/pages/ResultsPage.jsx):
added getArticles/getExternalStories graceful helpers, normalizePersonaLabel (fixes
"informed learner"→informed fall-through), mapProfile, mapArticle, real article + Guardian
fetch with graceful [] fallbacks; researcher issues no Guardian fetch. Build passes; lint
held at baseline. (Full plan + review retained in git history.)

---

## B-2a: repair & resync `server/tests/test_chat_parsing.py` to the 7-key persona schema — COMPLETE
Commit context per prior review. Test gate is now REAL and is the gate for B-3/B-4/B-5:
`python -m unittest discover -s server/tests` → `Ran 5 tests in 0.001s OK`.
(Full investigation + plan + review retained in git history of this file.)

---

## B-3: `server/routes/ai_assistant_route.py` — wire ALL profile fields into the article-chat (RAG) system prompt — COMPLETE
Commit: `1be5319`. One file (`article_chat()` handler only): Change A (6 profile locals),
Change B (EMOTIONAL_GUIDANCE dict + persona×emotional_state tone), Change C (PART 3
system_content template). Test gate green, file parses, graphify updated. (Full plan +
review retained in git history of this file.)

---

## B-4: `server/routes/articles_route.py` — article ranking persona_boost + matched_tags — COMPLETE
Commit: `1be6d5a`. One file (`server/routes/articles_route.py`): Change 0 (verified
`"abstract": 1` already present at projection, not re-added), Change 1 (persona_boost
helper + keyword-group constants), Changes 2-4 (rank_articles 4-arg signature, updated
docstring, new formula 0.60/0.25/0.05/0.10), Change 5 (4-arg call site reading
emotional_state+content_preference from persona_profile, post-rank matched_tags loop).
Test gate green (`Ran 5 tests ... OK`), file parses, graphify updated. (Full plan +
review retained in git history of this file.)

---

## B-5: Guardian API integration (NEW route + blueprint registration + Mongo cache) — IN PROGRESS

**THIS IS THE FINAL REVAMP STEP.**

**Source of truth:** Revamp.md PART 5 (lines 247-281), verified line-by-line.
**Test gate (must pass, no regressions):** `python -m unittest discover -s server/tests`
→ currently `Ran 5 tests in 0.001s OK`. B-5 adds no Python-tested function to the gate;
it is a non-regression guard. Additionally confirm the app still imports/boots.

### INVESTIGATION FINDINGS (authoritative — graphify-oriented, then confirmed from source)

**Finding A — blueprint import + registration pattern (`server/app.py`).**
- Imports L9-18 follow `from routes.<file> import <bp_name>` (note: import is from
  `routes.<x>`, NOT `server.routes.<x>` — the server dir is the import root).
- Registrations L37-46 follow `app.register_blueprint(<bp>, url_prefix="<prefix>")`.
- The `/api` prefix is shared by `map_bp`, `trends_bp`, `articles_bp`, `ai_assistant_bp`
  (L37, 44, 45, 46). The endpoint must be `GET /api/external/stories`, so the new blueprint
  registers with `url_prefix="/api"` and its in-blueprint route path is `/external/stories`.
  (Final URL = `/api` + `/external/stories` = `/api/external/stories` — matches the C-4
  contract.)

**Finding B — Mongo collection + index idiom (`server/services/mongo.py`).**
- Collections are module-level: `<name> = db["<collection>"]` (L44, 53-56, 63-64).
- Indexes are created inside a `try/except Exception as e: logger.warning(...)` block right
  after the collection handle (L46-51, L58-61, L66-71).
- TTL index idiom (EXACT, copy this shape) — token_blocklist L66-69:
  `token_blocklist_collection.create_index("revoked_at", expireAfterSeconds=86400)`
  and unique idiom: `create_index("jti", unique=True)`.
- So `guardian_cache` follows the SAME pattern: collection handle + try/except with a TTL
  index on `fetched_at` (expireAfterSeconds=3600) and a unique index on `topic`.

**Finding C — route blueprint idiom + deps (`server/routes/articles_route.py`).**
- Blueprint: `<bp> = Blueprint("<internal_name>", __name__)` (L10).
- Imports: `from flask import Blueprint, request, jsonify`; service imports from
  `services.<x>`; `from utils.logger import logger` (L1-8). Logger is the project-standard
  logging facility — use it for warnings on failure paths.
- **`requests` IS already a dependency** — Requirements.txt L17 (`requests`), and it is used
  with a timeout in `server/services/openalex_articles.py` L19
  (`requests.get(pdf_url, timeout=_PDF_TIMEOUT, stream=True)`). So B-5 uses `requests.get(...,
  timeout=...)` — NO new dependency added.
- Env vars read via `os.environ.get(...)` (mongo.py L8-9) with dotenv loaded at module top
  (`load_dotenv(...)`). dotenv is already loaded process-wide via mongo.py/app.py; reading
  `os.environ.get("GUARDIAN_API_KEY")` inside the route is consistent and safe.

**Finding D — frontend contract (C-4 `getExternalStories`, `client/src/utils/api.js`
L177-190) — CONFIRMED.**
- Calls `fetch(\`${base}/api/external/stories?topic=${encodeURIComponent(topic)}\`)` with
  **NO Authorization header, NO credentials**. => The route MUST be PUBLIC (no
  `@jwt_required`). DECISION: no auth decorator on this endpoint. Rationale: the frontend
  cannot supply a token here, and the data is public journalism (no user-scoped data).
- Graceful on client side too: `if (!res.ok) return []`, non-array → []. So a server 200
  with `[]` and a server error both degrade to "stories block doesn't render".
- The response MUST be a **top-level JSON ARRAY** (not `{stories: [...]}`) — the client does
  `Array.isArray(data) ? data : []`. So return `jsonify(stories_list)` where `stories_list`
  is a Python list.
- Item shape consumed downstream (ResultsPage maps `thumbnail`→`thumbnailUrl`; cards consume
  `{thumbnailUrl, headline, summary, date, url}`). So each item MUST be exactly:
  `{headline, summary, thumbnail, url, date, source}` per Revamp.md line 272.

### EXACT FILES TO CHANGE (3 files — within the 5-file limit)

#### FILE 1 (NEW) — `server/routes/external_content_route.py`

Full route outline:

```python
import os
import requests
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from services.mongo import guardian_cache_collection
from utils.logger import logger

external_content_bp = Blueprint("external_content", __name__)

GUARDIAN_URL = "https://content.guardianapis.com/search"
GUARDIAN_TIMEOUT = 8          # seconds (Render-friendly, mirrors openalex timeout idiom)
CACHE_TTL_SECONDS = 3600      # informational; the Mongo TTL index enforces expiry


@external_content_bp.route("/external/stories", methods=["GET"])
def external_stories():
    """
    GET /api/external/stories?topic=<primary_topic>
    PUBLIC (no auth) — see B-5 Finding D. Returns a JSON array of Guardian story
    objects, or [] on ANY failure path (missing key, timeout, HTTP error, bad JSON,
    0 results). NEVER raises to the client. English only (no Hebrew translation).
    """
    try:
        # 1. Normalize topic; empty/missing → [] (graceful)
        topic = (request.args.get("topic") or "").lower().strip()
        if not topic:
            return jsonify([]), 200

        # 2. Cache hit → return stored stories
        try:
            cached = guardian_cache_collection.find_one({"topic": topic})
            if cached and cached.get("stories"):
                return jsonify(cached["stories"]), 200
        except Exception as e:
            logger.warning(f"guardian_cache read failed: {e}")
            # fall through to live fetch

        # 3. Missing API key → [] (do not raise)
        api_key = os.environ.get("GUARDIAN_API_KEY")
        if not api_key:
            logger.warning("GUARDIAN_API_KEY not set; returning [] for external stories")
            return jsonify([]), 200

        # 4. Cache miss → query Guardian
        params = {
            "q": f"{topic} Israel trauma",
            "section": "world",
            "show-fields": "thumbnail,trailText,headline",
            "page-size": 3,
            "api-key": api_key,
        }
        resp = requests.get(GUARDIAN_URL, params=params, timeout=GUARDIAN_TIMEOUT)
        resp.raise_for_status()
        data = resp.json()

        # 5. Parse → list of {headline, summary, thumbnail, url, date, source}
        results = (data.get("response", {}) or {}).get("results", []) or []
        stories = []
        for item in results:
            fields = item.get("fields", {}) or {}
            stories.append({
                "headline": fields.get("headline") or item.get("webTitle", ""),
                "summary": fields.get("trailText", ""),
                "thumbnail": fields.get("thumbnail", ""),
                "url": item.get("webUrl", ""),
                "date": item.get("webPublicationDate", ""),
                "source": "The Guardian",
            })

        # 6. 0 results → return [] WITHOUT caching (retry next request) — Revamp.md L275
        if not stories:
            return jsonify([]), 200

        # 7. Upsert into cache with current timestamp
        try:
            guardian_cache_collection.update_one(
                {"topic": topic},
                {"$set": {
                    "topic": topic,
                    "stories": stories,
                    "fetched_at": datetime.now(timezone.utc),
                }},
                upsert=True,
            )
        except Exception as e:
            logger.warning(f"guardian_cache write failed: {e}")
            # still return the stories — caching is best-effort

        return jsonify(stories), 200

    except Exception as e:
        # API failure / timeout / bad JSON / anything → [] (never raise to client)
        logger.warning(f"external_stories failed: {e}")
        return jsonify([]), 200
```

Key invariants for FILE 1:
- Endpoint path inside blueprint is `/external/stories`; the `/api` prefix is added at
  registration (FILE 2) to form `/api/external/stories`.
- NO `@jwt_required` (PUBLIC — Finding D).
- Returns a TOP-LEVEL ARRAY via `jsonify(stories)` (NOT `{stories: ...}`) — Finding D.
- Item shape EXACTLY `{headline, summary, thumbnail, url, date, source}` (Revamp.md L272).
- `summary` from `fields.trailText`; `url` from `webUrl`; `date` from `webPublicationDate`;
  `source` constant `"The Guardian"`; `thumbnail` from `fields.thumbnail`.
- Every failure path returns `jsonify([]), 200` — never a 4xx/5xx, never an exception:
  empty topic, cache-read error, missing key, requests timeout/HTTPError, bad JSON,
  0 results.
- 0 results is NOT cached (so a later request retries) — Revamp.md L275.
- `requests.get(..., timeout=GUARDIAN_TIMEOUT)` — uses existing dependency; has a timeout.
- `fetched_at` stored as timezone-aware UTC datetime (Mongo TTL operates on BSON dates).
- English only; no translation logic (Revamp.md L258).

#### FILE 2 (EDIT) — `server/app.py`

- Add import alongside the other route imports (after L18):
  `from routes.external_content_route import external_content_bp`
- Add registration alongside the other `/api` blueprints (after L46):
  `app.register_blueprint(external_content_bp, url_prefix="/api")`
- PRESERVE all existing imports + registrations (L9-46), JWT config, CORS, limiter, the
  `is_jti_revoked` blocklist wiring.

#### FILE 3 (EDIT) — `server/services/mongo.py`

- Add the collection handle + index block following the EXACT existing idiom (mirror the
  token_blocklist block L63-71). Place after the existing collection/index blocks (after
  L71):

```python
guardian_cache_collection = db["guardian_cache"]

try:
    # Auto-expire cached Guardian results after 1 hour (Revamp.md PART 5)
    guardian_cache_collection.create_index("fetched_at", expireAfterSeconds=3600)
    guardian_cache_collection.create_index("topic", unique=True)
except Exception as e:
    logger.warning(f"Failed to create guardian_cache indexes: {e}")
```

- PRESERVE every existing collection handle (chat/users/calls/trends/articles/
  token_blocklist/ai_assistant) and every existing index block — append only.

### WHAT TO PRESERVE (global)
- All existing routes/blueprints + their url_prefixes (app.py L9-46) — append only.
- All existing collections + indexes (mongo.py) — append only; do not alter TTL/unique
  setups for chat/articles/token_blocklist.
- Auth, JWT, CORS, limiter, app config — untouched.
- No new dependency: `requests` already in Requirements.txt L17.
- No Hebrew translation; English only.

### INVARIANTS / REVIEW CHECKLIST
- Exactly 3 files: 1 NEW route + app.py + mongo.py. No client files changed (C-4 already
  wired the consumer). No tests changed.
- Route is PUBLIC (no `@jwt_required`) — matches C-4 fetch (no token).
- Response is a top-level JSON array; item shape `{headline, summary, thumbnail, url, date,
  source}`.
- Graceful `[]` on EVERY failure path: empty/missing topic, missing GUARDIAN_API_KEY,
  cache read error, requests timeout/HTTP error, bad JSON, 0 results. Never raises.
- 0 results → `[]` and NOT cached.
- `guardian_cache` has TTL index on `fetched_at` (expireAfterSeconds=3600) AND unique index
  on `topic`.
- `requests.get` uses a timeout. No new dependency.
- Final URL is `/api/external/stories` (prefix `/api` + path `/external/stories`).

### VERIFICATION (post-coding)
- `python -c "import ast; ast.parse(open(r'server/routes/external_content_route.py').read())"`
  — new file parses clean.
- Test gate: `python -m unittest discover -s server/tests` → still `Ran 5 tests ... OK`
  (non-regression — B-5 touches no tested function).
- App imports/boots: confirm `from routes.external_content_route import external_content_bp`
  resolves and `external_content_bp` registers without error (import-time check of app.py).
- Grep checks: `external_content_bp` defined + imported + registered exactly once;
  `guardian_cache_collection` defined in mongo.py with both `expireAfterSeconds=3600` and
  `unique=True`; `@jwt_required` ABSENT from the new route; `jsonify([])` present on each
  failure branch; item dict has all 6 keys with `source: "The Guardian"`.
- After coding: `graphify update .` to refresh the graph.

**Status: IN PROGRESS**
