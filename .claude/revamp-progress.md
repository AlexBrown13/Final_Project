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

## B-3: `server/routes/ai_assistant_route.py` — wire ALL profile fields into the article-chat (RAG) system prompt — DONE — awaiting review

**Source of truth:** Revamp.md PART 3 (lines 132-192). ONE source file only.

**Test gate (must pass, no regressions):** `python -m unittest discover -s server/tests`
(currently `Ran 5 tests in 0.001s OK`). Note: B-3 does not change tested code paths, so
the gate is a non-regression guard, not new coverage.

### INVESTIGATION FINDINGS (authoritative, from source + Revamp.md)

**Graphify orientation:** GRAPH_REPORT god/community map — `ai_assistant()` lives in
Community 265 (with ask_ollama/check_ollama/main/save_conversation_to_db); the
`article_chat()` route lives in Community 12. Only the `article_chat()` handler is touched
by B-3.

**Finding 1 — the file and the exact lines (`server/routes/ai_assistant_route.py`, 130 lines total).**
- `article_chat()` is defined at L41-130 (route `'/article-chat'`, POST, `@jwt_required()`).
- The OTHER route `ai_assistant()` (L17-38, `'/ai/assistant'`) is NOT touched.
- Module-level 5-minute cache: `_articles_cache` (L10) + `_ARTICLES_CACHE_TTL = 5 * 60` (L11).
  Cache read/populate logic is L57-66. **PRESERVE verbatim.**
- Session/persona lookup block: L68-79. Currently:
  - L72: `persona = "informed learner"` (default).
  - L73-77: secure JWT-identity lookup of `chat_collection`, with fallback to
    `quiz_user_id` from body (current data model). **PRESERVE this lookup logic.**
  - L78-79: `if session:` then
    `persona = (session.get("persona_profile") or {}).get("persona", "informed learner")`.
    This is the ONLY-persona extraction that B-3 expands to all 6 fields.
- Article context block: L81-88. Format is numbered `[{i+1}] {title} ({year})\n{abstract[:400]}`
  (400-char abstract truncation, "Untitled"/"n/a"/"No abstract." fallbacks). **PRESERVE verbatim.**
- Current 3-string tone map: L90-96 (researcher / beginner / else). **REPLACED** by the new
  persona+emotional_state tone map.
- Current `system_content`: L100-106. **REPLACED** by the PART 3 template.
- History handling (L108-112: system msg + `history[-4:]` + final user turn) — **PRESERVE.**
- `client.chat.completions.create(...)` at L114-120: `model="llama-3.3-70b-versatile"`,
  `temperature=0.5`, **`max_tokens=800` (L118)** — **PRESERVE.**
- Empty-response guard L121-123 (returns 503) and answer return L124-126 — **PRESERVE.**
- Outer try/except (L44, L128-130) returning `{"error": "Assistant unavailable."}` 500 —
  **PRESERVE** (this is the route's distress/failure handling).

**Finding 2 — session object shape & profile field names.**
- `session = chat_collection.find_one({...}, {"persona_profile": 1})` → either `None` or a
  doc with `persona_profile`. `session.get("persona_profile")` may be `None`, hence the
  `or {}` guard. So `profile = session.get("persona_profile") or {}` is correct.
- Field names produced by `parse_persona_profile` (chat_route.py L114-142, confirmed via
  B-2a Finding 2) are snake_case: `persona`, `emotional_state`, `content_preference`,
  `primary_topic`, `interest_tags` (plus `preferred_content`, `search_query` which B-3 does
  not use). `interest_tags` is a LIST. **PART 3's `profile.get(...)` extraction matches.**
- CRITICAL live `persona` values: `"beginner" | "informed learner" | "researcher"` — note
  the SPACE in "informed learner". The new tone map MUST key off these exact strings.
- Live enums (chat_route.py L78-79, post B-fix): emotional_state ∈ {grieving, distressed,
  curious, professional, neutral}; content_preference ∈ {stories, research, mixed}. The five
  emotional_guidance branches cover exactly the emotional_state enum.

**Finding 3 — the emotional_state default discrepancy (FLAGGED + DECISION).**
- B-fix default for emotional_state is `"neutral"`; Revamp.md PART 3 line 154 uses
  `profile.get("emotional_state", "curious")`.
- This default ONLY fires when the `emotional_state` KEY is entirely ABSENT from the stored
  doc (legacy/partial profile). Any profile created through the current quiz pipeline always
  carries a valid enum value (parse defaults it to "neutral"), so for live data the `.get()`
  default is effectively dead.
- **DECISION (orchestrator):** FOLLOW Revamp.md PART 3 verbatim — use default `"curious"`
  in `ai_assistant_route.py`. Rationale: PART 3 is the stated source of truth for THIS step,
  the default is near-unreachable for real sessions, and the assistant context tolerates
  either valid enum value. This is a deliberate, documented deviation from the B-fix parse
  default (which stays "neutral" in chat_route.py — NOT changed by B-3).

### FILE TO CHANGE (exactly ONE)
`d:\Program Files (x86)\Final_Project\server\routes\ai_assistant_route.py`
(No other route, no chat_route.py, no articles_route.py, no tests, no client.)

### EXACT CHANGES

**Change A — expand session field extraction.** Replace L78-79:
```python
        if session:
            persona = (session.get("persona_profile") or {}).get("persona", "informed learner")
```
with (keep the `persona = "informed learner"` pre-default at L72 and the lookup at L73-77
unchanged; on `if session:` populate all 6 locals from the profile):
```python
        profile = (session.get("persona_profile") or {}) if session else {}
        persona = profile.get("persona", "informed learner")
        emotional_state = profile.get("emotional_state", "curious")
        content_preference = profile.get("content_preference", "mixed")
        primary_topic = profile.get("primary_topic", "")
        interest_tags = profile.get("interest_tags", [])
```
(Implementation note: this collapses the `if session:` guard into a single `profile` assign
so all five derived fields default cleanly when `session` is None. The pre-existing L72
`persona = "informed learner"` default may be dropped if it becomes redundant, OR kept —
implementer's choice as long as `persona` defaults to "informed learner" when no session.
Net behavior: identical default for persona; four new locals.)

**Change B — replace the 3-string tone map (L90-96) with a persona+emotional_state map.**
Build `emotional_guidance` first, then `tone`. EXACT strings from Revamp.md PART 3:

`emotional_guidance` keyed on `emotional_state` (lines 161-165):
```python
        EMOTIONAL_GUIDANCE = {
            "grieving": "This user may be processing personal loss. Be gentle and warm. Validate their emotional experience before presenting facts. Do not lead with statistics or clinical language. If they seem overwhelmed, it is appropriate to mention ERAN 1201 (crisis support line).",
            "distressed": "This user may be struggling. Keep responses short, clear, and warm. Avoid overwhelming them with information. If crisis language appears, mention ERAN 1201.",
            "curious": "This user is exploring intellectually. Be engaging, thorough, and willing to go deep on topics they ask about.",
            "professional": "This user works with trauma survivors professionally. Focus on practical clinical frameworks, intervention strategies, and citable findings they can use with clients. Be direct and information-dense.",
            "neutral": "This user has not expressed strong emotional signals. Be informative, clear, and balanced. Match their tone.",
        }
        emotional_guidance = EMOTIONAL_GUIDANCE.get(emotional_state, EMOTIONAL_GUIDANCE["neutral"])
```
(Default-to-"neutral" guidance for any out-of-enum value — "neutral" is the documented
most-common case per line 165.)

`tone` keyed on `persona` AND `emotional_state` together (lines 167-173). Note persona key
`"informed learner"` WITH the space, and `"informed learner" + any` is the catch-all:
```python
        if persona == "researcher":
            if emotional_state in ("grieving", "distressed"):
                tone = "Be precise but compassionate. This researcher may have a personal connection to the topic."
            else:  # professional / curious / neutral (and any other)
                tone = "Use academic language. Be precise and data-focused. Reference specific articles by number."
        elif persona == "beginner":
            if emotional_state in ("grieving", "distressed"):
                tone = "Use very simple, warm language. No jargon at all. Lead with empathy before information."
            elif emotional_state == "curious":
                tone = "Use simple, friendly language. Explain concepts clearly. Make it accessible and engaging."
            else:  # neutral (and any other)
                tone = "Use simple, clear language. Be welcoming and informative without being clinical."
        else:  # "informed learner" + any (also the safe fallback for unknown personas)
            tone = "Balance accessibility with depth. Reference articles when relevant. Match the user's tone."
```
Mapping coverage check vs Revamp.md lines 168-173:
- researcher + professional/curious/neutral → academic string ✓ (else branch)
- researcher + grieving/distressed → "precise but compassionate" ✓
- beginner + grieving/distressed → "very simple, warm ... empathy before information" ✓
- beginner + curious → "simple, friendly ... accessible and engaging" ✓
- beginner + neutral → "simple, clear ... welcoming ... without being clinical" ✓
- informed learner + any → "Balance accessibility with depth ..." ✓

**Change C — rebuild `system_content` (replace L100-106) with the PART 3 template
(lines 176-189), verbatim in substance:**
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
(Edge note: `', '.join(interest_tags)` requires `interest_tags` to be a list of strings —
it is, per parse_persona_profile `_clean_tags`. Defensive `str()` coercion inside join is
acceptable but not required; keep it simple unless a non-string slips through.)

### WHAT TO PRESERVE (Revamp.md line 192 + route invariants)
- The article context format (L81-88): numbered `[{i+1}]`, title + `(year)`, 400-char
  abstract truncation, all `Untitled`/`n/a`/`No abstract.` fallbacks — UNCHANGED.
- `max_tokens=800` (L118), `model="llama-3.3-70b-versatile"`, `temperature=0.5` — UNCHANGED.
- The 5-minute server-side article cache (`_articles_cache`, `_ARTICLES_CACHE_TTL`, L57-66) —
  UNCHANGED.
- Auth: `@jwt_required()` + `get_jwt_identity()` + the secure JWT-identity-first session
  lookup with `quiz_user_id` fallback (L68-77) — UNCHANGED.
- Crisis/distress handling: ERAN 1201 mentions are now IN the guidance strings (grieving +
  distressed) per spec; the outer try/except 500 "Assistant unavailable." and the 503
  empty-response guard — UNCHANGED.
- The OTHER route `ai_assistant()` (L17-38) — UNTOUCHED.
- Do NOT change the articles fetch, history handling, or any other route/file.

### INVARIANTS
- Exactly ONE file changed: `server/routes/ai_assistant_route.py` (only the `article_chat()`
  handler body). No new files. No edits to chat_route.py / articles_route.py / tests / client.
- `persona` key `"informed learner"` (WITH space) handled as a first-class branch / catch-all.
- All five emotional_guidance branches present and verbatim-in-substance vs lines 161-165,
  including ERAN 1201 in grieving + distressed.
- All six tone combinations present and verbatim-in-substance vs lines 168-173.
- system_content matches the lines 176-189 template field-for-field and order-for-order.

### VERIFICATION (post-coding)
- Test gate: `python -m unittest discover -s server/tests` → still `Ran 5 tests ... OK`
  (no regression; B-3 touches no tested function).
- `python -c "import ast; ast.parse(open(r'server/routes/ai_assistant_route.py').read())"`
  (or import the module) — file parses / imports clean.
- Grep the new file: confirm `max_tokens=800` present; `_ARTICLES_CACHE_TTL` unchanged;
  article-context f-string `[400]` slice present; both ERAN 1201 mentions present; persona
  key `"informed learner"` present.
- Confirm the old 3-string tone block and old system_content are fully gone.
- After coding: `graphify update .` to refresh the graph.

**Status: DONE — awaiting review**
Commit: `1be5319`. One file changed (`server/routes/ai_assistant_route.py`, `article_chat()`
handler only): Change A (6 profile locals), Change B (EMOTIONAL_GUIDANCE dict + persona×
emotional_state tone), Change C (PART 3 system_content template). Test gate green
(`Ran 5 tests ... OK`), file parses, graphify updated. Preserved: article-context format,
max_tokens=800, model/temp, 5-min cache, auth+lookup, history, 503/500 guards, ERAN 1201 in
grieving+distressed, the other route `ai_assistant()`.

---

## Upcoming Steps

- **B-4**: `server/routes/articles_route.py` — persona_boost + matched_tags + abstract projection fix
- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
