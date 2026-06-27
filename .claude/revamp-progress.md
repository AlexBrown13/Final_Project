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

Review (2026-06-27): all invariants passed.
- Exact enum values verified line-by-line against Revamp.md PART 1 (lines 52-70): MATCH.
- chat_prompts.py line 92: `emotional_state: one of "grieving", "distressed", "curious", "professional", "neutral"` — correct.
- chat_prompts.py line 103: `content_preference: one of "stories", "research", "mixed"` — correct.
- chat_route.py line 78: `_VALID_EMOTIONAL_STATES = {"grieving", "distressed", "curious", "professional", "neutral"}` — correct.
- chat_route.py line 79: `_VALID_CONTENT_PREFERENCES = {"stories", "research", "mixed"}` — correct.
- Inference guidance in chat_prompts.py matches Revamp.md signal descriptions word-for-word.
- Defaults "neutral"/"mixed" unchanged and remain valid members of corrected enums.
- No old off-spec values (seeking_support, analytical, data) found anywhere in either file.
- No tests deleted or edited. No auth/access-control logic touched. No trauma copy altered.
- No client files touched. Frontend results components already used Revamp.md-spec values (confirmed).
- Out-of-scope files in commit: .claude/settings.local.json (allowed-commands list extended, not a source change), Revamp.md (search_query descope annotation, not a B-fix source change), status.log (runtime log append, not source), __pycache__ .pyc files (auto-generated). None are BLOCKER violations.
- Test suite: pre-existing ImportError on test_chat_parsing.py (`parse_score_response` missing from chat_route) confirmed unchanged — tracked for B-2a. No new failures introduced.

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

(Full B-2 plan text retained from prior revision — see git history. B-2 committed a9a4c84.
Enum sets later corrected by B-fix to the Revamp.md values.)

Status: COMPLETE — committed a9a4c84 (reconciled 2026-06-27)

---

## C-3a: Results-page design-fidelity polish vs `client/design-refs/` — IN PROGRESS

**Why:** The three results pages are built (C-1/2/3) but three fidelity gaps remain vs
the design refs and Revamp.md PART 7. This step closes them. Pure frontend; no
backend/test/auth implications.

**Scope: THREE fixes, expected 5 files, all under `client/src`. No new files.**
Within the 5-file limit; no split required.

**Files to change (exactly 5):**
1. `d:\Program Files (x86)\Final_Project\client\src\components\results\ArticleRow.jsx`
2. `d:\Program Files (x86)\Final_Project\client\src\components\results\ResearcherResults.jsx`
3. `d:\Program Files (x86)\Final_Project\client\src\pages\ResultsPage.jsx`
4. `d:\Program Files (x86)\Final_Project\client\src\components\results\InformedResults.jsx`
5. `d:\Program Files (x86)\Final_Project\client\src\components\results\BeginnerResults.jsx`

---

### FIX 1 — `ArticleRow.jsx` to fidelity vs Persona3.dc.html `.p3-row` (ref lines 202-228)

Current `ArticleRow.jsx` signature is `function ArticleRow({ article })` and destructures
`{ title, year, journal, firstAuthor, abstract, url, matchedTags = [] }`. It has NO index
column, NO clickable-title toggle, and NO DOI row (it shows a "Read source →" link
instead). Bring it to the design-ref markup:

**1a. Accept an `index` prop.** Change signature to
`function ArticleRow({ article, index })`. Also destructure `doi` from `article`
(`const { title, year, journal, firstAuthor, abstract, doi, url, matchedTags = [] } = article`).

**1b. Index column (ref line 204).** As the FIRST child inside the existing
`<div style={{ display:'flex', gap:16 }}>` (currently the row only has one flex child —
the content `<div style={{ flex:1, minWidth:0 }}>`; insert the index span BEFORE it):
```
<span style={{
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: 12,
  color: '#b3c3c9',
  flexShrink: 0,
  paddingTop: 3,
  width: 22,
}}>{index}</span>
```
The `index` value is passed already zero-padded as a string by ResearcherResults (see
FIX 2). ArticleRow just renders it.

**1c. Clickable title button (ref line 206).** Replace the current `<p>` title with a
`<button type="button">` that toggles the existing `expanded` state
(`onClick={() => setExpanded(e => !e)}`). Style per ref:
display:'block', textAlign:'start', background:'transparent', border:'none', padding:0,
cursor:'pointer', fontFamily IBM Plex Sans, fontSize:16, fontWeight:600, color:'#1b2a31',
lineHeight:1.35, margin:'0 0 7px'. Keep `dir="auto"` on it (RTL titles). Keep className
"p3-tlink" if a hover rule exists in results-components.css; otherwise omit className
(do not invent new CSS).

**1d. Meta line (ref line 207-209).** Keep the existing `year · journal · authors` line.
Ref order is `year · journal · authors`; current code emits `year · firstAuthor · journal`.
Align to ref order: `<span color #2f6675>{year}</span> · {journal} · {firstAuthor}`
(keep the existing null-guards on journal/firstAuthor). Keep marginBottom ~9.

**1e. DOI row (ref lines 210-218).** REPLACE the current "Matched-tag pills + read link"
flex row with the ref DOI row. Single flex row (flexWrap:'wrap', alignItems:'center',
gap:8, marginBottom:2). Children in order:
   - `DOI` label span: mono 11px, color #90a2a9.
   - doi value span: mono 12px, color #42565d — **render this span AND the copy button
     ONLY when `doi` exists** (`{doi && (<>…</>)}`).
   - copy `<button type="button">`: mono 10px, color #5f747c, background transparent,
     border '1px solid #c6d6da', borderRadius 3, padding '2px 8px', cursor pointer.
     Label is `doiCopied ? 'copied ✓' : 'copy'`. onClick calls a handler that does
     `navigator.clipboard?.writeText(doi)` then `setDoiCopied(true)` and a
     `setTimeout(() => setDoiCopied(false), 1500)`. Use a NEW per-row state
     `const [doiCopied, setDoiCopied] = useState(false)`. Guard clipboard for absence
     (optional chaining) so it never throws in non-secure contexts. (Per-row state lives
     in ArticleRow, matching README §State Management "doiCopied{}" but realized as
     per-row component state — simpler and equivalent.)
   - spacer: `<span style={{ flex: 1 }} />` (pushes tags right, ref line 214).
   - matched-tag pills: keep the existing `matchedTags.map(...)` pills (mono 11px, bg
     #e7f0f3, border 1px solid #b9d6de, color #2f6675, radius 3, padding '2px 8px').
   Move the pills into THIS row (after the spacer). Remove the old "Read source →"
   anchor/span entirely (the design ref row has no read link — the title is the action).

**1f. Abstract + "+ abstract" affordance (ref lines 219-224).** Keep the existing
`expanded` abstract block (left-rule blockquote: borderLeft '2px solid #b9d6de',
paddingLeft 12/14, fontSize 14, color #3f5158). KEEP the existing `+ abstract` /
`− abstract` toggle button (ref shows the `+ abstract` affordance when collapsed; the
clickable title from 1c is the additional toggle — both toggle the SAME `expanded`
state, which the ref intends). Position the abstract block AFTER the DOI row and the
`+ abstract` button as the trailing element, matching ref order
(title → meta → DOI/tags row → abstract → +abstract).

**Preserve in ArticleRow:** the `useState(false)` expanded hook, the `dir="auto"` on the
abstract, the `className="p3-row"` on the `<article>`, the outer
`<article style={{ padding:'16px 20px', borderBottom:'1px solid #e7eef0' }}>` wrapper, the
1-line-clamp collapsed abstract preview (or drop the clamp to match ref which only shows
"+ abstract" when collapsed — reviewer's call; ref does NOT show a clamped preview, it
shows the bare "+ abstract" button, so PREFER removing the clamped-preview `<p>` and
showing only the `+ abstract` button when collapsed, abstract `<p>` only when expanded).

---

### FIX 2 — `ResearcherResults.jsx`: pass zero-padded index + DOI-bearing articles; add lang toggle + RTL

**2a. Pass index to ArticleRow (current line 575).** Currently:
`academicArticles.map((article, i) => (<ArticleRow key={i} article={article} />))`.
Change to pass a 1-based, 2-digit zero-padded number:
`academicArticles.map((article, i) => (<ArticleRow key={i} index={String(i + 1).padStart(2, '0')} article={article} />))`
(produces "01","02",…). ArticleRow renders the string verbatim (FIX 1b).

**2b. Language toggle + RTL (P3 ref line 40).** Mirror the BeginnerResults pattern:
   - Add `const [dir, setDir] = useState('ltr')` alongside the existing topic state
     (top of the component body, near line 109).
   - Add `dir={dir}` to the ROOT `<div>` (currently line 131, the outer wrapper with
     background #eef3f5). This is the wiring that makes the toggle real — NOT dead state.
   - In the NAV right-side cluster (currently lines 179-187, which holds only the
     "researcher mode" span), ADD a toggle button AFTER the "researcher mode" span:
     ```
     <button type="button" onClick={() => setDir(d => d === 'ltr' ? 'rtl' : 'ltr')}
       aria-label="Toggle language direction"
       style={{
         fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#2f6675',
         background: 'transparent', border: '1px solid #c6d6da', borderRadius: 4,
         padding: '5px 12px', cursor: 'pointer',
       }}>
       {dir === 'ltr' ? 'עברית' : 'English'}
     </button>
     ```
     Values taken exactly from Persona3.dc.html line 40 (mono 12px #2f6675, border
     1px solid #c6d6da, radius 4, padding 5px 12px).

**Preserve in ResearcherResults:** HEADLINE/PREF_LABEL maps, OwidChart component, the
extracted-profile grid (OUT OF SCOPE — do not re-layout), adjust-topics panel, the OWID
3-chart section, the article-section header (`Articles · N matched`), the skeleton
placeholders, the `/articles` CTA, the also-explore links (already use `/graphs/israel`).

---

### FIX 3 — `ResultsPage.jsx`: add `doi` to every MOCK_ARTICLES object

The 5 MOCK_ARTICLES objects (lines 39-85) currently have NO `doi` field, so the new DOI
row (FIX 1e) would render nothing for the researcher mock. Add a realistic `doi` string
to each object. Suggested values (real-looking, match the titles where known from
Persona3.dc.html data):
   - "Post-traumatic stress and prolonged grief in bereaved parents" → `10.1002/jts.22845`
   - "Prevalence of PTSD … armed conflict: a systematic review" → `10.1016/S2215-0366(24)00112-9`
   - "Trajectories of post-traumatic stress following mass-casualty events" → `10.1001/jamapsychiatry.2023.0455`
   - "Civilian PTSD in protracted conflict zones …" → `10.1002/wps.21188`
   - "Intergenerational transmission of trauma …" → `10.1017/S0954579422000451`
Add the key without disturbing existing keys/order materially (append `doi` after
`matchedTags` or after `journal` — either is fine). Do NOT change MOCK_PROFILE,
MOCK_STORIES, the persona-switch logic, the data-fetch effects, or any other part of
ResultsPage.jsx.

---

### FIX 4 — `InformedResults.jsx`: add lang toggle + RTL (P2 ref line 53)

Mirror the BeginnerResults / P2 design ref pattern. (Note: C-2's review previously removed
a "dead dir state" from this file; THIS time the dir state is USED — wired to the toggle
AND the root — so it is legitimate, not dead.)
   - Add `const [dir, setDir] = useState('ltr')` near the existing topic state (line 73).
   - Add `dir={dir}` to the ROOT `<div>` (currently line 95, outer wrapper bg #f4f5f3).
   - In the teal NAV right cluster (currently lines 117-119, which holds only the
     "Results" span), ADD a white pill toggle button AFTER the "Results" span, styled
     exactly per Persona2.dc.html line 53:
     ```
     <button type="button" onClick={() => setDir(d => d === 'ltr' ? 'rtl' : 'ltr')}
       aria-label="Toggle language direction"
       style={{
         fontFamily: 'inherit', fontSize: 13, fontWeight: 600, color: '#fff',
         background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)',
         borderRadius: 6, padding: '6px 14px', cursor: 'pointer',
       }}>
       {dir === 'ltr' ? 'עברית' : 'English'}
     </button>
     ```

**Preserve in InformedResults:** HEADLINE/PREF_LABEL maps, OwidChart, hero band,
two-column feed + card-count logic (showSecondStory etc.), OWID two-chart section, CTA,
also-explore grid (already uses `/graphs/israel`). The existing `dir="auto"` handling in
child cards stays.

---

### FIX 5 — `BeginnerResults.jsx`: fix the "Data Graphs" dead link

CONFIRMED: line 251 currently `<a href="/data" …>` — `/data` is not a real route, while
P2 (line 554) and P3 (line 649) already use `/graphs/israel`. Change line 251 ONLY:
`href="/data"` → `href="/graphs/israel"`. Touch nothing else in this file (its lang
toggle + dir wiring already exist and are correct — lines 60, 85, 92-99).

---

**OUT OF SCOPE (do NOT touch):**
- OpenAlex boolean-query `<pre>`+copy block (descoped — Revamp.md DESCOPED notes; user declined).
- 2nd Guardian mock story / P1 second Guardian card.
- Researcher extracted-profile grid field re-layout.
- results-components.css — no CSS edits expected (all FIX styling is inline matching the
  refs); only reuse existing classNames (p3-row, p3-tlink, p3-link, p2-link) where they
  already exist. If a needed hover class is absent, omit the className rather than adding CSS.
- Any server / test / auth file.

**Invariants:** 5 files max (exactly 5 here). No new files. No CSS/server/test/auth edits.
Lint must stay at the pre-existing baseline (24). Green-family (P1/P2) and blue-family (P3)
palettes must not mix.

**Verification (post-coding, no edits):**
- Researcher article rows show "01"…"0N" index, clickable title toggles abstract, a DOI
  row with working copy button (label flips to "copied ✓" ~1.5s then reverts), tags
  right-aligned via the flex:1 spacer.
- P2 and P3 each show a working lang toggle: clicking flips the root `dir` between
  ltr/rtl and the layout mirrors; button label flips עברית ⇄ English.
- `grep -rn 'href="/data"' client/src` returns NOTHING (no `/data` dead links remain).
- All five MOCK_ARTICLES render a DOI value in the researcher view.

**REVIEWER NOTE:** Verify against **Revamp.md PART 7** (researcher section) AND
`client/design-refs/` (Persona3.dc.html lines 40, 202-228; Persona2.dc.html line 53), NOT
only this plan. Specifically confirm: (a) the new dir/lang toggles ACTUALLY work — state
is wired to BOTH the toggle button and the root `dir` attribute on P2 and P3 (the C-2
"dead dir state" mistake must not recur); (b) NO `/data` dead links remain anywhere in
client/src; (c) blue-family P3 / green-family P1-P2 palettes did not bleed across; (d)
exactly 5 files changed, no CSS/server/test files touched, lint unchanged.

Status: DONE — awaiting review

**Implementation notes (2026-06-27):**
- 5 files changed exactly as planned (ArticleRow, ResearcherResults, ResultsPage,
  InformedResults, BeginnerResults). No new files. No CSS/server/test/auth edits.
- ArticleRow: `url` was DROPPED from the destructure (not kept as planned) because the
  "Read source" link was removed (FIX 1e) leaving `url` unused, which added a
  `no-unused-vars` error pushing lint to 25. Dropping it keeps lint at baseline 24 and
  honors FIX 1e's intent (the url/read-link is gone). `doi` added; `index` rendered.
- ArticleRow title button: className `p3-tlink` OMITTED (no such CSS rule exists in
  results-components.css — only `p3-link`), per the plan's "omit className if absent; do
  not invent CSS" instruction.
- Lint: stayed at pre-existing baseline of **24** problems (verified before+after).
- DOI values applied per plan's title→DOI mapping.

**BLOCKER (pre-existing, OUT OF SCOPE — flagged, NOT fixed):** `npm run build` fails with
a syntax error at `BeginnerResults.jsx:17` — three string literals (lines 17-19) contain
unescaped apostrophes: `'You're in a safe place'`, `'We'll go gently...'`,
`'You don't have to...'`. Confirmed present at HEAD (commit 2dfd651) BEFORE this step —
unrelated to C-3a. The C-3a plan says "Touch nothing else in this file" for
BeginnerResults, so these were left untouched. eslint counts this as 1 of the 24 baseline
problems (parse error). The three C-3a-authored files (ArticleRow, ResearcherResults,
InformedResults) lint+parse cleanly with zero new problems. Recommend a separate fix to
escape those apostrophes to unblock the production build.

---

## Upcoming Steps

- **C-4**: Wire all three personas to real data — Guardian fetch, articles fetch, session profile
- **B-3**: `server/routes/ai_assistant_route.py` — emotional guidance + rebuild system prompt
- **B-4**: `server/routes/articles_route.py` — persona_boost + matched_tags + abstract projection fix
- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
- **(proposed) B-2a**: resync `server/tests/test_chat_parsing.py` expected dicts to the 7-key persona schema (separate from B-2 to respect the no-test-edit invariant)
