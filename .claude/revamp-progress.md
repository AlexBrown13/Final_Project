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

## B-2a: repair & resync `server/tests/test_chat_parsing.py` to the 7-key persona schema — IN PROGRESS

**Why this is its own step:** All prior backend steps (B-1, B-2, B-fix) carried a
"run tests" gate that was a NO-OP, because `server/tests/test_chat_parsing.py` fails at
IMPORT time (`from routes.chat_route import parse_score_response` → ImportError). A failed
import aborts collection of the ENTIRE module, so NO test in it has actually run since
`parse_score_response` was removed. This is the ONE step where editing a test file is
explicitly allowed. Fixing it turns the test gate REAL and unblocks B-3 / B-4 / B-5.

### INVESTIGATION FINDINGS (authoritative, from source + Revamp.md)

**Finding 1 — `parse_score_response` no longer exists and was REMOVED, not renamed.**
- `grep "def \w+"` on `server/routes/chat_route.py` returns exactly 6 functions:
  `reconstruct_conversation` (L29), `format_conversation` (L50), `clean_ai_json` (L58),
  `_clean_tags` (L82), `parse_persona_profile` (L114), `chat` (L147).
  There is NO score-parsing function of any name in chat_route.py.
- Codebase-wide grep for `parse_score|score_response|def .*score` finds only:
  (a) the broken references inside the test file itself, and
  (b) `server/services/groq.py:65 def score_user_conversation(...)` — a NETWORK call to
      Groq that returns raw model content or None; it is NOT a JSON parser and does not
      return `{"score","reason"}`. It is also not invoked by the current chat flow.
- The scoring DESIGN changed: `chat_route.chat()` now DERIVES the score from the persona
  via `score = PERSONA_SCORE.get(persona_profile.get("persona","beginner"), 1)` (L296).
  There is no longer any LLM "score 1-3 + reason" JSON to parse. The old
  `parse_score_response` (which produced `{"score":1,"reason":"...defaulting to score 1"}`)
  is dead behavior that the system no longer has.
- CONCLUSION: the import and the three `test_parse_score_response_*` tests must be
  REMOVED (not rewired to another function). Rewiring them to `score_user_conversation`
  would be inventing coverage for a network function with different semantics — out of
  scope and wrong. We do NOT invent a replacement function.

**Finding 2 — live `parse_persona_profile` return shape (chat_route.py L114-142).**
SUCCESS branch returns (L123-131):
  persona = parsed.get("persona","beginner")
  interest_tags = _clean_tags(parsed.get("interest_tags",[]), primary_topic)
  preferred_content = parsed.get("preferred_content","")
  primary_topic = parsed.get("primary_topic","")
  emotional_state = parsed.get("emotional_state","neutral") if in _VALID_EMOTIONAL_STATES else "neutral"
  content_preference = parsed.get("content_preference","mixed") if in _VALID_CONTENT_PREFERENCES else "mixed"
  search_query = parsed.get("search_query","")
FALLBACK branch (L134-142, on JSONDecodeError/ValueError/TypeError) returns:
  persona="beginner", interest_tags=[], preferred_content="", primary_topic="",
  emotional_state="neutral", content_preference="mixed", search_query="".
Enum sets (L78-79): _VALID_EMOTIONAL_STATES = {grieving,distressed,curious,professional,
neutral}; _VALID_CONTENT_PREFERENCES = {stories,research,mixed}. Matches Revamp.md PART 1.

**Finding 3 — how tests run / importability.**
- Tests use stdlib `unittest` (class `ChatParsingTests(unittest.TestCase)`,
  `unittest.main()` guard). No pytest.ini, no conftest.py in the repo (only inside .venv).
- Importability is self-contained: the test file already does
  `ROOT = abspath(join(dirname(__file__),".."))` then `sys.path.insert(0, ROOT)` so
  `routes.chat_route` resolves against `server/`. It also sets MONGO_ATLAS_URL /
  DB_ATLAS_NAME env defaults before import. NO conftest/import shim is needed — only the
  test file changes.
- Runner for the gate: `python -m pytest server/tests` OR `python -m unittest
  server.tests.test_chat_parsing` (both work; pytest also collects unittest classes).

### FILE TO CHANGE (exactly ONE)
`d:\Program Files (x86)\Final_Project\server\tests\test_chat_parsing.py`
(No conftest, no import shim, no source files. Only this test file.)

### EXACT CHANGES

**Change A — fix the import (remove the dead symbol).** Lines 11-15 become:
```
from routes.chat_route import (
    format_conversation,
    parse_persona_profile,
)
```
(Drop `parse_score_response`.)

**Change B — DELETE the three dead score tests** (current L31-53):
`test_parse_score_response_valid_json`, `test_parse_score_response_markdown_json`,
`test_parse_score_response_invalid_returns_default`. Rationale in Finding 1: the function
and its behavior no longer exist; scoring is now persona-derived. PRESERVE
`test_format_conversation` unchanged.

**Change C — resync the three `parse_persona_profile` expected dicts to the full 7-key
schema** with enum-aware defaults (emotional_state="neutral", content_preference="mixed"),
preserving each test's ORIGINAL INTENT.

C1. `test_parse_persona_profile_with_string_tags` — intent: string `interest_tags`
coerced to a list; passthrough of provided fields; defaults for omitted fields.
Note: input has `"preferred_content": "data"` and `"persona":"researcher"`; it does NOT
provide emotional_state or content_preference, so both DEFAULT. preferred_content passes
through verbatim ("data"). primary_topic absent → "". Expected:
```
{
    "persona": "researcher",
    "interest_tags": ["trauma"],
    "preferred_content": "data",
    "primary_topic": "",
    "emotional_state": "neutral",
    "content_preference": "mixed",
    "search_query": "trauma israel",
}
```
CAVEAT TO VERIFY DURING CODING: the input tag is the literal string "trauma", which is a
member of `_GENERIC_TAGS` (L72). `_clean_tags(["trauma"], primary_topic="")` would FILTER
it and, with empty primary_topic, return `[]` — NOT `["trauma"]`. The original test
asserted `["trauma"]`, which is INCONSISTENT with the live (and pre-existing) _clean_tags
generic-filter behavior. Implementer MUST run the test and, if it fails on this line,
change the INPUT tag to a NON-generic value (e.g. `"PTSD"`) and assert
`"interest_tags": ["PTSD"]`, so the test genuinely verifies string→list COERCION (the real
intent) rather than smuggling in a generic-tag passthrough that the code is designed to
strip. Do NOT weaken the assertion to `[]`; fix the fixture so coercion is actually
exercised. State the chosen value in the implementation notes.

C2. `test_parse_persona_profile_with_missing_fields` — input `"{}"` (valid empty JSON →
SUCCESS branch, all `.get()` defaults). Intent: every field defaults. Expected:
```
{
    "persona": "beginner",
    "interest_tags": [],
    "preferred_content": "",
    "primary_topic": "",
    "emotional_state": "neutral",
    "content_preference": "mixed",
    "search_query": "",
}
```

C3. `test_parse_persona_profile_malformed_json` — input is unterminated JSON
(```json\n{...interest_tags:[...]\n``` with no closing brace) → JSONDecodeError →
FALLBACK branch. Intent: malformed JSON yields the full default dict. Expected: IDENTICAL
to C2 (the fallback dict equals the all-defaults success dict). Keep the same expected dict
as C2.

**Optional coverage strengthening (DECISION: YES, minimal, no scope creep):** In C1, since
emotional_state/content_preference are now first-class, the expected dict already asserts
their DEFAULTS — that is sufficient. Additionally, ADD ONE small new test
`test_parse_persona_profile_valid_enums_passthrough` that feeds valid non-default enum
values and asserts they pass through (locks the enum-passthrough path, complementing the
default path):
```
def test_parse_persona_profile_valid_enums_passthrough(self):
    raw = '{"persona": "informed learner", "primary_topic": "children", "emotional_state": "grieving", "content_preference": "research"}'
    result = parse_persona_profile(raw)
    self.assertEqual(result["emotional_state"], "grieving")
    self.assertEqual(result["content_preference"], "research")
    self.assertEqual(result["persona"], "informed learner")
    self.assertEqual(result["primary_topic"], "children")
```
(Uses Revamp.md-valid values grieving/research so it also guards against enum drift. Uses a
non-generic primary_topic "children" — no _clean_tags concern since no interest_tags given.)
This is the only NEW assertion added; it strengthens coverage of B-1/B-fix without
touching the deleted-score concern.

### WHAT TO PRESERVE
- `test_format_conversation` — unchanged (still valid; format_conversation unchanged).
- The file's import-bootstrap block (L1-9: sys.path insert + env defaults) — unchanged;
  it is what makes `routes.chat_route` importable without a conftest.
- The `if __name__ == "__main__": unittest.main()` guard — unchanged.
- unittest style (do NOT convert to pytest-style asserts).
- Do NOT weaken any assertion merely to pass — every expected dict must reflect the
  CORRECT live behavior per Revamp.md PART 1. The only deletions are the three score tests
  whose target function/behavior no longer exists.
- Touch NO source files, NO conftest, NO other test.

### INVARIANTS
- Exactly ONE file changed: `server/tests/test_chat_parsing.py`. No new files. No source/
  conftest/shim edits.
- After this step the FULL suite must IMPORT and PASS. This becomes the real test gate for
  B-3 / B-4 / B-5.

### VERIFICATION (post-coding)
- `python -m pytest server/tests` → collects with NO ImportError; all tests PASS.
  (Equivalently `python -m unittest server.tests.test_chat_parsing` from repo root, or
  `python -m unittest test_chat_parsing` run from `server/tests`.)
- Confirm no remaining reference to `parse_score_response` anywhere in the test file.
- Confirm the three persona expected dicts each have all 7 keys with
  emotional_state="neutral", content_preference="mixed" defaults (and the passthrough test
  asserts grieving/research).
- Confirm `test_format_conversation` still passes unchanged.
- Implementation notes MUST record the value chosen for the C1 string-tags fixture (e.g.
  "PTSD") if the literal "trauma" was filtered by _clean_tags.

Status: DONE — awaiting review

Implementation note: C1 string-tags fixture changed from "trauma" (a _GENERIC_TAGS
member that _clean_tags strips → []) to "PTSD" (non-generic), asserting
interest_tags=["PTSD"] so the test genuinely exercises string→list coercion.
Runner: pytest is not installed in .venv; used `python -m unittest` instead
(`python -m unittest server.tests.test_chat_parsing` and `python -m unittest
discover -s server/tests`). 5 tests collected, no ImportError, all PASS.

---

## Upcoming Steps

- **B-3**: `server/routes/ai_assistant_route.py` — emotional guidance + rebuild system prompt
- **B-4**: `server/routes/articles_route.py` — persona_boost + matched_tags + abstract projection fix
- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
