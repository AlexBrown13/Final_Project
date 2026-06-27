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

---

## Current Step — IN PROGRESS

### B-1: `server/utils/chat_prompts.py` — new extraction schema (emotional_state, content_preference)

**Status: IN PROGRESS**

**Scope: ONE file only —** `server/utils/chat_prompts.py`. No other file is edited in B-1. The parsing of the two new fields is deliberately deferred to B-2 (`chat_route.py` `parse_persona_profile`), so B-1 changes the prompt CONTRACT only, not any Python that consumes it.

**Why one file is enough / safe:**
- `PERSONA_PROFILE_SYSTEM_PROMPT` (this file) is the sole place that defines the JSON schema the LLM must return.
- `extract_persona_profile()` in `server/services/groq.py` just passes the prompt through to Groq and returns the raw string — it is schema-agnostic, no change needed.
- `parse_persona_profile()` in `server/routes/chat_route.py` (L111–134) reads only the 5 existing keys with `parsed.get(...)`. Adding two extra keys to the model output is backward-compatible: unknown keys are simply ignored until B-2 wires them. No crash risk.

**Exact changes to make in `server/utils/chat_prompts.py`:**

1. **`PERSONA_PROFILE_SYSTEM_PROMPT` — expand the field list from 5 to 7 fields.**
   - Change the line "Provide only valid JSON with these five fields:" → "...with these seven fields:".
   - Keep all 5 existing field definitions verbatim: `persona`, `interest_tags`, `preferred_content`, `primary_topic`, `search_query`.
   - ADD field definition `emotional_state`: one of a fixed closed vocabulary. Proposed enum:
     `"distressed"`, `"seeking_support"`, `"curious"`, `"neutral"`, `"analytical"`.
     Description: infer the user's emotional posture toward the topic from tone and word choice
     (personal pain / urgency → "distressed" or "seeking_support"; general interest → "curious";
     detached/clinical/data-driven → "analytical"; insufficient signal → "neutral").
     This drives tone of the AI assistant (B-3) and content framing.
   - ADD field definition `content_preference`: one of a fixed closed vocabulary. Proposed enum:
     `"stories"`, `"mixed"`, `"data"`.
     Description: the structured form of `preferred_content` — `"stories"` = personal narratives /
     accessible explanations, `"data"` = research / statistics / clinical frameworks,
     `"mixed"` = both. This is the machine-readable companion to the free-text `preferred_content`
     (which is PRESERVED, not replaced) and will drive persona_boost / article mix (B-4).
   - Note explicitly in the prompt that `content_preference` must be one of the three exact strings,
     and `emotional_state` one of the five exact strings (closed enums → safe defaulting in B-2).

2. **Update the trailing Rules block at the bottom of the prompt:**
   - "All five fields are required" → "All seven fields are required".
   - Keep "Return only valid JSON with no markdown fences or extra explanation".

3. **No change to `DYNAMIC_QUESTION_SYSTEM_PROMPT`, `FIRST_QUESTION`, or `SEED_QUESTIONS`.**
   These already probe content preference (SEED_QUESTIONS[1]) and motivation, which feed both new
   fields — no additional question needed for B-1.

**What to PRESERVE (do not touch):**
- All 5 existing JSON field names and their exact descriptions (downstream parsing in B-2/B-4 relies on them).
- `preferred_content` stays as a free-text field; `content_preference` is ADDED alongside, not a rename.
- `search_query` rules block, the persona definitions, edge-case rules, language rule.
- `max_tokens=450` in `groq.py` — two short enum fields fit comfortably; flag for B-2 to re-check only if output truncates.

**Constraints / invariants:**
- Touch exactly 1 file. No server route, no auth, no test, no client file edited.
- Enum values must be lowercase snake/single tokens to make B-2 defaulting trivial
  (`emotional_state` fallback → `"neutral"`, per B-2 one-liner; `content_preference` fallback → `"mixed"` — confirm in B-2).
- Pure-string/prompt edit: no Python lint impact (lint baseline stays 24 pre-existing).
- After edit: run `graphify update .` (AST-only) to refresh the graph; the prompt constant node label is unchanged so the graph delta is minimal.

**Hand-off note to B-2:** add `emotional_state` and `content_preference` to `parse_persona_profile`'s
returned dict and to its except-branch defaults (`emotional_state="neutral"`, `content_preference="mixed"`),
and add `content_preference` to the `_clean`/normalize path if any normalization is desired.

---

## Upcoming Steps

- **C-4**: Wire all three personas to real data — Guardian fetch, articles fetch, session profile
- **B-2**: `server/routes/chat_route.py` — parse new fields, fallback emotional_state → "neutral"
- **B-3**: `server/routes/ai_assistant_route.py` — emotional guidance + rebuild system prompt
- **B-4**: `server/routes/articles_route.py` — persona_boost + matched_tags + abstract projection fix
- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
