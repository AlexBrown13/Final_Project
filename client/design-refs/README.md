# Handoff: Personalized Trauma-Education Results Page

## Overview
After a user completes a 5-question conversational quiz, an AI extracts a **profile** and routes them to a **Results Page** — their main destination, where they spend meaningful time. The same platform must render as **three radically different products** depending on the extracted persona:

- **Persona 1 — Beginner**: personally affected, possibly grieving. Warm, human, story-led.
- **Persona 2 — Informed Learner**: social worker / journalist / student. Balanced stories + research.
- **Persona 3 — Researcher**: academic / clinician. Dense, tool-like, research-only.

The platform is **bilingual Hebrew/English** and must support **RTL**. Desktop only. The topic is trauma, grief and mental health — nothing may feel gamified, cheap, or dismissive. **Trust and credibility outrank beauty.**

---

## About the Design Files
The files in this bundle (`Persona1.dc.html`, `Persona2.dc.html`, `Persona3.dc.html`, `Overview.dc.html`) are **design references created in HTML** — prototypes showing intended look and behavior. They are **not production code to copy directly**. They use a small internal templating runtime (`support.js`, the `<x-dc>`/`{{ }}`/`<sc-if>`/`<sc-for>` syntax) purely to prototype state — **ignore that runtime**.

Your task: **recreate these three designs as React components using custom CSS** (the target stack — no Tailwind, no component library, per the product spec). If you are dropping this into an existing codebase, use its established patterns; the inline styles in the prototypes are a spec of values, not a structure to copy literally.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions are all specified below and present in the HTML. Recreate the UI faithfully using exact values.

---

## The Data Contract (drives everything)

A single `profile` object selects and configures the page. Implement one `<ResultsPage profile={…} />` that switches on `profile.persona`.

```ts
type Persona = "beginner" | "informed" | "researcher";
type ContentPreference = "stories" | "mixed" | "research";
type EmotionalState = "grieving" | "curious" | "distressed" | "professional";

interface Profile {
  persona: Persona;
  primaryTopic: string;          // e.g. "PTSD", "October 7", "grief"
  interestTags: string[];        // max 5, user-editable on page
  contentPreference: ContentPreference;
  emotionalState?: EmotionalState; // present for beginner/informed; see privacy rule
  headline?: string;             // AI-generated; if absent, fall back to per-state copy below
  openAlexQuery?: string;        // researcher only
}
```

### Privacy rule (must implement)
If a **researcher** arrives for personal/emotional reasons, `emotionalState` is **never rendered** on their page. The profile card hides that field entirely. (Beginner & Informed may use it.)

### Content data the page consumes
- **Guardian stories**: `{ thumbnailUrl, headline, summary, source:"The Guardian", date, url }`. **Headline & summary may be English OR AI-translated Hebrew** — containers must handle both. Use `dir="auto"` on the headline and summary elements so RTL strings right-align correctly inside an otherwise-LTR card.
- **Academic articles**: `{ title, year, journal, firstAuthor /*or authors*/, abstract, doi, url, matchedTags[] }`. `matchedTags` = which of the user's `interestTags` were found in the article.
- **OWID charts**: embedded `<iframe>` from `ourworldindata.org/grapher/<slug>`. Must show a **skeleton while loading** and a **graceful text fallback on error** (never a broken frame).

### How `contentPreference` shifts the mix
| persona | stories | mixed | research |
|---|---|---|---|
| beginner | 2 Guardian + 1 OWID + 2–3 academic (always story-leaning) | — | — |
| informed | 2 Guardian + 1 academic | 2 Guardian + 2 academic | 1 Guardian + 3 academic |
| researcher | (no Guardian, ever) | — | OWID ×3 + dense article list |

### Fallback states (all personas)
Any block whose data fails to load must **disappear or show a minimal message** — no empty white boxes. Guardian empty → omit the section. OWID error → text fallback shown below. Each OWID chart tracks its own `loading | ready | failed` state independently so one failure doesn't blank the others.

---

## Design Tokens

### Shared
- Sage accent (P1/P2): `#7da984`
- Guardian brand blue (source label/icon): `#052962`
- Lang toggle copy: shows `עברית` when in English, `English` when in Hebrew. Toggling sets `dir` on the page root (`ltr` ⇄ `rtl`).

### Persona 1 — Beginner (warm, light)
- Background `#faf8f4`; text `#2c2823`; muted text `#564f45` / `#6b6457`; faint `#9aa090`
- Pale-green tint surfaces `#e1ebe2`, `#eef3ee`; warm card `#f3efe6`; borders `#ece4d6` / `#e6ddcf`
- Accent `#7da984`; deep green text `#3f5a45`
- Radii: cards 18px, pills 999px, panels 16px
- Type: **Newsreader** (serif) for headlines/labels — weight 500; **Source Sans 3** for body. Base 17px / line-height 1.6. H1 46px/1.22, letter-spacing −.01em.
- Guardian thumbnail placeholder = diagonal beige stripe (`repeating-linear-gradient(135deg,#e6ddcf 0 10px,#efe8db 10px 20px)`); replace with real `thumbnailUrl`.

### Persona 2 — Informed (balanced, teal on light)
- Background `#f4f5f3`; text `#232a28`; muted `#5c6561` / `#7a847f`; faint `#9aa39e`
- Structural deep teal-green `#4b645f` (navbar, hero band, CTA); research-surface `#eef1ee`; borders `#e0e4e1` / `#dde3df`
- Accent `#7da984`; matched-pill bg `#dce8de`, text `#3a5a42`
- Radii: cards 12px, panels 10px, hero chips 6–8px
- Type: **Archivo** (sans) for UI/headings; **Source Serif 4** for article titles + hero H1. Base 16px/1.55. Hero H1 38px/1.25.

### Persona 3 — Researcher (light, dense tool)
- Background `#eef3f5`; text `#1b2a31`; muted `#5f747c`; faint `#90a2a9`
- Surfaces `#fff`; striped even rows `#f5f8f9`; panel tints `#f3f7f8` / `#f7fafb`; borders `#d7e1e4` / `#e7eef0` / `#c6d6da`
- Accent (blue family) `#2f6675`; tag bg `#e7f0f3`, border `#b9d6de`, text `#2f6675`
- Radii: 8px panels, 3–4px tags/buttons (tight)
- Type: **IBM Plex Mono** for all metadata/labels/code; **IBM Plex Sans** for titles/body. Base 15px/1.5. Dense, tabular.

> Color rule: **green family (P1/P2) and blue family (P3) never mix.**

---

## Screens / Views

### Persona 1 — Beginner
Single centered column, max-width **860px**. Top-to-bottom:
1. **Navbar** — sage dot + "trauma education" (Newsreader 20px) left; pill lang toggle right. Sticky, translucent `rgba(250,248,244,.88)` + blur.
2. **Hero** — eyebrow (uppercase, sage dot) → dynamic H1 → subcopy → interest-tag pills (`#e1ebe2` bg, `#3f5a45`) + an "adjust your topics" underlined text button.
3. **Support resource (conditional)** — shown **only when `emotionalState` is `grieving` or `distressed`**. Soft sage card with a left accent bar: gentle line + **ERAN crisis line, call 1201** (open any hour; Hebrew/Arabic/English/Russian). Framed as care, **not** a red warning banner.
4. **Adjust-topics panel (inline, collapsible)** — opens in place under the hero. Lists current tags each with an `×` remove; an add-input + Add button; enforces **max 5** ("You can follow up to five topics…"). Secondary styling.
5. **Guardian stories** — 2 cards, **horizontal** (230px image left, text right). The first card uses a **Hebrew** headline + summary to prove RTL handling. Source row: blue square + "The Guardian" + date. "Read at The Guardian →".
6. **OWID chart** — inside an `#e1ebe2` rounded section ("You are not alone in this"); one relatable global-prevalence chart (`anxiety-disorders-prevalence`).
7. **Academic previews** — 2–3 warm cards (`#f3efe6`, **left border 4px `#7da984`**, asymmetric radius `0 14px 14px 0`). Title (Newsreader), author·journal·year, 2-line abstract, a "matched :" row of outlined pills, and a "Read this, gently →" link.
8. **CTA** — full sage `#7da984` block, white text, white pill button ("See your full reading list").
9. **Also explore** — three quiet underline-on-hover rows (Interactive Map / Trends / Data Graphs) with gentle descriptions.

**Dynamic hero copy** (used when `profile.headline` absent), and the **entrance animation** intensity, both key off `emotionalState`:
- `grieving` (default): eyebrow "A gentle place to understand" · H1 "Understanding what your son carried — at your own pace." · slow far-rise stagger (dur .85s, rise 22px, long delays).
- `curious`: "A place to explore, at your pace" · "Making sense of October 7 — one story at a time." · quicker/closer (dur .6s, rise 14px).
- `distressed`: "You're in a safe place" · "Take a breath. We'll go gently, together." · near-instant, **no movement, skeleton shimmer disabled**.

### Persona 2 — Informed Learner
Hero band + **two-column feed**, max-width **1120px**.
1. **Navbar** — deep teal `#4b645f` bar, white wordmark, "Results", lang toggle.
2. **Hero band** (same teal, continues from nav) — persona label "Informed Learner" + "Primary topic — …"; dynamic H1 (Source Serif); a **content-preference label chip** ("Showing you : …"); interest-tag chips + "adjust" dashed button; inline adjust panel (white, max 5).
3. **Two-column feed** — left column header **"Stories · The Guardian"** (2px `#4b645f` underline, blue square); right column header **"Research · peer-reviewed"** (2px `#7da984` underline, ring marker). Guardian cards = image-top + blue source label. Academic cards = `#eef1ee`, **top border 3px `#7da984`**, mono "Journal article" kicker, Source-Serif title, matched pills (`#dce8de`). **Card counts shift with `contentPreference`** per the table above (cards conditionally rendered).
4. **OWID — two charts side by side** ("Data context"): `share-with-mental-and-substance-disorders` + `depressive-disorders-prevalence-ihme`, each its own titled panel with independent skeleton/fallback.
5. **CTA** — horizontal teal block, white "Open full list →" button.
6. **Also explore** — 3-up card grid (Interactive Map / Trends / Data Graphs).

**Dynamic hero H1** by `emotionalState`: `professional` → "As a social worker, you want both the human story and the evidence behind it." · `curious` → "A balanced look at PTSD — the stories and the evidence, side by side." · `grieving` → "This work is personal as well as professional…". **Pref label** by `contentPreference`: mixed → "a balanced mix of stories and research"; stories → "stories, with supporting research"; research → "research, with human context". Entrance animation: crisp short rise (dur .6s), hero items then the two columns assemble card-by-card.

### Persona 3 — Researcher
Dense, max-width **1080px**, light tool aesthetic. No Guardian content anywhere.
1. **Top bar** — mono `trauma_education / results`, "researcher mode", small bordered lang toggle.
2. **Extracted-profile card** — bordered panel; a 2×2 grid of fields: **persona / primary topic / content preference / interest tags** (mono uppercase micro-labels). **emotionalState is intentionally absent** (privacy rule). Below: **OpenAlex boolean query** in a `<pre>` code block with a **copy** button (label flips to "copied ✓" ~1.5s). "edit tags" opens a **minimal** inline tag editor (max 5).
3. **OWID — three charts**: two side-by-side (`depressive-disorders-prevalence-ihme`, `anxiety-disorders-prevalence`) + one **full-width** below (`share-with-mental-and-substance-disorders`). Each titled, each with its own skeleton + "[ series unavailable ]" fallback.
4. **Article results** — a header row ("Articles · N matched", "sorted: relevance ↓") over a **dense list** of ~9 rows. Each row: zero-padded index, **clickable title** (toggles abstract), `year · journal · authors` (mono), a **DOI** with its own copy button, right-aligned matched-tag pills, and an expandable abstract (left-rule blockquote). **Even rows striped `#f5f8f9`.** Footer link "→ open full result set (47 articles)".
5. **Also explore** — **text-only**, inline: `also: interactive_map  trends  data_graphs` (mono, minimal).

---

## Interactions & Behavior
- **Language toggle**: flips page `dir` between `ltr`/`rtl`; entire layout mirrors. Build with logical properties (`margin-inline`, `inset-inline`, `padding-inline`, `text-align:start/end`) so mirroring is free. Guardian headlines set `dir="auto"`.
- **Adjust topics**: inline collapsible panel (never a new page). Add/remove tags, **hard max 5** with a message at the cap; Enter submits the add-input. Subtle/secondary on every persona; most minimal on P3.
- **OWID iframes**: per-chart `loading → ready → failed`. Keep the iframe at `opacity:0` (absolute) until its `onLoad`, with the skeleton above it; on `onError` swap to the text fallback. Charts may also use `loading="lazy"`.
- **Copy buttons** (P3): copy query / DOI to clipboard, flip label to "copied ✓" for ~1.5s, then revert.
- **Abstract expand** (P3): clicking the title toggles a per-row `expanded` boolean; collapsed rows show a "+ abstract" affordance.
- **Entrance animation**: staggered fade/rise on hero + sections as the "page opening" reveal. Intensity scales by `emotionalState` (P1) or is uniformly crisp (P2). **Respect `prefers-reduced-motion: reduce`** — disable all entrance animation and shimmer.

## State Management
Per page: `dir` (lang), `topicsOpen` (panel), `topics[]` + `addVal` (tag editor), one `owid*` status per chart (`loading|ready|failed`). P3 adds `expanded{}` (per-article) and `queryCopied`/`doiCopied{}` flags. All page content is otherwise derived from the `profile` + fetched content arrays — no other client state.

## Data fetching
- Guardian: platform's Guardian proxy, filtered by `primaryTopic`; headlines may be pre-translated to Hebrew.
- Academic: platform's own research pipeline (OpenAlex-backed); compute `matchedTags` = intersection of article keywords with `interestTags`.
- OWID: static iframe embeds by grapher slug — no fetch, just load/error handling.

## Assets
- **No bitmap assets shipped.** Guardian thumbnails come from the API at runtime; the prototypes show a diagonal-stripe placeholder where the real `<img>` goes — swap in `thumbnailUrl` with `object-fit:cover`, and on image error fall back to the stripe so the card never breaks.
- Logos are simple CSS shapes (dot/square) + a wordmark — no image files.
- Fonts via Google Fonts: Newsreader, Source Sans 3 (P1); Archivo, Source Serif 4 (P2); IBM Plex Mono, IBM Plex Sans (P3).

## Files
- `Persona1.dc.html` — Beginner reference (all states; flip `emotionalState` in its tweaks to see grieving/curious/distressed).
- `Persona2.dc.html` — Informed reference (flip `emotionalState` + `contentPreference`).
- `Persona3.dc.html` — Researcher reference.
- `Overview.dc.html` — all three side by side (canvas).
- `support.js` — the prototype runtime. **Reference only — do not port.**
