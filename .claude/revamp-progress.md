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

## Current Step — awaiting implementer

**Step C-3: Build Persona 3 (Researcher) Results Page**

### Context
Full rewrite of the results page. No existing code to preserve — delete or ignore old results components.
Design reference: `client/design-refs/Persona1.dc.html` and `client/design-refs/README.md`

### Files to create/rewrite (5 files)

**1. `client/src/pages/ResultsPage.jsx`**
Top-level shell. Reads `persona_profile` from the existing session context (same way the current ResultsPage reads it). Switches on `profile.persona` to render the right layout. For now only Beginner is implemented — `InformedResults` and `ResearcherResults` are stubs (render `null` or a placeholder). Passes `profile`, `guardianStories`, and `academicArticles` as props down to the persona component. Use mock data for now — real fetch wiring comes in C-4 after backend is built.

**2. `client/src/components/results/BeginnerResults.jsx`**
Full Persona 1 layout per `client/design-refs/Persona1.dc.html`. Single column, max-width 860px, centered. Sections top to bottom:
- Sticky navbar: sage dot + "trauma education" (Newsreader 20px) left; pill lang toggle right. Background `rgba(250,248,244,.88)` + `backdrop-filter:blur(8px)`.
- Hero: eyebrow badge (dot + uppercase label) → H1 (Newsreader 46px) → subcopy (19px, muted) → interest tag pills + "adjust your topics" underlined button. All staggered `p1-rise` animation.
- Support card (ERAN 1201): rendered ONLY when `emotionalState === 'grieving' || emotionalState === 'distressed'`. Soft sage card (`#eef3ee` bg, `#d8e3d9` border, `#7da984` left accent bar, 16px radius). Copy: "If today feels heavy, you don't have to sit with it alone." + "ERAN's emotional first-aid line is open any hour. Call **1201**." NOT a red banner.
- Inline Adjust Topics panel: collapsible, opens below hero. Tag pills with × remove, add-input + Add button, max 5. On hitting max show text, hide input.
- `<hr>` divider.
- Guardian stories section: heading "Stories from people who understand" + subtitle. 2 `<GuardianCard>` components (horizontal layout).
- OWID chart section: `#e1ebe2` rounded container (`border-radius:20px`), heading "You are not alone in this", subtitle, then `<OwidFrame>` with URL `https://ourworldindata.org/grapher/anxiety-disorders-prevalence`.
- Academic previews section: heading "Reading, made approachable" + subtitle. 2–3 `<AcademicCard>` components.
- CTA block: full `#7da984` background, `border-radius:22px`, white text, white pill button "See your full reading list" → links to articles page.
- Also explore: 3 quiet list rows (Interactive Map / Trends / Data Graphs) with hover underline, border-bottom dividers.

Component accepts props:
```js
{ profile, guardianStories = [], academicArticles = [] }
```

Mood-aware copy (used when `profile.headline` is absent):
- `grieving`: eyebrow "A gentle place to understand", H1 "Understanding what your loved one carried — at your own pace.", subcopy gentle/acknowledging
- `curious`: eyebrow "A place to explore, at your pace", H1 "Making sense of this — one story at a time.", subcopy inviting
- `distressed`: eyebrow "You're in a safe place", H1 "Take a breath. We'll go gently, together.", subcopy reassuring, no rush

Lang toggle: `dir` state, `ltr` ↔ `rtl`. Shows `עברית` when ltr, `English` when rtl.

**3. `client/src/components/results/GuardianCard.jsx`**
Horizontal layout: 230px image column left, text column right. `border-radius:18px`, `border:1px solid #ece4d6`, white bg.
- Image: `<img src={thumbnailUrl} style={{objectFit:'cover',width:'100%',height:'100%'}}`. On `onError` → hide img, show diagonal stripe `repeating-linear-gradient(135deg,#e6ddcf 0 10px,#efe8db 10px 20px)`.
- Source row: 16×16px `#052962` square + "The Guardian" (13px, `#052962`, bold) + date (13px, muted).
- Headline: `dir="auto"`, Newsreader 22px/1.4, `font-weight:500`.
- Summary: `dir="auto"`, 15px, muted `#6b6457`, 1.6 line-height.
- "Read at The Guardian →" link, `color:#3f5a45`, 14px bold.

Props: `{ thumbnailUrl, headline, summary, date, url }`

**4. `client/src/components/results/AcademicCard.jsx`**
Warm P1 card. `background:#f3efe6`, `border:1px solid #e6ddcf`, `border-left:4px solid #7da984`, `border-radius:0 14px 14px 0`, padding 22px 26px.
- Kicker: "Research · peer-reviewed" in monospace, `#7da984`, uppercase, 11px.
- Title: Newsreader 21px/1.32, `font-weight:500`.
- Meta: `firstAuthor · journal · year`, 13.5px, `#8a826f`.
- Abstract: 15px, `#6b6457`, 1.55 line-height, 2 lines visible.
- Matched tags row (only if `matchedTags.length > 0`): "matched :" label in muted + outlined pills (`border:1px solid #b9cdbc`, `color:#3f5a45`, `border-radius:999px`, padding `3px 11px`, 12px).
- "Read this, gently →" link: `color:#3f5a45`, 14px bold, right-aligned.

Props: `{ title, year, journal, firstAuthor, abstract, url, matchedTags }`

**5. `client/src/components/results/results-components.css`**
All CSS for the above. Key rules:
```css
@keyframes p1shimmer { 0%{background-position:-360px 0} 100%{background-position:360px 0} }
@keyframes p1fade { from{opacity:0} to{opacity:1} }
@keyframes p1rise { from{opacity:0;transform:translateY(var(--rise,22px))} to{opacity:1;transform:none} }

.p1-root { --dur:.85s; --st:.2s; --rise:22px; --rbase:.95s; --rstep:.14s; }
.p1-root[data-mood="curious"] { --dur:.6s; --st:.12s; --rise:14px; --rbase:.6s; --rstep:.1s; }
.p1-root[data-mood="distressed"] { --dur:.4s; --st:.06s; --rise:0px; --rbase:.32s; --rstep:.05s; }
.p1-root[data-mood="distressed"] .p1-skel { animation:none; background:#ece6da; }

.p1-skel { background:linear-gradient(90deg,#ece6da 0%,#f5f1e8 50%,#ece6da 100%); background-size:720px 100%; animation:p1shimmer 1.6s infinite linear; }
.p1-card { transition:box-shadow .2s ease,transform .2s ease; }
.p1-card:hover { box-shadow:0 14px 38px -22px rgba(60,50,35,.45); transform:translateY(-2px); }
.p1-link { transition:color .15s ease; }

@media (prefers-reduced-motion: reduce) {
  .p1-root * { animation:none !important; transition:none !important; opacity:1 !important; transform:none !important; }
}
```

Hero children animate via `.p1-hero > *` with nth-child delays using `--st`. Reveal sections (sections below hero) animate with `--rbase` + `--rstep` offsets. See `Persona1.dc.html` for exact pattern.

### Design tokens (Persona 1)
- Background: `#faf8f4` | Text: `#2c2823` | Muted: `#564f45`, `#6b6457` | Faint: `#9aa090`
- Sage: `#7da984` | Deep green text: `#3f5a45`
- Warm surface: `#f3efe6` | Pale green: `#e1ebe2`, `#eef3ee` | Borders: `#ece4d6`, `#e6ddcf`
- Guardian blue: `#052962`
- Fonts: Newsreader (serif, 500) for headlines; Source Sans 3 body. Load both in `client/index.html`.

### OwidFrame helper (inline in BeginnerResults or separate tiny component)
```jsx
function OwidFrame({ src, height = 480 }) {
  const [state, setState] = useState('loading'); // 'loading' | 'ready' | 'failed'
  return (
    <div style={{ position:'relative', minHeight:height, background:'#fff', borderRadius:14, overflow:'hidden', border:'1px solid #d3e0d5' }}>
      {state === 'loading' && <SkeletonShimmer />}
      {state === 'failed' && <p style={{textAlign:'center',color:'#5d6b58',padding:40}}>Data visualization temporarily unavailable.</p>}
      <iframe
        src={src}
        loading="lazy"
        onLoad={() => setState('ready')}
        onError={() => setState('failed')}
        style={{ width:'100%', height, border:'none', display:'block', ...(state === 'ready' ? {} : { opacity:0, position:'absolute', inset:0 }) }}
      />
    </div>
  );
}
```

### Mock data for development
```js
const MOCK_PROFILE = {
  persona: 'beginner',
  emotionalState: 'grieving',
  contentPreference: 'stories',
  interestTags: ['October 7', 'grief', 'PTSD', 'soldiers', 'memory'],
  primaryTopic: 'grief',
  headline: null,
};
const MOCK_STORIES = [
  { thumbnailUrl: null, headline: 'The families of fallen soldiers who are learning to grieve together', summary: 'Around shared tables and quiet rooms, bereaved parents are finding that the weight feels a little more bearable when it is carried alongside others.', date: '2 Mar 2025', url: '#' },
];
const MOCK_ARTICLES = [
  { title: 'Post-traumatic stress and prolonged grief in bereaved parents', year: 2023, journal: 'Journal of Traumatic Stress', firstAuthor: 'R. Cohen', abstract: 'Parents who lose a child to sudden violence often experience grief and trauma at the same time. This review describes what that looks like and what tends to help.', url: '#', matchedTags: ['grief', 'PTSD'] },
];
```

### What NOT to do
- Do not wire up real API calls (backend not built yet — use mock data)
- Do not import or reference old BeginnerHero.jsx, BeginnerPersonaCard.jsx, etc.
- Do not use Tailwind or any component library
- Do not use CSS modules — all CSS goes in `results-components.css`
- Do not preserve any existing logic from the current ResultsPage.jsx

---

## Upcoming Steps

- **C-2**: Persona 2 (Informed Learner) — `InformedResults.jsx`, `GuardianCardVertical.jsx`, `AcademicCardTeal.jsx`, P2 CSS
- **C-3**: Persona 3 (Researcher) — `ResearcherResults.jsx`, `ArticleRow.jsx`, P3 CSS
- **C-4**: Wire all three personas to real data — Guardian fetch, articles fetch, session profile
- **B-1**: `server/utils/chat_prompts.py` — new extraction schema (emotional_state, content_preference)
- **B-2**: `server/routes/chat_route.py` — parse new fields, fallback emotional_state → "neutral"
- **B-3**: `server/routes/ai_assistant_route.py` — emotional guidance + rebuild system prompt
- **B-4**: `server/routes/articles_route.py` — persona_boost + matched_tags + abstract projection fix
- **B-5**: `server/routes/external_content_route.py` (NEW) — Guardian API + MongoDB cache
