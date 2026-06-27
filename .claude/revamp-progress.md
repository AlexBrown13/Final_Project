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

---

## Current Step — DONE — awaiting review

**Step C-3: Build Persona 3 (Researcher) Results Page**

Status: DONE — awaiting review
Files created: ResearcherResults.jsx, ArticleRow.jsx
Files modified: results-components.css (P3 block appended), ResultsPage.jsx (import + stub removed), index.html (IBM Plex fonts added)
Lint: 24 problems (unchanged baseline — zero new problems in C-3 files)
Note: `npm run build` fails on a PRE-EXISTING syntax error in C-1's BeginnerResults.jsx (unescaped apostrophes, lines 17-19) — NOT touched in this step and outside C-3 scope.

### Context
Design reference: `client/design-refs/Persona3.dc.html`
Dense, tool-like layout. Max-width 1080px. Blue color family only — no green. IBM Plex Mono + IBM Plex Sans throughout. No Guardian content anywhere.

### Files to create/modify (5 files)

**1. `client/src/components/results/ResearcherResults.jsx`** (NEW)

Full Persona 3 layout per `client/design-refs/Persona3.dc.html`. Sections top to bottom:

**Sticky nav** — `position:sticky; top:0; background:rgba(238,243,245,.92); backdrop-filter:blur(8px); border-bottom:1px solid #dce5e8; z-index:20; padding:13px 32px`.
Left: 18×18 box (`border:2px solid #2f6675; border-radius:3px`) + `trauma_education` (IBM Plex Mono 14px/500) + `/ results` (mono 11px `#90a2a9`).
Right: "researcher mode" (mono 11px `#90a2a9`) + lang toggle button (`border:1px solid #c6d6da; border-radius:4px; padding:5px 12px`). Shows `עברית` when ltr, `EN` when rtl.

**Extracted profile card** — `border:1px solid #d7e1e4; border-radius:8px; background:#fff; margin-bottom:26px`.
- Header row: "Extracted profile" (mono 11px uppercase letter-spacing .14em `#2f6675`) + "edit tags" button (`p3-copy`, mono 11px).
- 2×2 grid (`grid-template-columns:1fr 1fr`) with internal 1px `#e7eef0` borders: **persona** / **primary topic** / **content preference** / **interest tags**. Each cell: mono 10px uppercase label `#90a2a9` + value 15px/600. Interest tags cell renders `profile.interestTags` as mono pills (`background:#e7f0f3; border:1px solid #b9d6de; color:#2f6675; border-radius:4px; padding:3px 9px; font-size:12px`). **emotionalState intentionally absent** (privacy rule).
- OpenAlex query section (`padding:16px 20px`): "OpenAlex boolean query" label (mono 10px uppercase `#90a2a9`) + "copy" button (`p3-copy`, mono 11px) → flips to "copied ✓" for 1500ms via `queryCopied` state. `<pre>` block: `background:#f3f7f8; border:1px solid #dce5e8; border-radius:6px; padding:13px 15px; font-size:12.5px; line-height:1.7; white-space:pre-wrap; word-break:break-word`. Renders `profile.openAlexQuery`.
- **Edit tags panel** (collapsible below query, inside card): shown when `topicsOpen`. `background:#f7fafb; border-top:1px solid #e7eef0; padding:16px 20px`. Header: "edit interest tags" mono + `{n}/5` count right. Removable pills (class `p3-x` on ×). Add input + "add" button (`background:#2f6675; color:#fff; border-radius:5px`). At max 5: hide input, show "max 5 tags" mono 11px `#90a2a9`. `[ close ]` button at bottom (mono 11px `#90a2a9`). Topics seeded from `profile.interestTags`.

**OWID section** — `border:1px solid #d7e1e4; border-radius:8px; background:#fff; margin-bottom:26px; overflow:hidden`.
Header: "Epidemiology · OWID" (mono 11px uppercase `#2f6675`) + "3 series · GBD / IHME" (mono 11px `#90a2a9`).
Inner grid: `display:grid; grid-template-columns:1fr 1fr; gap:1px; background:#e7eef0`.
- **Chart A** (`depressive-disorders-prevalence-ihme`, `min-height:380px`): title "Depressive disorders — prevalence" (IBM Plex Sans 13px/600) / subtitle "share of population, by country" (mono 11px `#90a2a9`). Skeleton shimmer (`p3-skel`, `position:absolute; inset:0`). Fallback: `[ series unavailable ]` (mono 12px `#5f747c`). Footer: "ourworldindata.org · IHME GBD 2021" (mono 10.5px `#90a2a9`).
- **Chart B** (`anxiety-disorders-prevalence`, `min-height:380px`): same structure, title "Anxiety disorders — prevalence".
- **Chart C** (`share-with-mental-and-substance-disorders`, `grid-column:1/-1`, `min-height:460px`): title "Disease burden from mental & substance-use disorders" / subtitle "share of total DALYs, global — long-run series". Fallback includes: "[ series unavailable ] — this grapher could not be reached. Other series and article results are unaffected."
Each chart tracks its own `owidA`/`owidB`/`owidC` state (`'loading'|'ready'|'failed'`). Iframe kept at `opacity:0; position:absolute; inset:0` until `onLoad` flips to ready.

**Article results section** — `border:1px solid #d7e1e4; border-radius:8px; background:#fff; overflow:hidden`.
Header: "Articles · {n} matched" (mono 11px uppercase `#2f6675`) + "sorted: relevance ↓" (mono 11px `#90a2a9`).
Renders `<ArticleRow>` for each article. `expanded{}` dict keyed by index. `doiCopied{}` dict keyed by index.
Footer link: "→ open full result set (47 articles)" (mono 13px `color:#2f6675`, class `p3-tlink`).

**Also explore** — `margin-top:24px; display:flex; flex-wrap:wrap; gap:6px 22px; align-items:center`.
`also:` label (mono 11px uppercase `#90a2a9`) + `interactive_map` / `trends` / `data_graphs` links (mono 13px `color:#42565d`, class `p3-tlink`).

Component props:
```js
{ profile, academicArticles = [] }
```

State: `dir`, `topicsOpen`, `topics[]`, `addVal`, `owidA`, `owidB`, `owidC`, `queryCopied`, `expanded{}`, `doiCopied{}`.

**2. `client/src/components/results/ArticleRow.jsx`** (NEW)

Props: `{ num, title, year, journal, authors, doi, matchedTags, abstract, expanded, doiCopied, onToggle, onCopyDoi }`.

- Outer: `<article className="p3-row">` with `padding:16px 20px; border-bottom:1px solid #e7eef0`.
- Row: flex with `gap:16px`. Left: zero-padded index (mono 12px `#b3c3c9`, `flex-shrink:0`, `width:22px`).
- Title: `<button>` block, IBM Plex Sans 16px/600, `color:#1b2a31`, `text-align:start`, `cursor:pointer`, class `p3-tlink`. Clicking calls `onToggle`.
- Meta line: `year · journal · authors` (mono 12px `#5f747c`). Year in `color:#2f6675`.
- DOI row: "DOI" label (mono 11px `#90a2a9`) + doi value (mono 12px `#42565d`) + copy button (class `p3-copy`, `border-radius:3px`, mono 10px) → label flips to "copied ✓" for 1500ms. Right: matched-tag pills (mono 11px, `background:#e7f0f3; border:1px solid #b9d6de; color:#2f6675; border-radius:3px; padding:2px 8px`).
- When collapsed: "+ abstract" button (class `p3-copy`, mono 11px `#90a2a9`).
- When expanded: `<p>` abstract (`font-size:14px; line-height:1.6; color:#3f5158; border-left:2px solid #b9d6de; padding-left:14px; margin:12px 0 4px`).

**3. `client/src/components/results/results-components.css`** (MODIFY — append P3 block at end)

```css
/* ── Persona 3 — Researcher ──────────────────────────────── */
@keyframes p3shimmer { 0%{background-position:-360px 0} 100%{background-position:360px 0} }
.p3-skel { background:linear-gradient(90deg,#e4ecee 0%,#f0f5f6 50%,#e4ecee 100%); background-size:720px 100%; animation:p3shimmer 1.6s infinite linear; }
.p3-row { transition:background .12s ease; }
.p3-row:hover { background:#f0f6f7; }
.p3-row:nth-of-type(even) { background:#f5f8f9; }
.p3-row:nth-of-type(even):hover { background:#eef5f6; }
.p3-copy { transition:color .12s ease,border-color .12s ease; }
.p3-copy:hover { color:#2f6675; border-color:#9ec4d0; }
.p3-tlink:hover { color:#1d4c59; }
.p3-x:hover { color:#2f6675; }
@media (prefers-reduced-motion:reduce) {
  .p3-skel { animation:none; background:#e4ecee; }
}
```

**4. `client/src/pages/ResultsPage.jsx`** (MODIFY)

Import `ResearcherResults` and replace the `null`/placeholder stub in the persona switch with `<ResearcherResults profile={profile} academicArticles={academicArticles} />`.

**5. `client/index.html`** (MODIFY)

Add IBM Plex Mono + IBM Plex Sans Google Fonts. Check existing preconnects — do not duplicate. Add after the existing P2 font link:
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Mock data for development (use in ResearcherResults when `academicArticles` is empty)
```js
const MOCK_PROFILE = {
  persona: 'researcher',
  primaryTopic: 'PTSD prevalence in conflict zones',
  contentPreference: 'research',
  interestTags: ['PTSD', 'prevalence', 'October 7', 'civilians', 'epidemiology'],
  openAlexQuery: '(PTSD OR "post-traumatic stress") AND ("armed conflict" OR "war exposure" OR civilian) AND (prevalence OR epidemiology)',
};
const MOCK_ARTICLES = [
  { title: 'Prevalence of PTSD in populations exposed to armed conflict: a systematic review and meta-analysis', year: 2024, journal: 'Lancet Psychiatry', authors: 'Charlson F, van Ommeren M, et al.', doi: '10.1016/S2215-0366(24)00112-9', matchedTags: ['PTSD', 'prevalence'], abstract: 'Pooled estimates across 129 studies (N = 1.7M) place the prevalence of PTSD among conflict-exposed populations at 22.3% (95% CI 18.1–27.0), with substantial heterogeneity attributable to exposure intensity and time since event.', url: '#' },
  { title: 'Trajectories of post-traumatic stress following mass-casualty events', year: 2023, journal: 'JAMA Psychiatry', authors: 'Galatzer-Levy I, Bonanno G.', doi: '10.1001/jamapsychiatry.2023.0455', matchedTags: ['PTSD'], abstract: 'Latent growth-mixture modeling identifies four stable response trajectories — resilient, recovering, chronic, and delayed-onset — with resilience the modal outcome even at high exposure levels.', url: '#' },
  { title: 'Civilian PTSD in protracted conflict zones: a systematic review of risk and protective factors', year: 2025, journal: 'World Psychiatry', authors: 'Hoppen T, Morina N.', doi: '10.1002/wps.21188', matchedTags: ['PTSD', 'civilians'], abstract: 'Ongoing threat, displacement, and loss of social capital emerge as the strongest predictors of chronic course; perceived social support and collective efficacy are the most consistent protective factors.', url: '#' },
  { title: 'Estimating the population mental-health burden of the October 2023 events in Israel', year: 2024, journal: 'Israel Journal of Psychiatry', authors: 'Levav I, Bleich A.', doi: '10.1234/ijp.2024.0917', matchedTags: ['October 7', 'prevalence'], abstract: 'Early modeling projects a marked increase in incident PTSD and prolonged-grief disorder, concentrated in directly exposed communities and first-responder cohorts, with implications for service capacity planning.', url: '#' },
  { title: 'Sleep disturbance and nightmares as predictors of chronic PTSD in displaced civilians', year: 2023, journal: 'Sleep Medicine Reviews', authors: 'Ben-Zur H, Gilboa-Schechtman E.', doi: '10.1016/j.smrv.2023.101802', matchedTags: ['PTSD', 'civilians'], abstract: 'Polysomnographic and self-report data converge on disrupted REM continuity as an early marker of chronic course, suggesting sleep-targeted intervention windows in the first months after displacement.', url: '#' },
  { title: 'Intergenerational transmission of trauma in families of conflict survivors', year: 2022, journal: 'Development and Psychopathology', authors: 'Dekel R, Solomon Z.', doi: '10.1017/S0954579422000451', matchedTags: ['epidemiology'], abstract: 'A three-generation cohort finds attenuated but measurable transmission of post-traumatic symptomatology, mediated more strongly by parental emotional availability than by direct disclosure of events.', url: '#' },
  { title: 'Neuroimaging correlates of PTSD symptom severity: a coordinate-based meta-analysis', year: 2024, journal: 'Biological Psychiatry', authors: 'Admon R, Hendler T.', doi: '10.1016/j.biopsych.2024.02.011', matchedTags: ['PTSD'], abstract: 'Hyperactivation of the amygdala alongside hypoactivation of the ventromedial prefrontal cortex scales with symptom severity across 64 studies, supporting a dysregulated threat-appraisal model.', url: '#' },
  { title: 'Cost-effectiveness of scaled-up trauma interventions in conflict-affected health systems', year: 2023, journal: 'Health Policy and Planning', authors: 'Chisholm D, et al.', doi: '10.1093/heapol/czad055', matchedTags: ['prevalence', 'epidemiology'], abstract: 'Task-shifted, group-delivered interventions achieve acceptable cost-per-DALY-averted thresholds even under constrained budgets, strengthening the economic case for population-level scale-up.', url: '#' },
  { title: 'Resilience and post-traumatic growth among first responders after mass-casualty deployment', year: 2024, journal: 'Journal of Anxiety Disorders', authors: 'Palgi Y, Shrira A.', doi: '10.1016/j.janxdis.2024.102788', matchedTags: ['civilians'], abstract: 'Longitudinal tracking of emergency personnel identifies peer cohesion and perceived organizational support as the strongest modifiable predictors of post-traumatic growth at twelve months.', url: '#' },
];
```

### Design tokens (Persona 3)
- Background: `#eef3f5` | Text: `#1b2a31` | Muted: `#5f747c` | Faint: `#90a2a9`
- Surface: `#fff` | Panel tints: `#f3f7f8`, `#f7fafb` | Striped rows: `#f5f8f9`
- Accent: `#2f6675` | Link hover: `#1d4c59` | Tag value: `#42565d`
- Tag bg: `#e7f0f3` | Tag border: `#b9d6de` | Tag text: `#2f6675`
- Borders: `#d7e1e4`, `#e7eef0`, `#c6d6da`
- Radii: 8px panels, 3–4px tags/buttons
- Fonts: IBM Plex Mono (metadata/labels/code, 400/500/600) + IBM Plex Sans (titles/body, 400/500/600/700). Base 15px/1.5.

### What NOT to do
- Do not render `emotionalState` anywhere (privacy rule for researcher)
- Do not use any green-family colors (`#7da984`, `#3f5a45`, etc.) — blue family only
- Do not include Guardian stories or `GuardianCard` — researcher never sees them
- Do not use Tailwind or any component library
- Do not use CSS modules — all CSS goes in `results-components.css`
- Do not wire up real API calls — use mock data

---

## Upcoming Steps

- **C-4**: Wire all three personas to real data — Guardian fetch, articles fetch, session profile
- **B-1**: `server/utils/chat_prompts.py` — new extraction schema (emotional_state, content_preference)
- **B-2**: `server/routes/chat_route.py` — parse new fields, fallback emotional_state → "neutral"
- **B-3**: `server/routes/ai_assistant_route.py` — emotional guidance + rebuild system prompt
- **B-4**: `server/routes/articles_route.py` — persona_boost + matched_tags + abstract projection fix
- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
