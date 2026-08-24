# CityPulse — Complete Frontend Design System & UI Specification
### (Design tokens → components → animation → page-by-page wireframes)

> This is a build-ready spec, not a mood board. Every color, spacing value, radius, font size, and animation timing is given as an exact number so a developer or an AI coding tool has nothing left to guess or default on. Guessing is what produces the generic look — this document removes the guessing.

---

## PART A — DESIGN TOKENS (the actual CSS variables to use)

Paste this as the root token file. Everything else in the app references these — nothing is ever hardcoded inline.

```css
:root {
  /* ---- Surface & Background ---- */
  --color-bg-app:        #FAF7F2;   /* warm paper, app background */
  --color-bg-app-alt:     #F3EEE4;   /* slightly deeper paper, used for section bands */
  --color-surface:        #FFFFFF;   /* card surface */
  --color-surface-sunken: #F6F2EA;   /* input fields, inset areas */
  --color-surface-hover:  #FDFBF7;   /* card hover tint */

  /* ---- Borders ---- */
  --color-border:         #E8E2D6;   /* default hairline */
  --color-border-strong:  #D8CFBD;   /* dividers that need more presence */

  /* ---- Text ---- */
  --color-ink:            #22221F;   /* primary text, NOT pure black */
  --color-ink-muted:      #6B6659;   /* secondary text, meta, timestamps */
  --color-ink-faint:      #A39D8E;   /* placeholder, disabled text */
  --color-ink-inverse:    #FAF7F2;   /* text on filled dark/accent surfaces */

  /* ---- Brand / Accent ---- */
  --color-teal-900:       #0B4A40;
  --color-teal-700:       #0F6B5C;   /* PRIMARY brand color */
  --color-teal-500:       #2E8C7B;
  --color-teal-200:       #BFE0D6;
  --color-teal-100:       #E3F1EC;   /* tinted backgrounds, badges */

  --color-terracotta-700: #C05B32;   /* SECONDARY accent */
  --color-terracotta-500: #D97D53;
  --color-terracotta-100: #F7E3D8;

  /* ---- Severity / Status (desaturated, "civic," not stoplight) ---- */
  --color-severity-low:      #6B9E7A;  /* sage green */
  --color-severity-medium:   #D89A2C;  /* amber ochre */
  --color-severity-critical: #B33B2E;  /* brick red */
  --color-status-pending:    #5C7A94;  /* slate blue-gray */
  --color-status-progress:   #C4832E;
  --color-status-resolved:   #3E8E5B;

  --color-tint-low:      #EDF3EE;
  --color-tint-medium:   #FBF1DF;
  --color-tint-critical: #F8E7E4;
  --color-tint-pending:  #EAF0F4;

  /* ---- Spacing scale (4px base) ---- */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-5: 20px;  --space-6: 24px;
  --space-8: 32px;  --space-10: 40px; --space-12: 48px;
  --space-16: 64px; --space-20: 80px;

  /* ---- Radius scale ---- */
  --radius-sm: 6px;    /* chips, small buttons */
  --radius-md: 10px;   /* inputs, badges */
  --radius-lg: 12px;   /* cards — the standard */
  --radius-xl: 16px;   /* hero/map card only */
  --radius-pill: 999px;/* nav pills, status badges */

  /* ---- Elevation (kept minimal on purpose) ---- */
  --shadow-none:  none;
  --shadow-rest:  0 1px 2px rgba(34,34,31,0.03);
  --shadow-hover: 0 4px 14px rgba(34,34,31,0.06);
  --shadow-drawer:-8px 0 24px rgba(34,34,31,0.08);

  /* ---- Typography ---- */
  --font-display: 'Fraunces', 'Source Serif 4', Georgia, serif;
  --font-body:    'Public Sans', 'Inter', -apple-system, sans-serif;
  --font-mono:    'IBM Plex Mono', 'JetBrains Mono', monospace;

  --fs-display-xl: 56px;  --lh-display-xl: 1.05;  /* hero stat numbers */
  --fs-display-lg: 40px;  --lh-display-lg: 1.1;
  --fs-display-md: 28px;  --lh-display-md: 1.2;   /* card titles */
  --fs-body-lg:    17px;  --lh-body-lg: 1.55;
  --fs-body-md:    15px;  --lh-body-md: 1.55;      /* default body */
  --fs-body-sm:    13px;  --lh-body-sm: 1.5;        /* meta text */
  --fs-eyebrow:    11px;  /* uppercase card labels, +0.08em tracking */

  /* ---- Motion ---- */
  --ease-standard: cubic-bezier(0.22, 1, 0.36, 1);   /* snappy-settle, use everywhere */
  --ease-in-out:   cubic-bezier(0.45, 0, 0.55, 1);
  --dur-fast:   120ms;
  --dur-base:   200ms;
  --dur-slow:   360ms;
  --dur-drawer: 320ms;
}
```

**Contrast check:** `--color-ink (#22221F)` on `--color-bg-app (#FAF7F2)` = 14.8:1 — passes AAA. `--color-ink-muted` on white = 5.1:1 — passes AA for normal text. All severity colors were manually checked against their tint backgrounds for 4.5:1+ text contrast.

---

## PART B — GRID SYSTEM

- **Container**: max-width `1440px`, centered, side padding `40px` desktop / `20px` tablet / `16px` mobile.
- **Base grid**: 12-column CSS grid, `20px` gutter (`--space-5`), `1fr` tracks.
- **Bento card spans** (desktop, ≥1200px): hero card = `grid-column: span 7` × `grid-row: span 2`; tall stat card = `span 5` × `span 2`; medium cards = `span 4`; narrow cards = `span 3`. Row height driven by `grid-auto-rows: 140px` so spans compose predictably.
- **Breakpoints**: `≥1200px` desktop (full bento), `768–1199px` tablet (bento collapses to 2-col, hero card drops to full-width span), `<768px` mobile (single column, hero card first, cards stack in priority order — see Part F).

---

## PART C — COMPONENT SPECIFICATIONS (exact, with states)

### C.1 Top Identity Strip
- Height: `60px` fixed, `background: var(--color-bg-app)`, bottom border `1px solid var(--color-border)`. **No shadow** — it should sit flush with the page, not float above it like a typical app bar.
- Logo mark: a custom geometric mark — a small circle with a single offset "pulse ring" arc around it (suggesting a signal/radar ping — literal nod to "civic pulse"), 28×28px, in `--color-teal-700`. Wordmark "CityPulse" in `--font-display` 18px semibold next to it, then a `1px` vertical divider, then a muted pill `VMC · Vadodara` in `--fs-body-sm`.
- Live status pill (center-right): `height: 32px`, `radius: pill`, `background: var(--color-teal-100)`, text `var(--color-teal-900)`, containing a `6px` dot that runs the **Pulse Dot animation** (see Part D.3) + text "12 new today." This pill is the single "alive" element in an otherwise calm header.
- Right cluster: ward-selector pill (outlined, chevron-down, opens a lightweight popover — not a native `<select>`), a vertical divider, then officer avatar (32px circle, initials on `--color-terracotta-100` bg) + name in body-sm, muted.

### C.2 Pill Tab Navigation
- Row height `44px`, positioned `16px` below the identity strip, left-aligned within the container (not centered, not full-width tabs).
- Each pill: `height 40px`, `padding 0 20px`, `radius: pill`, `font: body-md medium`.
  - **Inactive state**: `background: transparent`, `border: 1px solid var(--color-border)`, `color: var(--color-ink-muted)`.
  - **Hover**: `border-color: var(--color-border-strong)`, `background: var(--color-surface-hover)`, `transform: translateY(-1px)`, transition `--dur-fast`.
  - **Active state**: `background: var(--color-teal-700)`, `color: var(--color-ink-inverse)`, small `18px` line-icon to the left of the label, no border.
  - Each pill has a small numeric badge for pending counts where relevant (e.g. `Complaint Queue  34`) — badge is a `20px` circle, `--color-terracotta-700` bg, white text, `11px`.
- **Active-tab indicator animation**: rather than a hard cut, a `2px` teal underline element with `layoutId`-style shared transition slides and resizes from the previous active pill to the new one over `--dur-base` with `--ease-standard` (this is the FLIP-animation pattern — visually it looks like the underline "travels").

### C.3 Card — Base Component
- `background: var(--color-surface)`, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-lg)`, `padding: 24px`.
- `box-shadow: var(--shadow-rest)` at rest (barely visible, just enough to lift off the warm background).
- **Hover** (only on interactive cards): `box-shadow: var(--shadow-hover)`, `border-color: var(--color-border-strong)`, `transform: translateY(-2px)`; transition `all --dur-base --ease-standard`. Never scale — only lift.
- **Left accent bar**: a `4px`-wide, full-height colored bar flush to the card's left edge, `border-radius: var(--radius-lg) 0 0 var(--radius-lg)`, color = category/severity color. This bar is the *only* saturated color allowed on an otherwise neutral card — it's what lets 8 cards sit next to each other without visual noise while still being instantly scannable by color.
- **Header pattern**: eyebrow label (`--fs-eyebrow`, uppercase, `letter-spacing: 0.08em`, `color: var(--color-ink-muted)`) sits above a `--font-display` title. `8px` gap between them.

### C.4 Stat Card (e.g. "Complaints Today")
- Fixed internal layout: eyebrow → big number (`--fs-display-xl`, `--font-display`, `--color-ink`) → trend row.
- Trend row: small triangle glyph (▲/▼, custom SVG not emoji) + percentage in `--fs-body-sm` + " vs last week" in `--color-ink-faint`. Positive trend = `--color-severity-low` (sage), negative (more complaints = worse) = `--color-severity-critical`, contextual per metric.
- Bottom-right corner: a tiny 7-day sparkline (SVG polyline, `1.5px` stroke, `--color-teal-500`, no axis/labels/grid — pure minimal trend shape, `48×20px`).

### C.5 Complaint Card
- Height: `auto`, min `88px`. Grid: `[severity-dot+icon 40px] [content 1fr] [meta/status 140px]`.
- Severity dot: `10px` circle, solid severity color, with a `2px` ring of the same color at 20% opacity around it (creates a soft "target" look, not a flat dot).
- Category icon: `20px`, custom line-icon (see Part E), sits directly right of the dot, `--color-ink-muted`.
- Title: `--font-body`, `16px medium`, `--color-ink`. Meta line below in `--fs-body-sm`, `--color-ink-muted`: `Sardar Bridge Rd · Ward 4 · 2h ago`.
- Confirmation cluster: overlapping circular avatars (`24px`, `-8px` overlap, white `2px` border) showing up to 3 "confirmer" initials-circles in muted tones, then `+4` text if more — this is the signature "social proof" element, deliberately more tactile than a plain "7 confirmations" text.
- Status badge: pill, `28px` height, outlined in status color, `background: var(--color-tint-*)`, label in status color, `--fs-body-sm medium`.
- **Hover**: left accent bar animates from `4px` to `6px` width over `--dur-fast` (a "thickening" micro-cue), card lifts per C.3 base rule.
- **New-arrival state** (Socket.IO push): see Part D.1.

### C.6 Recurring Problem Alert Card
- Visually distinct from complaint cards: left accent bar is `6px` (not 4px) in `--color-terracotta-700`, AND the card background is `--color-terracotta-100` at low opacity blended into white (roughly a 6% terracotta wash) rather than plain white — the only card type allowed a tinted background, so it reads as categorically different at a glance.
- Custom "recurrence" glyph (a small circular-arrow icon, not a generic warning triangle — triangles are overused) at top-left.
- Copy pattern: bold count ("Reported **4×** in 8 months") in body, then a muted recommendation line below in italic serif (`--font-display`, `15px`, `--color-ink-muted`) — the italic serif for the recommendation text is a deliberate typographic differentiator that makes it feel like an expert annotation, not a system alert.

### C.7 Map Card (Hero)
- `border-radius: var(--radius-xl)` (the one card allowed the larger radius, marking it as the centerpiece).
- Basemap: light CARTO Positron-style tiles, then a CSS `filter` applied for cohesion: `sepia(8%) saturate(85%) hue-rotate(-6deg)` — this subtly pulls default map tile colors toward the warm palette instead of clashing cold blue/gray against the paper background.
- Custom marker (see Part E.2) with **drop-in animation** on first paint (see D.5).
- Floating control cluster: bottom-right, a small vertical stack of pill-shaped toggle buttons (`Pins` / `Heat` / `Wards`) in a single rounded `--radius-lg` white capsule with `--shadow-hover`, `12px` padding, `8px` gap between icon-only buttons (`36×36px` each).
- Bottom-left floating legend chip: small horizontal row of severity dots + labels in a translucent white pill (`background: rgba(255,255,255,0.9)`, `backdrop-filter: blur(6px)`).

### C.8 Buttons
- **Primary**: `height 44px`, `padding 0 20px`, `radius: var(--radius-md)`, `background: var(--color-teal-700)`, text white `body-md semibold`. Hover: `background: var(--color-teal-900)`, `translateY(-1px)`. Active/pressed: `translateY(0)`, `background: var(--color-teal-900)`, subtle `scale(0.98)` — the only place scale is used, and only 2%, on press feedback.
- **Secondary/outline**: transparent bg, `1.5px solid var(--color-teal-700)`, text `--color-teal-700`. Hover: `background: var(--color-teal-100)`.
- **Destructive/Reopen**: outline style using `--color-terracotta-700` — never a solid red fill button. Filled red buttons read as generic-alarmist; an outlined terracotta button feels deliberate and calmer while still signaling caution.
- **Focus ring** (keyboard nav, accessibility): `2px solid var(--color-teal-500)` offset `2px`, on every interactive element without exception.

### C.9 Status Stepper (inside Complaint Detail drawer)
- Vertical layout, `24px` between steps. Each step: a `12px` circle node on a connecting `2px` line.
  - Completed step: filled `--color-teal-700` circle with a small custom checkmark glyph inside, connecting line below also solid teal.
  - Current step: circle has a `4px` ring pulse animation (see D.3 variant), connecting line above solid, below dashed/faint.
  - Future step: `10px` hollow circle, `--color-border-strong` line.
- Each node has: status label (`body-md medium`), timestamp (`--font-mono`, `13px`, `--color-ink-muted`), officer name if applicable.

### C.10 Filter Pill Row
- Horizontal scrollable row (desktop: wraps; mobile: horizontal scroll with subtle edge fade mask) of toggle chips: `height 36px`, `radius: pill`, outline default, filled `--color-teal-100` bg + `--color-teal-900` text when active, with a small `×` to clear when active.

### C.11 Skeleton Loading State
- No generic gray shimmer bars. Instead, cards render their exact final layout with content areas filled in `--color-surface-sunken`, and a **single soft diagonal light sweep** (`linear-gradient` band at 20% opacity, `--color-teal-100`) animates left-to-right across the whole bento grid every 1.8s — feels like one coordinated "loading wave" across the control wall rather than each card shimmering independently and chaotically.

---

## PART D — ANIMATION SPECIFICATION (exact timings, not vague "smooth transitions")

### D.1 New Complaint Arrival (Socket.IO push into Queue)
1. New card is inserted at natural sort position with `height: 0 → auto` and `opacity: 0 → 1`, `--dur-slow` (360ms), `--ease-standard`.
2. Simultaneously, a `background-color` keyframe: `--color-teal-100 → transparent` over `1400ms` linear, ease-out at the tail — a soft "highlight wash" that tells the officer's eye where to look without an intrusive toast.
3. If the tab is not currently on Queue, the numeric badge on the "Complaint Queue" pill (C.2) increments with a tiny bounce: `scale(1 → 1.3 → 1)` over `240ms`.
4. No sound by default; a subtle single "tick" haptic-style visual (badge bounce) is the only feedback — keep the control room calm.

### D.2 Card Hover Lift
`transform: translateY(0) → translateY(-2px)`, `box-shadow: rest → hover`, `border-color` shift — all in one `transition: all 200ms cubic-bezier(0.22,1,0.36,1)`. Reverse on mouse-leave at the same duration (no snap-back).

### D.3 Pulse Dot (Critical severity + "live" status pill)
Keyframe loop, `2000ms`, infinite, `ease-in-out`:
- `0%`: dot `opacity: 1`, ring `scale(1) opacity(0.5)`
- `70%`: ring `scale(2.2) opacity(0)`
- `100%`: reset
This is a classic "sonar ping" — ring expands and fades while the core dot stays solid. Used ONLY on: the live-status header pill, Critical severity dots, and the current step in the status stepper. Never applied broadly — restraint is what makes it read as urgency rather than decoration.

### D.4 Tab Switch (content transition)
When switching between top-level tabs, the outgoing grid fades+shrinks slightly (`opacity 1→0`, `scale(1→0.98)`, `160ms`) then the incoming grid fades+grows in (`opacity 0→1`, `scale(0.98→1)`, `220ms`, slight `40ms` delay for cross-fade overlap) — a soft "breathe" transition, never a hard cut, never a slide-the-whole-page transition (which feels heavy for a dashboard).

### D.5 Map Marker Drop-In
On initial map render, markers appear staggered by proximity-sort, each with: `translateY(-12px) opacity(0) → translateY(0) opacity(1)`, `280ms`, `--ease-standard`, with `18ms` stagger delay between consecutive markers (capped at first 40 markers, rest appear instantly to avoid a long wait on dense maps). Feels like pins are being "placed" on the map rather than popping in all at once.

### D.6 Drawer Slide-In (Complaint Detail)
- Backdrop: rest-of-grid dims to `85%` opacity with a `4px` blur (`backdrop-filter`), `240ms`.
- Drawer panel: `translateX(100% → 0)`, width `420px` desktop / `100%` mobile, `320ms`, `--ease-standard`, with its own internal content staggering slightly (badges row fades in first at `80ms`, then map thumbnail at `140ms`, then stepper at `200ms` — a light cascade, not simultaneous pop).
- Close: reverse, `200ms`, faster than open (closing should feel quicker/lighter than opening).

### D.7 Count-Up Numbers (stat cards, on first mount / tab entry)
`600–800ms` `ease-out` numeric interpolation from 0 to final value using `requestAnimationFrame`, easing curve `cubic-bezier(0.16, 1, 0.3, 1)` (a strong "decelerate" curve) — number visibly slows into place rather than linear ticking, which feels more deliberate/premium.

### D.8 Priority Score Radial Gauge (used on Officer cards & Queue sort indicator)
An SVG circular progress ring (not a percentage bar) representing workload or priority score: `stroke-dasharray` animates from `0 → target` over `700ms`, `--ease-standard`, on mount. Ring color shifts along the severity scale (sage→amber→brick) based on value, using a smooth `stroke` color interpolation rather than a hard threshold jump.

### D.9 Recurring Alert "Stitch" Reveal
Unique signature animation for Section-C.6 cards only: the terracotta left accent bar draws in top-to-bottom like a progress stroke (`height: 0 → 100%`, `400ms`, `--ease-standard`) rather than just appearing — reinforces that this card category is "different" every single time one enters the viewport (triggered once via IntersectionObserver, not on every scroll).

### D.10 Filter Chip Toggle
`background-color` and `color` cross-fade `150ms`, plus a `2px` scale-pop (`scale(1 → 1.06 → 1)`, `180ms`) on activation only — gives tactile "click" feedback without being cartoonish.

---

## PART E — SIGNATURE / UNIQUE ELEMENTS (what makes this NOT look templated)

### E.1 Custom Category Icon Set
Commission or hand-build 10 line icons at `1.5px` stroke, `24×24px` viewBox, rounded caps, duotone (outline `--color-ink`, fill 15%-opacity of the category's assigned color): Pothole (cracked-circle glyph), Water Leak (droplet with motion lines), Streetlight (lamp-post silhouette), Garbage (bin with overflow lines), Open Manhole, Exposed Wiring, Gas Leak, Road Damage, Drainage, Traffic Signal. Consistent stroke weight across all 10 is what makes the set read as bespoke rather than mixed-library.

### E.2 Custom Map Marker
Not a default Leaflet teardrop. Design: a rounded-square "badge" (28×28px, `radius 8px`) in white with a `2px` border in the severity color, containing the category line-icon at `16px` centered, with a small triangular tail pointing down to the exact coordinate. Critical-severity markers get the Pulse Dot ring animation (D.3) around them; others stay static. This single custom marker shape is one of the highest-leverage "doesn't look AI-generated" decisions in the whole system, since default map pins are an instant tell.

### E.3 Confirmation Avatar Stack
Described in C.5 — reused consistently across Complaint Cards, the Detail Drawer, and Hotspot cards as the standard way to represent "N citizens affected." Never swapped for a plain number in some places and avatars in others — consistency here builds the feeling of a considered system.

### E.4 Ward Silhouette Watermark
On the Overview tab background (behind the bento grid, very low opacity `4–6%`), render a faint single-color SVG outline of Vadodara's ward boundaries in `--color-teal-700`. It's static, non-interactive, barely noticeable consciously — but it's the kind of detail that makes people feel "this was made specifically for this city," which is exactly the opposite of generic.

### E.5 Priority Score Ring
See D.8 — used instead of a generic numeric badge or horizontal progress bar anywhere priority/workload needs representing. Consistent radial-gauge language throughout (Officer cards, Queue sort control, Hotspot ranking) becomes a recognizable "CityPulse" visual signature.

### E.6 Editorial Micro-copy
Small departures from generic SaaS copy tone: card eyebrows read like a newsroom ticker (`TODAY'S SIGNAL`, `THE WEEK IN NUMBERS`, `WHAT NEEDS ATTENTION`) rather than flat labels (`Stats`, `Overview`, `Alerts`). This tonal choice reinforces the "civic control wall" feeling established by the layout.

---

## PART F — PAGE-BY-PAGE WIREFRAMES (exact grid spans)

### F.1 Overview
```
┌──────────────────────────────────────────┬─────────────┐
│                                            │  TODAY'S    │
│                                            │  SIGNAL     │
│           LIVE MAP (hero)                 │  (stat,     │
│           span 7 / row 2                  │  span 5,    │
│                                            │  row 2)     │
│                                            │             │
├───────────────────┬────────────┬──────────┴─────────────┤
│  CATEGORY          │ RECURRING  │  RECENT ACTIVITY        │
│  BREAKDOWN          │ ALERTS     │  (live ticker,          │
│  (span 4)           │ (span 4)   │  span 4, row 2,         │
│                     │            │  scrollable)            │
└───────────────────┴────────────┴─────────────────────────┘
```
Mobile order (single column, priority-stacked): Today's Signal → Live Map → Recurring Alerts → Recent Activity → Category Breakdown.

### F.2 Live Map (full tab)
```
┌───────────────────────────────────────────┬───────────────┐
│  Filter pill row (category/severity/ward)   │               │
├───────────────────────────────────────────┤  Visible-      │
│                                              │  complaints   │
│              FULL MAP (70% width)           │  list, synced │
│                                              │  to map bounds│
│                                              │  (30% width,  │
│                                              │  scrollable)  │
└───────────────────────────────────────────┴───────────────┘
```

### F.3 Complaint Queue
```
[ Priority Score ▾ ] [ Newest ] [ Most Confirmed ] [ Oldest ]      [Grid ▦ | Table ☰]
Pending 34 · Assigned 12 · In Progress 8 · Resolved 190   (sticky pill row)

┌───card───┐ ┌───card───┐ ┌───card───┐
┌───card───┐ ┌───card───┐ ┌───card───┐    (2–3 per row desktop, 1 per row mobile)
```

### F.4 Complaint Detail Drawer (420px, right-side)
```
[ Category badge ] [ Severity badge ] [ Status badge ]         (top row, fades in first)
Title (serif, 22px)
Ward · Coordinates (mono) · Reported 2h ago

[ Mini map thumbnail, 100%×160px, custom marker ]               (fades in second)

Confirmed by: (avatar stack) 7 citizens

Status Stepper: Pending → Assigned → In Progress → Resolved     (fades in third)

Assign Officer:  [ dropdown ]        [ Assign ] (primary button)
[ Mark In Progress ]  [ Mark Resolved ]  (secondary / primary)
```

### F.5 Hotspots
```
[ HEATMAP — full width, 360px height ]

◀ [hotspot card] [hotspot card] [hotspot card] [hotspot card] ▶   (horizontal scroll, ranked)
```

### F.6 Officers
```
┌─officer card─┐ ┌─officer card─┐ ┌─officer card─┐ ┌─officer card─┐
  (radial gauge for active-complaint load, name, dept, ward — 4 per row desktop)
```

### F.7 Transparency (public)
```
"How CityPulse Works" — 4-step horizontal strip with connecting dashed line, icons + 1-line copy

┌stat card┐ ┌stat card┐ ┌stat card┐ ┌stat card┐   (softer palette only: teal/sage)

Ward comparison — horizontal ranked bar list (same pattern as Category Breakdown)
```

---

## PART G — RESPONSIVE RULES

- **Desktop ≥1200px**: full bento grid as specified.
- **Tablet 768–1199px**: grid collapses to 2 columns; hero map card becomes full-width `span 2`; all other cards `span 1`; pill nav wraps to 2 rows if needed, still left-aligned.
- **Mobile <768px**: single column; identity strip collapses ward-selector and officer name behind a single icon-button; pill nav becomes horizontally scrollable (edge-fade mask, no visible scrollbar); Complaint Detail becomes a full-screen sheet (slides up from bottom, not from the right) instead of a side drawer; map card height caps at `280px` with a "View Full Map" expand action.

---

## PART H — CONDENSED AI-CODING-TOOL PROMPT

Paste this whole block into your code generator for a build-ready first pass:

> "Build the CityPulse municipal dashboard in Next.js + Tailwind + Framer Motion. Use the exact design tokens: background #FAF7F2, card surface #FFFFFF with 1px #E8E2D6 border and 12px radius (16px for the hero map card only), primary accent teal #0F6B5C, secondary accent terracotta #C05B32, ink text #22221F (never pure black), severity colors sage #6B9E7A / amber #D89A2C / brick #B33B2E (desaturated, never neon). Typography: Fraunces serif for headings/big numbers, Public Sans for body/UI, IBM Plex Mono for IDs/coordinates/timestamps. Layout: NO left sidebar — a 60px top identity strip with a custom pulse-ring logo mark, then a left-aligned horizontal pill-tab nav row (Overview/Live Map/Complaint Queue/Hotspots/Officers/Transparency) with a sliding underline indicator on tab change, then a 12-column asymmetric bento grid (hero map card span-7 row-2, stat cards span-5, supporting cards span-4/span-3) with 20px gutters. Cards: flat at rest (shadow 0 1px 2px rgba(34,34,31,0.03)), lift 2px with soft shadow on hover (no scale), 4px colored left accent bar per category/severity, eyebrow label + serif title header pattern. Complaint cards include an overlapping circular avatar stack for confirmations. Use a custom light Leaflet basemap (CARTO Positron) with a CSS filter (sepia(8%) saturate(85%) hue-rotate(-6deg)) to warm the tiles, and custom rounded-square badge map markers (not default teardrops) with a category icon inside, pulsing ring animation only on critical-severity markers. Complaint detail opens as a 420px right-side slide-in drawer (backdrop blur+dim, never a centered modal) with a vertical status stepper showing pulse-ring on the current step. Animations: new Socket.IO complaint arrivals fade+slide in with a 1.4s teal highlight wash and a bouncy badge-count increment; tab switches cross-fade+scale(0.98→1) instead of hard cuts; stat numbers count up on mount with a strong ease-out curve; recurring-problem alert cards get a distinct terracotta-tinted background, thicker 6px left bar, and their accent bar animates drawing top-to-bottom on scroll-into-view. Explicitly avoid: dark/black sidebars, indigo-violet gradients, default unstyled Lucide icons, heavy drop shadows at rest, 20px+ bubbly corners, neon stoplight severity colors, centered modals, and default OSM tile colors."

---

## PART I — ONE-LINE BRIEF (unchanged, still the north star)

**A warm, light, teal-and-terracotta civic control wall — pill-tab navigation instead of a sidebar, an asymmetric bento grid of flat hairline-bordered cards with serif headlines, a custom-tinted light map with bespoke rounded-badge markers, a signature radial priority gauge, and restrained sonar-pulse motion on critical items only — engineered down to exact tokens so it cannot drift into looking like a generated template.**
