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

---

## Current Step — IN PROGRESS

### B-2: `server/routes/chat_route.py` — parse new fields, fallback emotional_state → "neutral"

**Goal:** Make `parse_persona_profile()` extract the two new B-1 schema fields
(`emotional_state`, `content_preference`) into the returned profile dict, with safe
closed-enum defaults, so downstream steps (B-3 assistant tone, B-4 article mix /
persona_boost) and the persisted `persona_profile` document carry these fields.

**File to change (exactly ONE source file):**
`d:\Program Files (x86)\Final_Project\server\routes\chat_route.py`

**Exact changes — `parse_persona_profile()` only (currently lines 111–135):**

1. SUCCESS branch — the returned dict (currently lines 120–126). Add two new keys
   AFTER `primary_topic` and BEFORE `search_query`, validated against the B-1 closed
   enums. Read each via `.get()` with a default, then coerce any out-of-enum value to
   the default:
   - `emotional_state`: allowed = `{"distressed", "seeking_support", "curious", "neutral", "analytical"}`.
     Read `parsed.get("emotional_state", "neutral")`; if the value is not a str or not
     in the allowed set → `"neutral"`.
   - `content_preference`: allowed = `{"stories", "mixed", "data"}`.
     Read `parsed.get("content_preference", "mixed")`; if not a str or not in the
     allowed set → `"mixed"`.
   Resulting success dict key order:
   `persona, interest_tags, preferred_content, primary_topic, emotional_state, content_preference, search_query`.

2. EXCEPTION / fallback branch (currently lines 129–134). Add the same two keys with
   their defaults so the shape is IDENTICAL across both branches:
   - `"emotional_state": "neutral"`
   - `"content_preference": "mixed"`

3. Implementation note for the coder: define the two allowed-value sets as small
   module-level frozensets/sets near `_GENERIC_TAGS` (top of file, ~line 71 area), e.g.
   `_EMOTIONAL_STATES` and `_CONTENT_PREFERENCES`, OR inline them as local constants
   inside the function. Either is acceptable; module-level is preferred for reuse by
   B-3/B-4. This is the ONLY structural addition outside the function body and keeps the
   change to a single file.

**Exact fallback values (canonical — do not deviate):**
- `emotional_state` default / invalid-coercion target → `"neutral"`
- `content_preference` default / invalid-coercion target → `"mixed"`
  (Rationale: "mixed" is the neutral middle of the stories↔data axis, matching the
  "neutral" emotional default; avoids biasing article mix when the LLM omits the field.)

**What to PRESERVE (do NOT change):**
- All five existing keys and their current defaults: `persona`→"beginner",
  `interest_tags`→`_clean_tags(...)`, `preferred_content`→"", `primary_topic`→"",
  `search_query`→"".
- The free-text `preferred_content` field stays — `content_preference` is a SEPARATE
  companion field, not a replacement (per B-1 schema note, line 99–100 of chat_prompts.py).
- `clean_ai_json()`, `_clean_tags()`, `_GENERIC_TAGS`, `reconstruct_conversation()`,
  `format_conversation()` — untouched.
- The `except (json.JSONDecodeError, ValueError, TypeError)` signature and its
  `logger.warning(...)` line — untouched.
- The `chat()` endpoint (lines 138–331) — untouched. `persona_profile` already flows
  unchanged into `completion_fields["persona_profile"]` (line 308) and the JSON response
  (line 330), so the two new keys propagate to MongoDB and the frontend automatically
  with NO route-body edits required. `PERSONA_SCORE` / score derivation untouched.

**Caller / propagation check (from graphify):**
- `parse_persona_profile` is called once, in `chat()` at line 286; its result is stored
  (line 308) and returned (line 330). No other caller in the codebase.
- Edges: `parse_persona_profile --calls--> clean_ai_json`, `--calls--> _clean_tags`
  (both preserved). Three test edges — see blocker below.

**BLOCKER / RISK to flag before coding (load-bearing):**
`server/tests/test_chat_parsing.py` asserts the EXACT full return dict of
`parse_persona_profile` via `assertEqual`:
- `test_parse_persona_profile_with_string_tags` (expects 4 keys, NO `primary_topic`)
- `test_parse_persona_profile_with_missing_fields` (expects 4 keys)
- `test_parse_persona_profile_malformed_json` (expects 4 keys)
These tests are ALREADY out of sync with current code (live code returns 5 keys incl.
`primary_topic`; tests expect 4 and omit it) — i.e. they are pre-existing failures, NOT
introduced by B-2. Adding `emotional_state` + `content_preference` widens this gap.
Decision needed from reviewer: B-2 is scoped to `chat_route.py` only and MUST NOT edit
test files under the current invariants. Recommend a FOLLOW-UP step (propose "B-2a:
resync test_chat_parsing.py expected dicts to the 7-key schema") rather than touching
tests inside B-2. Do not silently edit tests.

**Scope:** 1 source file (`chat_route.py`). No new files. No client changes. Within the
5-file limit (1 file). No split required.

**Verification (no code edits — for the implementer after coding):**
- `parse_persona_profile('{}')` returns 7 keys incl. `emotional_state="neutral"`,
  `content_preference="mixed"`.
- Valid JSON with `emotional_state="analytical"`, `content_preference="data"` passes
  through unchanged.
- Out-of-enum values (e.g. `emotional_state="angry"`) coerce to `"neutral"`;
  `content_preference="charts"` coerces to `"mixed"`.
- Malformed JSON → fallback dict with the two new defaults present.

Status: IN PROGRESS

---

## Upcoming Steps

- **C-4**: Wire all three personas to real data — Guardian fetch, articles fetch, session profile
- **B-3**: `server/routes/ai_assistant_route.py` — emotional guidance + rebuild system prompt
- **B-4**: `server/routes/articles_route.py` — persona_boost + matched_tags + abstract projection fix
- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
- **(proposed) B-2a**: resync `server/tests/test_chat_parsing.py` expected dicts to the 7-key persona schema (separate from B-2 to respect the no-test-edit invariant)
