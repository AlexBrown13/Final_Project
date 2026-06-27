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

## Current Step — B-fix: align emotional_state + content_preference enums to Revamp.md

**Why:** A spec conflict was found. The committed backend (B-1 chat_prompts.py, B-2
chat_route.py) used OFF-SPEC enum values. Revamp.md is the SOURCE OF TRUTH and the
frontend + design-refs already match it. The backend is the wrong side and must be
corrected.

**Authoritative values (Revamp.md PART 1):**
- `emotional_state` ∈ {grieving, distressed, curious, professional, neutral} (lines 52-61)
- `content_preference` ∈ {stories, research, mixed} (lines 63-70)
- Defaults unchanged: emotional_state → "neutral"; content_preference → "mixed"
  (both remain valid members of the corrected enums).

**Files to change (exactly TWO source files):**

1. `d:\Program Files (x86)\Final_Project\server\utils\chat_prompts.py`
   - Line 92 — replace the emotional_state enum line:
     `- emotional_state: one of "grieving", "distressed", "curious", "professional", "neutral"`
   - Lines 93-96 — replace the inference guidance with Revamp.md signals (closed enum):
     - grieving = personal loss, a family member, October 7 personally, bereavement
     - distressed = current active struggle / overwhelm / crisis language (sub-threshold;
       distress.py already intercepts above-threshold crisis)
     - curious = exploratory, intellectual, enthusiastic about learning, broad questions
     - professional = detached clinical framing, third-person ("my clients",
       "the population I work with"), no personal emotional language
     - neutral = no strong signal, matter-of-fact (default, most common)
     Keep the closing "Must be one of the five exact strings (closed enum)." sentence and
     the note that this drives AI assistant tone (B-3) / content framing.
   - Line 97 — replace the content_preference enum line:
     `- content_preference: one of "stories", "research", "mixed"`
   - Lines 98-101 — replace guidance with Revamp.md meanings (closed enum):
     - stories = human accounts, personal testimonies, accessible journalism
     - research = data, statistics, academic papers, clinical frameworks
     - mixed = both, or unclear
     Keep the note that this is the companion to free-text preferred_content (which is
     PRESERVED) and drives article mix / persona_boost (B-4); keep the "Must be one of the
     three exact strings (closed enum)." sentence.
   - No separate JSON output-example block lists these values (confirmed via grep: enum
     values appear only at lines 92 and 97), so no example needs editing.

2. `d:\Program Files (x86)\Final_Project\server\routes\chat_route.py`
   - Line 78 — `_VALID_EMOTIONAL_STATES = {"grieving", "distressed", "curious", "professional", "neutral"}`
   - Line 79 — `_VALID_CONTENT_PREFERENCES = {"stories", "research", "mixed"}`
   - The success branch (lines 128-129) and fallback branch (lines 139-140) already
     reference these sets and already default to "neutral"/"mixed" — both defaults are
     still valid members. NO further change needed there.

**What to PRESERVE (do NOT change):**
- chat_prompts.py: persona classification logic, the persona enum, interest_tags /
  primary_topic / preferred_content / search_query field text, the free-text
  preferred_content field, the search-query rules block, the field-count "7".
- chat_route.py: `parse_persona_profile` structure (success + fallback branches),
  `_clean_tags`, `_GENERIC_TAGS`, `clean_ai_json`, `reconstruct_conversation`,
  `format_conversation`, all other field defaults, the `except` signature + warning, the
  `chat()` endpoint.

**Scope:** 2 source files. No new files. No client changes. No test edits. Within the
5-file limit; no split required.

**Verification (post-coding, no edits):**
- `parse_persona_profile('{}')` → emotional_state="neutral", content_preference="mixed".
- emotional_state="grieving" / content_preference="research" pass through unchanged.
- emotional_state="seeking_support" or "analytical" (the OLD off-spec values) now coerce
  to "neutral"; content_preference="data" now coerces to "mixed".

**REVIEWER NOTE (process correction):** Going forward, review every step against
**Revamp.md** (the source of truth), NOT only against this progress-file plan. The
original B-1/B-2 deviation slipped through because review checked only the progress plan,
which itself carried the off-spec values.

Status: IN PROGRESS

---

> RECONCILED 2026-06-27: B-2 was COMPLETED and committed (`a9a4c84`). The progress
> file had been left at "IN PROGRESS". The full B-2 plan is retained below for history.

### B-2: `server/routes/chat_route.py` — parse new fields, fallback emotional_state → "neutral" — COMPLETE

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

Status: COMPLETE — committed a9a4c84 (reconciled 2026-06-27)
> ANNOTATION 2026-06-27 (B-fix): The enum SETS introduced here (`_VALID_EMOTIONAL_STATES`
> = {distressed, seeking_support, curious, neutral, analytical}, `_VALID_CONTENT_PREFERENCES`
> = {stories, mixed, data}) were OFF-SPEC vs Revamp.md (source of truth). They are corrected
> by B-fix to {grieving, distressed, curious, professional, neutral} and
> {stories, research, mixed}. Defaults ("neutral"/"mixed") are unchanged and remain valid.
> The B-2 plan text above (which references the old values) is left intact for history.

---

## Upcoming Steps

- **C-3a** (NEXT): Results-page design-fidelity polish vs `client/design-refs/`. Scope:
  (a) Researcher `ArticleRow.jsx` — add zero-padded index, make title a clickable
  button that toggles the abstract, add DOI + copy-to-clipboard row (right-align tags).
  (b) Add language toggle + `dir` state/RTL to `InformedResults.jsx` and
  `ResearcherResults.jsx` (P1 already has it). (c) Fix Beginner "Data Graphs" link
  `/data` → `/graphs/israel`. OUT OF SCOPE: OpenAlex query block (user declined),
  P1 second Guardian mock card, profile-grid field layout (left as-is).

- **C-4**: Wire all three personas to real data — Guardian fetch, articles fetch, session profile
- **B-3**: `server/routes/ai_assistant_route.py` — emotional guidance + rebuild system prompt
- **B-4**: `server/routes/articles_route.py` — persona_boost + matched_tags + abstract projection fix
- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
- **(proposed) B-2a**: resync `server/tests/test_chat_parsing.py` expected dicts to the 7-key persona schema (separate from B-2 to respect the no-test-edit invariant)
