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

## B-4: `server/routes/articles_route.py` — article ranking persona_boost + matched_tags (+ verify abstract projection) — IN PROGRESS

**Source of truth:** Revamp.md PART 4 (lines 196-243). ONE source file only:
`d:\Program Files (x86)\Final_Project\server\routes\articles_route.py` (205 lines total).

**Test gate (must pass, no regressions):** `python -m unittest discover -s server/tests`
(currently `Ran 5 tests in 0.001s OK`). Note: `rank_articles()` is a pure function and is
not currently covered. An OPTIONAL small unit test is noted below; the gate may stay at 5
tests (orchestrator decision: tests may stay as-is, non-regression guard only).

### INVESTIGATION FINDINGS (authoritative — read from source + Revamp.md PART 4)

Graphify orientation: GRAPH_REPORT Community 8 contains exactly the ranking surface —
`articles()`, `build_query()`, `get_articles()`, `rank_articles()`, `sanitize_tags()`, plus
the docstring nodes "Sort articles using the content_score..." and "Validate and sanitize a
list of topic tags...". This confirms `articles_route.py` is the only file in scope and the
only ranking function is `rank_articles()`. No other community references rank_articles.

**Finding 1 — `rank_articles()` current state (L37-60).**
- Signature L37: `def rank_articles(articles: list, user_tags: list) -> list:` —
  `user_tags` is currently accepted but NOT USED (no tag matching today).
- Per-article computation L52-56:
  - L52: `content_score = float(article.get("content_score") or 0.0)`
  - L53: `click_score = min(article.get("click_count", 0) / 10.0, 1.0)`  (capped at 10 clicks)
  - L54-55: `year = article.get("year") or 2000`;
    `recency_score = max(0.0, min((int(year) - 2000) / 26.0, 1.0))`  (2000–2026 range)
  - L56 (THE FORMULA): `final = 0.6 * content_score + 0.25 * click_score + 0.15 * recency_score`
  - L57: `scored.append((final, article))`
- L59-60: `scored.sort(key=lambda x: x[0], reverse=True)` then return ranked list.
- Empty-input guard L47-48 (`if not articles: return articles`) — PRESERVE.
- Docstring L38-46 describes the OLD 0.6/0.25/0.15 weights — MUST be updated to the new
  weights + persona_boost so it does not lie.

**Finding 2 — abstract projection (CRITICAL CHECK — Revamp.md line 226 is STALE).**
- Revamp.md line 226 warns the `get_articles()` projection does NOT return `abstract` and
  that persona_boost + matched_tags will silently be 0 unless `"abstract": 1` is added.
- ACTUAL CODE: the projection at L87-99 ALREADY INCLUDES **`"abstract": 1` at L95**.
  Full projected fields: `_id, openalex_id, title, year, journal, url, pdf_url, abstract,
  authors, click_count, content_score`.
- **CONCLUSION: the projection fix is ALREADY SATISFIED in the live code. The Revamp.md
  warning predates a prior commit that added it.** B-4 must NOT re-add a duplicate key.
  The implementer's job here is to VERIFY `"abstract": 1` is still present (do not remove
  it) — it is required by both persona_boost and matched_tags. Reviewer: confirm L95 (or
  wherever abstract lands) stays in the projection.

**Finding 3 — the `GET /api/articles` handler (`get_articles()`, L74-112).**
- L78: `user_id = get_jwt_identity()` (auth identity, scopes the article query) — PRESERVE.
- L80-83: persona/session read at request time:
  - L80: `quiz_user_id = request.args.get("quiz_user_id")`
  - L81: `session = chat_collection.find_one({"user_id": quiz_user_id}, {"persona_profile": 1}) if quiz_user_id else None`
  - L82: `persona_profile = session.get("persona_profile", {}) if session else {}`
  - L83: `user_tags = (persona_profile.get("interest_tags") or [])`
- L85-100: the projected `articles_collection.find(...)` cursor (see Finding 2).
- L102-105: cursor → list, stringify `_id`.
- L107: `articles = rank_articles(articles, user_tags)`  ← call site to extend.
- L109: `return jsonify({"articles": articles, "persona_profile": persona_profile}), 200`
  — the response shape. matched_tags is added PER ARTICLE inside the `articles` list, so
  the top-level shape is unchanged; the client (C-4 mapArticle) already defaults
  `matchedTags → []`, so this is backward-compatible.
- L110-112: outer try/except 500. PRESERVE.
- The OTHER routes — `update_profile()` PUT (L115-158), `articles()` POST (L161-184),
  `track_click()` POST (L187-204) — are OUT OF SCOPE and UNTOUCHED.

**Finding 4 — enums (post B-fix, confirmed).**
- `emotional_state` ∈ {grieving, distressed, curious, professional, neutral}.
- `content_preference` ∈ {stories, research, mixed}.
- persona_boost keys off `content_preference` + `emotional_state` ONLY (per Revamp.md
  PART 4) — `persona` (the "informed learner" string) is NOT used here. Do not branch on it.

### EXACT CHANGES (single file: `server/routes/articles_route.py`)

**Change 0 — VERIFY abstract projection (no edit expected).** Confirm `"abstract": 1`
remains in the `get_articles()` projection (currently L95). Do not remove; do not duplicate.
If, and only if, it were missing, add it — but per Finding 2 it is already present.

**Change 1 — add a module-level `persona_boost` helper** (place it directly ABOVE
`rank_articles()`, i.e. before current L37, after `sanitize_tags()`). Pure function, no I/O,
case-insensitive substring matching on the abstract, returns a bounded float in [0.0, 1.0]:

```python
# ── Persona boost keyword groups (Revamp.md PART 4, lines 220-224) ────────────
_STORIES_KEYWORDS = ("case study", "narrative", "interview", "testimony",
                     "survivor", "personal account", "qualitative")
_RESEARCH_KEYWORDS = ("prevalence", "epidemiological", "randomized", "meta-analysis",
                      "systematic review", "cohort", "longitudinal")
_SUPPORT_KEYWORDS = ("support", "intervention", "treatment", "therapy",
                     "recovery", "coping", "resilience")
_PROFESSIONAL_KEYWORDS = ("clinical", "framework", "protocol", "evidence-based",
                          "intervention", "efficacy")
# Abstracts that are "purely epidemiological" get demoted for grieving/distressed users.
_EPIDEMIOLOGICAL_KEYWORDS = ("prevalence", "epidemiological", "incidence",
                             "meta-analysis", "systematic review", "cohort")


def persona_boost(abstract: str, emotional_state: str, content_preference: str) -> float:
    """
    Bounded [0.0, 1.0] persona-fit score from case-insensitive keyword matching on the
    article abstract (NO ML). Per Revamp.md PART 4 (lines 220-224). content_preference and
    emotional_state independently contribute; the demote rule subtracts for grieving/
    distressed users when the abstract is purely epidemiological.
    """
    text = (abstract or "").lower()
    if not text:
        return 0.0

    boost = 0.0

    # content_preference contribution (0.5 if any group keyword present)
    if content_preference == "stories" and any(k in text for k in _STORIES_KEYWORDS):
        boost += 0.5
    elif content_preference == "research" and any(k in text for k in _RESEARCH_KEYWORDS):
        boost += 0.5

    # emotional_state contribution (0.5 if any group keyword present)
    if emotional_state in ("grieving", "distressed"):
        if any(k in text for k in _SUPPORT_KEYWORDS):
            boost += 0.5
        # demote purely epidemiological abstracts for vulnerable users
        if any(k in text for k in _EPIDEMIOLOGICAL_KEYWORDS) \
                and not any(k in text for k in _SUPPORT_KEYWORDS):
            boost -= 0.5
    elif emotional_state == "professional":
        if any(k in text for k in _PROFESSIONAL_KEYWORDS):
            boost += 0.5

    # bound to [0.0, 1.0]
    return max(0.0, min(boost, 1.0))
```

Algorithm rationale (spelled out so the implementer has zero ambiguity):
- Two independent contributions, each worth **0.5** when its keyword group matches:
  one from `content_preference`, one from `emotional_state`. Max raw boost = 1.0 (matches
  the 0.10 weight cleanly: a perfectly-fit article gets the full +0.10 term).
- `content_preference == "mixed"` (the default) contributes 0 — neutral, no story/research
  preference. `emotional_state` in {curious, neutral} contributes 0 — no boost group is
  defined for them in PART 4 (only grieving/distressed and professional have groups).
- **Demote rule** (PART 4 line 223): for grieving/distressed users, if the abstract is
  "purely epidemiological" (contains an epidemiological keyword AND contains NO support
  keyword) subtract 0.5. The `not any(support)` clause is what makes it "purely"
  epidemiological — an abstract that has both stats AND support language is not demoted.
- Final clamp `max(0.0, min(boost, 1.0))` keeps the term in [0,1] so the 0.10 weight behaves
  predictably and a demote can never push final_score negative via this term.

**Change 2 — extend `rank_articles()` signature** (L37):
```python
def rank_articles(articles: list, user_tags: list,
                  emotional_state: str = "curious",
                  content_preference: str = "mixed") -> list:
```
(Defaults per Revamp.md line 209: `emotional_state="curious"`, `content_preference="mixed"`.)

**Change 3 — update the `rank_articles()` docstring (L38-46)** to state the NEW weights
(0.60 content / 0.25 click / 0.05 recency / 0.10 persona_boost) and that persona_boost is
keyword matching on the abstract, no ML. (Doc only — keep it honest.)

**Change 4 — new formula inside the per-article loop (replace L56).** Keep L52-55
(content_score, click_score, year, recency_score) VERBATIM — only the weighting line and a
new persona term change:
```python
        boost = persona_boost(article.get("abstract"), emotional_state, content_preference)
        final = (0.60 * content_score
                 + 0.25 * click_score
                 + 0.05 * recency_score
                 + 0.10 * boost)
```
(Weights per Revamp.md lines 214-218: recency reduced 0.15→0.05, persona_boost weight 0.10.
Sum of weights = 1.00.) Preserve L57 `scored.append((final, article))` and the L59-60 sort.

**Change 5 — compute matched_tags after ranking, inside `get_articles()`.** Per Revamp.md
lines 232-241. Insert BETWEEN the current L107 (`articles = rank_articles(...)`) and the
L109 return. Loop over the already-ranked list and attach `matched_tags` to each article
dict (mutating in place is fine — they are plain dicts from the cursor):
```python
        articles = rank_articles(
            articles, user_tags,
            emotional_state=persona_profile.get("emotional_state", "curious"),
            content_preference=persona_profile.get("content_preference", "mixed"),
        )

        for article in articles:
            title = (article.get("title") or "").lower()
            abstract = (article.get("abstract") or "").lower()
            article["matched_tags"] = [
                tag for tag in user_tags
                if tag.lower() in title or tag.lower() in abstract
            ]
```
Notes:
- This REPLACES the current L107 call (which passes only `articles, user_tags`) with the
  4-arg call that reads `emotional_state` + `content_preference` from `persona_profile`
  (already loaded at L82). Defaults "curious"/"mixed" match rank_articles + Revamp.md.
- `user_tags` is already `persona_profile.get("interest_tags") or []` (L83) — reuse it.
- matched_tags is computed POST-rank per PART 4 ("After ranking, compute which of the user's
  interest_tags appear in each article"). Ordering of articles is unchanged by this loop.
- The default-empty `user_tags` → every article gets `matched_tags: []`, which the client
  already tolerates (C-4 mapArticle defaults matchedTags → []). Backward-compatible.

**Change 6 — response shape (L109).** UNCHANGED at the top level:
`return jsonify({"articles": articles, "persona_profile": persona_profile}), 200`. Each
article in `articles` now carries an extra `matched_tags` key. No new top-level field.

### WHAT TO PRESERVE (Revamp.md PART 4 + route invariants)
- `content_score` / `click_score` / `recency_score` computations and their data sources
  (`content_score`, `click_count` capped at 10, `year` 2000–2026) — UNCHANGED (L52-55).
- The empty-articles guard (L47-48) and the sort (L59-60) — UNCHANGED.
- `"abstract": 1` in the projection (L95) — MUST REMAIN (persona_boost + matched_tags need it).
- Auth: `@jwt_required()` + `get_jwt_identity()` scoping the article query (L75-78) — UNCHANGED.
- The request-time session/persona read (L80-83) — reused, not changed (we now also read
  emotional_state + content_preference from the same `persona_profile`).
- Top-level response shape `{"articles": [...], "persona_profile": {...}}` (L109) — UNCHANGED.
- The outer try/except 500 (L110-112) — UNCHANGED.
- The OTHER routes: `update_profile()` PUT, `articles()` POST, `track_click()` POST —
  UNTOUCHED. `sanitize_tags()`, `build_query()` — UNTOUCHED.
- No ML / no network calls added; persona_boost is pure keyword matching.

### INVARIANTS
- Exactly ONE file changed: `server/routes/articles_route.py`. No new files. No edits to
  chat_route.py / ai_assistant_route.py / tests / client.
- persona_boost branches ONLY on content_preference + emotional_state (never on `persona`).
- New formula weights sum to 1.00 (0.60 + 0.25 + 0.05 + 0.10).
- persona_boost return is clamped to [0.0, 1.0]; the demote can never make final negative.
- matched_tags is a list on EVERY returned article (>=[]), computed post-rank, both title
  and abstract checked, all comparisons lowercased.
- abstract projection key present exactly once (Finding 2).

### VERIFICATION (post-coding)
- Test gate: `python -m unittest discover -s server/tests` → still `Ran 5 tests ... OK`
  (non-regression; B-4 touches no currently-tested function).
- `python -c "import ast; ast.parse(open(r'server/routes/articles_route.py').read())"` —
  file parses clean.
- Grep the file: confirm `0.60 * content_score`, `0.05 * recency_score`, `0.10 * boost`
  present; old `0.6 * content_score ... 0.15 * recency_score` line GONE; `"abstract": 1`
  present exactly once; `matched_tags` assignment present; `def persona_boost(` present;
  4-arg `rank_articles(` signature present.
- Spot-check weight sum = 1.00 and recency dropped 0.15→0.05.
- After coding: `graphify update .` to refresh the graph (Community 8 will gain persona_boost).

### OPTIONAL (orchestrator decision — tests may stay as-is)
A focused unit test for `persona_boost` / `rank_articles` would add real coverage of the new
logic (e.g. stories-pref abstract with "narrative" → boost > 0; grieving + purely
epidemiological abstract → demoted below a support-bearing one; mixed/curious → boost 0).
If added, it lives in `server/tests/` and the gate count rises from 5. B-2a established the
gate; this step does NOT require new tests to land. RECOMMENDATION: add the small test if
cheap, otherwise keep the gate as a non-regression guard.

**Status: IN PROGRESS**

---

## Upcoming Steps

- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
