# Adaptive UI System — Full Change Documentation

## Overview

This document covers everything added, changed, or updated during the adaptive UI implementation.
The goal was to make the entire app visually and structurally adapt based on the user's persona
(beginner, informed learner, researcher), which is determined at the end of the quiz.

---

## 1. Persona Classification (Backend)

### Files changed
- `server/utils/chat_prompts.py`
- `server/routes/chat_route.py`

---

### 1.1 `PERSONA_PROFILE_SYSTEM_PROMPT`

**Before:**
Classified users into three personas and returned 4 fields:
```json
{
  "persona": "beginner",
  "interest_tags": ["PTSD", "children"],
  "preferred_content": "personal stories",
  "search_query": "trauma AND Israel AND support"
}
```
Persona definitions were vague and had weak edge-case handling (e.g., social workers
could be misclassified as researchers).

**After:**
Returns 5 fields — added `primary_topic`:
```json
{
  "persona": "beginner",
  "interest_tags": ["PTSD", "children"],
  "preferred_content": "personal stories and basic explanations",
  "primary_topic": "children",
  "search_query": "trauma AND Israel AND children AND support"
}
```

What changed:
- Added `primary_topic` — the single most specific subject the user cares about
  (e.g. "children", "veterans", "October 7", "resilience"). Used by the frontend
  to personalise content ordering and display.
- Added concrete signal phrases per persona level to reduce misclassification.
- Sharpened edge-case rules:
  - Social worker / educator who knows some terms → "informed learner", not "researcher"
  - Casual professional language → judge by intent, not style
  - When in doubt between levels → always choose the lower (safer) level

---

### 1.2 `DYNAMIC_QUESTION_SYSTEM_PROMPT`

**Before:**
Told the AI to probe for knowledge level and content preference, but gave no guidance
on finding the user's specific topic interest.

**After:**
Added explicit instruction to uncover the user's **primary topic**:
- Which specific group or situation they care about most
  (children, veterans, October 7 survivors, domestic violence, resilience...)
- How to handle different user types:
  - Profession mentioned → ask what aspect they focus on
  - Personal connection → stay warm, explore what kind of support they need
  - Accurate clinical terms → follow up to test depth
  - Vague → ask one clarifying question about their specific area

---

### 1.3 `parse_persona_profile` in `chat_route.py`

**Before:**
```python
return {
    "persona": ...,
    "interest_tags": ...,
    "preferred_content": ...,
    "search_query": ...
}
```

**After:**
```python
return {
    "persona": ...,
    "interest_tags": ...,
    "preferred_content": ...,
    "primary_topic": parsed.get("primary_topic", ""),   # NEW
    "search_query": ...
}
```
Both the success path and the fallback (when JSON parsing fails) now include `primary_topic`.
This field is saved to MongoDB and returned to the frontend.

---

## 2. AI Assistant (Backend)

### File changed
- `server/services/ai_assistant.py`

### How it worked before
`ask_ollama()` received the raw MongoDB quiz document and dumped it into a prompt that said:
> "Each user has a score from 1-3. Score 1 = beginner, Score 2 = informed, Score 3 = researcher."

It passed the entire Mongo document (`quiz_history`) as context — unformatted. The assistant
history was also dumped raw. The prompt gave three identical-looking bullet lists per score level.

### How it works now
`ask_ollama()` receives:
- `persona_profile` — extracted fields only (`persona`, `interest_tags`, `preferred_content`, `primary_topic`)
- `history_chat` — last 6 exchanges formatted as clean `User: ... / Assistant: ...` text

The prompt gives three distinctly different instruction sets:
- **Beginner**: "Use simple, warm, non-academic language. Focus on relatable explanations,
  personal stories, and practical support. Be compassionate."
- **Informed learner**: "Balance accessible explanations with references to research. Mix
  human stories with factual context."
- **Researcher**: "Use academic and clinical language. Lead with data, mechanisms, and research
  findings. Assume professional literacy."

The assistant also connects responses to the user's `primary_topic` and `preferred_content`
whenever relevant. The user's interest tags are listed directly in the prompt.

`main()` was also updated:
- No longer requires `assistant_history` to exist (previously raised an error if missing)
- Extracts `persona_profile` from quiz history with a safe fallback to `{}`
- Formats the last 6 conversation exchanges as readable text instead of passing raw objects

---

## 3. Persona Context System (Frontend)

### Files added
- `client/src/context/personaContext.js`
- `client/src/context/PersonaProvider.jsx`
- `client/src/context/usePersona.js`

### Files changed
- `client/src/config/storageKeys.js`
- `client/src/App.jsx`

---

### How it works

The persona system mirrors the existing `DirectionProvider` pattern.

**`personaContext.js`** — creates the React context with default value `beginner`.

**`PersonaProvider.jsx`**:
- On mount, reads the stored persona from `localStorage` (`trauma_persona_cache`)
- When persona changes, sets `document.documentElement.setAttribute('data-persona', value)`
  — this is the attribute that drives all CSS themes (see Section 4)
- Persists persona to `localStorage` whenever it changes
- Normalises raw persona strings: `"informed learner"` → `"informed-learner"` (CSS-safe)

**`usePersona.js`** — a hook that returns `{ persona, setPersona }` from the context.

**`storageKeys.js`** — added:
```js
export const PERSONA_CACHE_KEY = 'trauma_persona_cache';
```

**`App.jsx`** — `PersonaProvider` wraps the entire app, outside `DirectionProvider`:
```jsx
<PersonaProvider>
  <DirectionProvider>
    <MapProvider>
      ...
    </MapProvider>
  </DirectionProvider>
</PersonaProvider>
```

---

### Where `setPersona` is called

In `ResultsPage.jsx`, in three code paths:

1. **After quiz completion** (navigating from QuizPage with `location.state`):
   Uses `routePersona.persona` or falls back to `scoreToPersona(routeScore)`.

2. **After fetching score from the API** (page reload or login):
   Uses `data.persona_profile.persona` or falls back to `scoreToPersona(s)`.

3. **From localStorage score cache** (when API fetch fails):
   Derives persona from cached score number via `scoreToPersona()`.

`scoreToPersona()` helper:
```js
function scoreToPersona(s) {
  if (s === 3) return 'researcher'
  if (s === 2) return 'informed learner'
  return 'beginner'
}
```

---

## 4. CSS Theme System

### Files changed
- `client/src/index.css`

### How it worked before
`body` had hardcoded `background: #f8f9fa` and `color: #41645a`. Every CSS module
also used hardcoded colour values. There was no theme switching at all.

### How it works now

Three themes are defined in `index.css` using CSS custom properties:

```
html                          → beginner (default, warm)
html[data-persona="informed-learner"] → informed learner (balanced)
html[data-persona="researcher"]       → researcher (dark, dense)
```

The `data-persona` attribute is set on `<html>` by `PersonaProvider`.

#### Typography scaling
```css
html                          { font-size: 17px; }  /* beginner */
html[data-persona="informed-learner"] { font-size: 15px; }
html[data-persona="researcher"]       { font-size: 15px; }
```
Because all spacing and font sizes in the app use `rem`, changing `html` font-size
automatically scales **everything** — text, padding, margins, button sizes — without
touching individual components.

#### CSS variables defined

| Variable | Purpose |
|---|---|
| `--color-bg` | Page background |
| `--color-surface` | Card / panel background |
| `--color-primary` | Main action colour |
| `--color-primary-hover` | Hover state for primary |
| `--color-text` | Body text |
| `--color-muted` | Secondary / label text |
| `--color-border` | Borders and dividers |
| `--color-nav-bg` | Navbar background |
| `--color-nav-border` | Navbar border |
| `--color-callout` | Highlight / callout boxes |
| `--color-bubble-ai` | AI chat bubble background |
| `--color-bubble-user` | User chat bubble background |
| `--radius` | Border radius |
| `--shadow` | Box shadow |

#### Theme values

| Variable | Beginner | Informed Learner | Researcher |
|---|---|---|---|
| `--color-bg` | `#fdf6ef` (warm cream) | `#f4f7f6` (neutral) | `#0f1a18` (dark) |
| `--color-surface` | `#fffbf5` | `#ffffff` | `#142220` |
| `--color-primary` | `#c07840` (terracotta) | `#41645a` (teal) | `#4fc3a1` (cyan) |
| `--color-text` | `#2d3e30` | `#1e3330` | `#b8ccc8` |
| `--color-callout` | `#f8e087` (yellow) | `#e2f0e4` (soft green) | `#182824` (dark teal) |
| `--radius` | `14px` | `10px` | `4px` |
| `html font-size` | `17px` | `15px` | `15px` |

The researcher theme also sets `color-scheme: dark` so native browser elements
(scrollbars, form inputs) also go dark.

`body` was updated to use the variables and includes a smooth transition:
```css
body {
  background: var(--color-bg);
  color: var(--color-text);
  transition: background 0.35s ease, color 0.35s ease;
}
```

---

## 5. CSS Module Updates

### Before
Every CSS module in the app used hardcoded colour values like `#41645a`, `#7eaa85`,
`#f8f9fa`, `#fff`, etc. None of these responded to any theme system.

### After
All CSS modules were updated to use CSS variables. No hardcoded colours remain
(except in graph components which were intentionally left untouched per project decision).

### Files updated

| File | Notes |
|---|---|
| `components/Navbar.module.css` | Nav background, links, buttons, dropdown |
| `components/BackendDown.module.css` | Error card |
| `components/QuizProgress.module.css` | Progress bar track and fill |
| `components/EmbeddedChart.module.css` | Chart caption and loading state |
| `components/YouTubePlaceholder.module.css` | Section background and frame |
| `components/GraphPlaceholder.module.css` | Placeholder box |
| `components/content/Score1Content.module.css` | Beginner results content |
| `components/content/Score2Content.module.css` | Informed results content |
| `components/content/Score3Content.module.css` | Researcher results content |
| `pages/QuizPage.module.css` | Quiz chat, bubbles, form, buttons |
| `pages/ResultsPage.module.css` | Results page shell (hero/card styles moved to new components) |
| `pages/AddictionsPage.module.css` | Also used by HealthPage and SleepPage |
| `pages/IsraelWarPage.module.css` | |
| `pages/TrafficAccidentsPage.module.css` | |
| `pages/DomesticViolencePage.module.css` | |
| `pages/CallsMapPage.module.css` | Map, timeline, drawer |
| `pages/Auth/AuthForm.module.css` | Login / register |
| `pages/Trends/ExploreSearchPage.module.css` | Date range panel, chart cards |
| `pages/Articles/ArticlePage.css` | Plain CSS (not a module), article cards, profile form |

**Key patterns applied across all files:**
- `#41645a`, `#7eaa85`, `#9ec4d0` → `var(--color-primary)`
- `#fff`, `#f8f9fa`, `#e1ebe2` backgrounds → `var(--color-surface)` or `var(--color-bg)`
- `#41645a` text → `var(--color-text)` or `var(--color-muted)`
- `rgba(65, 100, 90, 0.x)` borders → `var(--color-border)` or `var(--color-nav-border)`
- `#f8e087` callouts → `var(--color-callout)`
- `#e1ebe2` / `#f6e4dc` chat bubbles → `var(--color-bubble-ai)` / `var(--color-bubble-user)`
- `border-radius: 16px/12px/etc.` → `var(--radius)` or `calc(var(--radius) * 0.x)`
- `box-shadow: ...` → `var(--shadow)`

---

## 6. ResultsPage — Per-Persona Components

### Files added
```
client/src/components/results/
  BeginnerHero.jsx
  InformedHero.jsx
  ResearcherHero.jsx
  BeginnerPersonaCard.jsx
  InformedPersonaCard.jsx
  ResearcherPersonaCard.jsx
  results-components.css
```

### Files changed
- `client/src/pages/ResultsPage.jsx`
- `client/src/pages/ResultsPage.module.css`

---

### How it worked before
`ResultsPage.jsx` had a single hardcoded `<header>` and a single `<section>` persona card,
identical for all users. It showed:
- A kicker line and title (same text for everyone)
- A subtitle with `(score {score})` visible to the user
- A "Profile summary" card showing all fields including `search_query` regardless of persona

### How it works now
`ResultsPage.jsx` picks the right component based on score:
```jsx
const Hero        = score === 1 ? BeginnerHero        : score === 2 ? InformedHero        : ResearcherHero
const PersonaCard = score === 1 ? BeginnerPersonaCard : score === 2 ? InformedPersonaCard : ResearcherPersonaCard
```

Props passed to all heroes: `{ onRetake, retakeBusy, rtl, personaProfile }`
Props passed to all persona cards: `{ profile, rtl }`

---

### BeginnerHero
**Layout:** Full-width centred card with generous padding.
- Pill badge: "Personalised for you"
- Large warm heading: "Welcome — this is your learning path"
- Explanatory subtitle (no score number shown)
- Large retake button at the bottom

### InformedHero
**Layout:** Two-row horizontal layout, separated from content by a border.
- Row 1: Title on the left, retake button on the right (inline)
- Row 2: Subtitle in muted colour

### ResearcherHero
**Layout:** Single compact bar — no vertical space wasted.
- Left side: title + primary topic inline (e.g. "Trauma in Israel — children") + "Researcher" badge
- Right side: small secondary-style retake button
- No subtitle at all

---

### BeginnerPersonaCard
**Shows:** Interest tags as large rounded chips, friendly message.
**Hides:** `preferred_content`, `search_query`, `primary_topic` — too technical for beginners.

### InformedPersonaCard
**Shows:** Persona badge, topics as small chips, preferred content type.
**Hides:** `search_query` — not useful for this level.

### ResearcherPersonaCard
**Shows:** All fields in a dense info grid:
- Primary focus
- Topics (dot-separated)
- Preferred content type
- OpenAlex search query in a monospace code block with a **Copy** button (uses Clipboard API)

---

### CSS approach for results components
All styles live in `results-components.css` using plain global class names
(e.g. `.beginner-hero`, `.researcher-card__query`). This was chosen over CSS modules
so the styles cascade naturally alongside the CSS variable themes in `index.css`.

---

## 7. Articles Page — Skeleton Loading & Session Cache

### Files changed
- `client/src/pages/Articles/ArticlePage.jsx`
- `client/src/pages/Articles/ArticlePage.css`

### Skeleton loading cards
While the articles fetch is in-flight the page renders four shimmer skeleton cards
instead of a blank white area. The shimmer uses a CSS `linear-gradient` animated
with `background-position` — no JavaScript, no layout shift.

### Session storage cache
When articles load successfully they are written to `sessionStorage` under
`articles_cache_<userId>` with a 5-minute timestamp. Subsequent page visits within
that window return immediately from cache — no network request.

The cache is busted (removed + `bustCache: true` flag) after:
- Saving a changed topic profile
- Quiz retake (cleared in `ResultsPage` on the retake flow)
- Logout (`ResultsPage` removes the key in a `finally` block, so it clears even if the session-delete request fails)

---

## 8. Article Chat Bubble

### Files added / changed
- `client/src/pages/Articles/ArticleChatBubble.jsx`
- `client/src/pages/Articles/ArticlePage.css`
- `server/routes/ai_assistant_route.py` — `POST /api/article-chat` endpoint

### What it does
A floating chat bubble appears on the articles page. Users can ask questions about
their personalised article set. The assistant is grounded on all of the user's stored
articles (up to 15) and calibrates its tone to the user's persona (academic for
researchers, simple and warm for beginners). `max_tokens` is set to 800 to give the
model enough room to reference multiple articles in a single response.

### React hooks fix
`ArticleChatBubble.jsx` had a `return null` guard before `useEffect` declarations,
violating React Rules of Hooks. Fixed by moving all `useEffect` calls before the
conditional return and adding a `token` guard inside each effect.

---

## 9. Animation System

### Files changed
- `client/src/pages/Articles/ArticlePage.css`
- `client/src/index.css`

Animations are tiered by persona:

| Feature | Beginner | Informed Learner | Researcher |
|---|---|---|---|
| Article cards | Staggered slide-up, 50ms apart | Simple fade | None |
| Chat bubbles | Slide in from side | Fade in | None |
| Typing indicator | Breathing pulse | Breathing pulse | Static |
| Results hero | Scale + rise, children cascade | Fade in | None |

All animations use `cubic-bezier(0.22, 1, 0.36, 1)` (easeOutQuint). A `prefers-reduced-motion`
media query in `index.css` neutralises every animation app-wide — critical for a trauma
platform where motion can be distressing.

`@keyframes` were moved to `index.css` (global) rather than CSS Modules because Vite
hashes keyframe names inside modules, preventing global persona-selector overrides
from targeting them.

---

## 10. What Was Intentionally Left Unchanged

| Item | Reason |
|---|---|
| Graph count / difficulty | Explicitly excluded per project decision |
| Content amount / type in Score1/2/3Content | Excluded (would require graph changes) |
| `App.css` | Not imported anywhere — dead legacy file |
| `SCORING_SYSTEM_PROMPT` in chat_prompts.py | No longer used; score now derives from persona string |
| QuizPage layout | Persona is unknown during the quiz |
| Auth page layout | Transactional pages, no persona relevance |

---

## 11. Data Flow Summary

```
User takes quiz (QuizPage)
        ↓
Groq AI generates dynamic follow-up questions
(DYNAMIC_QUESTION_SYSTEM_PROMPT — probes for primary_topic)
        ↓
Quiz completes → Groq classifies persona
(PERSONA_PROFILE_SYSTEM_PROMPT — returns 5 fields including primary_topic)
        ↓
chat_route.py saves to MongoDB:
  { persona, interest_tags, preferred_content, primary_topic, search_query, score }
        ↓
Frontend receives persona_profile in response
        ↓
ResultsPage calls setPersona(persona_profile.persona)
        ↓
PersonaProvider sets data-persona on <html>
        ↓
CSS variables activate the matching theme
ALL pages now reflect the correct visual theme
        ↓
ResultsPage renders:
  BeginnerHero / InformedHero / ResearcherHero
  BeginnerPersonaCard / InformedPersonaCard / ResearcherPersonaCard
  Score1Content / Score2Content / Score3Content
        ↓
User navigates to Articles page
  → Session cache checked first (5-min TTL)
  → Articles ranked by stored content_score + click count + recency
  → Skeleton cards shown while loading
  → Article chat bubble available for persona-calibrated Q&A
        ↓
Persona persists in localStorage (trauma_persona_cache)
→ Theme survives page refresh / navigation
```
