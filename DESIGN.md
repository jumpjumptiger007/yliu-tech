---
version: "1.0"
status: "site-wide-validated-source-of-truth"
name: "YLIU.TECH — Personal Tech Magazine Design System"
description: >
  A dark editorial design system for Yiqiang Adrian Liu's personal website.
  The visual language combines magazine hierarchy, technical metadata, restrained
  system surfaces, low-intensity green ambient light, and selective interaction.
  This version is validated against the approved Homepage, Work Directory, and
  Project Detail frozen references. It is the site-wide source of truth for
  visual language, page archetypes, shared components, and implementation behavior.

colors:
  bg: "#050706"
  field: "#070A08"
  field-dense: "#090D0A"
  panel: "#0B100D"
  panel-raised: "#0D120F"
  text-primary: "#EDF1EC"
  text-secondary: "#B5BEB7"
  text-muted: "#758077"
  line: "#203126"
  line-strong: "#2D4632"
  line-hover: "#456440"
  signal-green: "#A6FF1A"
  signal-green-ink: "#071005"
  ghost-green: "#122117"

typography:
  display:
    fontFamily: '"Bricolage Grotesque", sans-serif'
    variableSettings: '"wdth" 94, "opsz" 48'
    usage: "Hero names, major editorial titles, project names, contact statement"
  body:
    fontFamily: '"Instrument Sans", sans-serif'
    usage: "Descriptions, summaries, explanatory copy, reading text"
  mono:
    fontFamily: '"IBM Plex Mono", monospace'
    usage: "Section numbers, status, metadata, nav, system labels, technical readouts"

rounded:
  none: "0px"
  technical-small: "7px"
  technical-medium: "10px"
  control: "12px"
  panel: "16px"
  full: "9999px"

spacing:
  xxs: "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "28px"
  3xl: "36px"
  4xl: "48px"
  5xl: "58px"
  6xl: "66px"
  page-desktop: "48px"
  page-tablet: "36px"
  page-mobile: "20px"

layout:
  atmosphericCanvas: "full viewport width"
  editorialWidth: "1560px"
  pageEdge: "max(clamp(20px, 3.35vw, 48px), (100% - 1560px) / 2)"
  breakpointTablet: "1000px"
  breakpointMobile: "760px"
  breakpointCompact: "680px"

ambient:
  signalGlow: "rgba(166,255,26,.024)"
  softGlow: "rgba(92,128,88,.026)"
  faintGlow: "rgba(166,255,26,.012)"
  principle: "Broad, dim, green-biased fields. Never neon blobs or glowing UI chrome."

motion:
  revealDistance: "small"
  easing: "cubic-bezier(.22,1,.36,1)"
  principle: "Motion creates depth and continuity, never spectacle."
  reducedMotion: "Required"
  homepageTicker: "Expose an accessible PAUSE/RESUME control; reduced motion remains authoritative."

components:
  section-label:
    typography: "mono"
    fontSize: "10px desktop / 9px mobile"
    fontWeight: 600
    letterSpacing: ".14em"
    numberColor: "{colors.signal-green}"
    textColor: "{colors.text-primary}"
    ruleColor: "{colors.line}"
    role: "Primary editorial chapter separator"
  technical-panel:
    backgroundColor: "{colors.panel}"
    borderColor: "{colors.line-strong}"
    borderWidth: "1px"
    rounded: "{rounded.panel}"
    shadow: "none"
  technical-control:
    backgroundColor: "{colors.field-dense}"
    borderColor: "{colors.line-strong}"
    borderWidth: "1px"
    rounded: "{rounded.control}"
  signal-cta:
    backgroundColor: "{colors.signal-green}"
    textColor: "{colors.signal-green-ink}"
    rounded: "{rounded.control}"
    shadow: "none"
  editorial-table:
    backgroundColor: "transparent"
    rowBorderColor: "{colors.line}"
    strongBorderColor: "{colors.line-strong}"
    radius: "{rounded.none}"
    shadow: "none"
  report-table:
    backgroundColor: "{colors.field-dense}"
    rowBorderColor: "{colors.line}"
    headingTypography: "mono, 10px, uppercase"
    valueColor: "{colors.text-primary}"
    emphasisColor: "{colors.signal-green}"
    overflow: "horizontally scrollable region when needed"
    role: "Reusable structured Project Detail output"
  glass-navigation:
    usage: "Shared site chrome across Homepage, Work Directory, and Project Detail"
    role: "Floating navigation exception, not a general surface pattern"
---

# YLIU.TECH — DESIGN.md

## 0. Document status

This document is the **v1.0 site-wide design-system source of truth** for YLIU.TECH.

It consolidates:

1. the approved Homepage frozen sections and unified Homepage art direction;
2. the approved Work Directory card-based frozen reference;
3. the approved Project Detail frozen reference;
4. the durable editorial and technical identity of the site.

The Homepage, Work Directory, and Project Detail archetypes are now visually validated.

### Source precedence

When implementing the site, use this precedence:

1. **Global visual and behavioral rules:** this `DESIGN.md`
2. **Shared component behavior:** the production implementation of approved reusable components
3. **Page-specific composition:** the corresponding Frozen HTML reference
4. **Existing production architecture:** preserve data flow, generators, semantics, SEO, and accessibility unless the approved design requires a structural change

Do not copy prototype markup blindly. Adapt the approved visual result into the existing production architecture.

### Frozen reference set

The current approved visual references are:

- Homepage frozen section references + approved unified Homepage composition
- `work-page-frozen.html`
- `project-page-frozen.html`

The Frozen HTML files define visual composition. `DESIGN.md` defines the system-level rules. Production code defines reusable implementation behavior once the approved components are implemented.

---

# 1. Core identity

## Brand

**Yiqiang Adrian Liu**<br>
**Independent Developer & Builder**

YLIU.TECH is a **personal technology magazine made by one developer**.

It is not:

- a generic software-engineer portfolio;
- a SaaS landing page;
- an AI startup homepage;
- a corporate design-system demo;
- a cyberpunk terminal theme;
- a collection of equal project cards.

The site should feel closer to an independent technology publication, experimental software journal, and technical field notebook than a conventional portfolio template.

## Character

The design should remain:

- Editorial
- Technical
- Restrained
- Experimental
- Intentional
- Slightly strange
- Personal
- Precise

The page may feel authored. It should not feel templated.

---

# 2. Visual theme & atmosphere

The site is built on an almost-black green-biased editorial canvas.

Typography establishes hierarchy first. Technical metadata, controlled asymmetry, low-intensity ambient light, system surfaces, motion, and real project artifacts provide secondary character.

The visual language should communicate:

> **personal magazine first, technical system second, portfolio third.**

The site is dark, but not cinematic-black luxury. It is technical, but not a terminal skin. It uses green, but not as neon decoration.

## Visual hierarchy

Use the following priority:

1. Typography
2. Composition
3. Negative space
4. Information hierarchy
5. Real project content
6. Technical metadata
7. Ambient field
8. Borders and surfaces
9. Motion
10. Decoration

If an effect does not improve hierarchy, comprehension, navigation, atmosphere, or project understanding, remove it.

---

# 3. Color system

## Core palette

| Token | Value | Role |
| --- | --- | --- |
| `bg` | `#050706` | Primary page canvas |
| `field` | `#070A08` | Editorial section field |
| `field-dense` | `#090D0A` | Denser chapter or technical field |
| `panel` | `#0B100D` | Primary technical/card surface |
| `panel-raised` | `#0D120F` | Secondary panel variation |
| `text-primary` | `#EDF1EC` | Display and primary reading text |
| `text-secondary` | `#B5BEB7` | Supporting copy |
| `text-muted` | `#758077` | Metadata and tertiary context |
| `line` | `#203126` | Quiet editorial rules |
| `line-strong` | `#2D4632` | Technical surfaces and stronger structure |
| `line-hover` | `#456440` | Interactive panel border state |
| `signal-green` | `#A6FF1A` | Signal, live state, selected emphasis, primary CTA |
| `signal-green-ink` | `#071005` | Text on acid-green fill |
| `ghost-green` | `#122117` | Large subordinate background type |

The canonical `bg` token also supplies `theme-color: #050706` on Homepage, Work, and generated Project Detail pages.

## Acid green rule

`#A6FF1A` is a **signal color**, not the default brand paint.

Use it for:

- live/active state;
- selected status;
- section number;
- one important phrase inside a display lockup;
- primary action;
- arrows or signal markers;
- meaningful technical state;
- restrained link emphasis;
- small moments of system feedback.

Do not automatically make these green:

- every heading;
- every border;
- every tag;
- all metadata;
- all links;
- large background fields;
- every hover state.

A page should still read as near-black / off-white when mentally removing the green.

## White rule

Avoid pure `#FFFFFF` for large surfaces. Primary text uses `#EDF1EC`.

Pure white should not become a major page field.

---

# 4. Ambient field system

Ambient light is now a global part of the site.

It must behave as one shared atmosphere rather than separate section effects.

## Principle

Use:

- broad radial fields;
- very low alpha;
- green or gray-green bias;
- large soft falloff;
- changing light position between chapters.

Do not use:

- bright neon blobs;
- green halo around every card;
- glow as button decoration;
- multiple competing light sources inside a small area;
- animated pulsing light without a specific reason.

## Approved intensity range

Typical values:

```css
--glow-signal: rgba(166,255,26,.024);
--glow-soft: rgba(92,128,88,.026);
--glow-faint: rgba(166,255,26,.012);
```

The Hero may be somewhat more atmospheric than later sections.

Down-page sections should become quieter.

## Section variation

The light source may move between:

- upper right;
- lower left;
- upper left;
- lower right.

This movement creates editorial chapter rhythm.

Do not change the color language from section to section.

---

# 5. Typography

The site uses three type families with distinct responsibilities.

## Bricolage Grotesque — display

Use for:

- Hero name;
- Cover Story title;
- Selected Systems project names;
- Work Index heading;
- NOW heading;
- Contact statement;
- Project Detail display titles.

Recommended variable settings:

```css
font-variation-settings: "wdth" 94, "opsz" 48;
```

Characteristics:

- tight leading;
- negative tracking at large sizes;
- magazine-scale typography;
- controlled asymmetry;
- no generic centered SaaS hero treatment.

## Instrument Sans — body

Use for:

- summaries;
- descriptions;
- explanatory text;
- longer project copy;
- supporting statements.

Body text should remain readable and relatively neutral so the display type can carry personality.

## IBM Plex Mono — metadata

Use for:

- section numbers;
- labels;
- years;
- status;
- technical state;
- terminal/readout text;
- nav labels;
- issue-like metadata;
- project class;
- technical CTA labels.

Do not use monospace everywhere.

## Type hierarchy principles

Large display type may be expressive, but not every section should compete with the Hero.

Hierarchy should generally descend:

**Hero → major project/editorial title → section title → card/project title → body → metadata**

The Cover Story title was intentionally reduced during the approved V3 pass so it behaves as a feature story rather than a second Hero.

### Homepage validated examples

Homepage identity: `720 clamp(62px, 8vw, 126px)/.92`, tracking `-.05em`, width `92` / optical size `56`; mobile `clamp(58px, 17vw, 82px)` retains `.92` / `-.05em`.

- Cover Story display: weight `710`, `clamp(62px, 7.1vw, 104px)`, `.94` line-height, `-.045em` tracking (`clamp(48px, 11.2vw, 72px)` on mobile)
- Cover Story summary: weight `430`, `clamp(17px, 1.6vw, 21px)/1.42`, tracking `-.022em`; mobile `16px/1.45`
- Section labels: `10px` desktop / `9px` mobile, mono, tracked uppercase
- Homepage identity uses `.92` leading and `-.05em` tracking; expressive tracking must remain role-specific and legible
- Supporting editorial summaries typically sit between `14px` and `21px`

These are reference values, not a mandate to reuse one size everywhere.

## Accepted Work readability values

Work Hero: `720 clamp(88px, 13.2vw, 182px)/.90`, tracking `-.05em`, width `92` / optical size `56`; mobile size `clamp(74px, 22vw, 130px)`. Work card titles retain `650 clamp(25px, 1.9vw, 31px)/.94`, tracking `-.04em`; metadata uses `9px/1.45`, summaries `13px/1.5`, and card actions `9px` mono with a `44px` mobile hit height. These accepted values preserve the Work hierarchy and should not be replaced with the earlier `.79` / `-.085em` Hero example.

Homepage technical labels (Cover tags, timeline labels, provider headers, command chips, system flow and supporting implementation labels) use at least `9px` where meaningful. The ticker is decorative repetition and may retain `8px` desktop / `7px` mobile; three identical groups translate one group per cycle to maintain viewport coverage.

## Readability guardrails

Editorial typography must never cause glyph collisions or make words appear merged. Long project names need looser treatment than short display words; do not preserve an oversized font by compressing tracking past comfortable readability.

- Project Hero titles should generally use line-height around `.90` or more when the title needs it. Tracking should not normally be tighter than `-.055em`.
- Resolve long titles first with deliberate canonical `titleLines`, a lower maximum font size, slightly wider font width, looser tracking, and an appropriate layout width. Do not depend on `overflow-wrap: anywhere` to split project names internally.
- Project Detail section headings should normally use tracking no tighter than approximately `-.045em` and line-height around `1.0` or more when needed.
- Meaningful UI and metadata copy should normally be at least approximately `9px`. Reserve `8px` for genuinely secondary, non-critical, decorative, or supporting information.
- Use `--text-secondary` as the normal floor for supporting and body copy; reserve `--text-muted` for tertiary metadata.
- Do not compound muted text with unnecessary opacity.
- Make readability corrections by text role. Do not globally brighten the site or flatten the primary, secondary, and metadata hierarchy.
- Shared navigation and control labels must remain legible at mobile sizes.
- On mobile, preserve usable line lengths and readable stacking as well as zero horizontal overflow.
- Do not mechanically change already-approved Homepage typography just to apply these guardrails.
- Test generator/template typography with short, medium, and long real project titles. No overflow alone is not evidence of readability; rendered browser inspection is required for final acceptance.

---

# 6. Layout and page geometry

## Viewport canvas, editorial field, and readable widths

The atmospheric canvas and section backgrounds fill the complete viewport. Never cap `body`: doing so truncates the ambient field and creates inert side rails on 1920px and 2560px displays.

The centered editorial composition field grows modestly beyond the accepted 1440px composition and stops at **1560px** of usable content. Shared dynamic gutters provide the constraint without duplicate wrappers:

```css
--editorial-width: 1560px;
--page-edge: max(clamp(20px, 3.35vw, 48px), calc((100% - var(--editorial-width)) / 2));
--hero-edge: max(clamp(24px, 4.6vw, 72px), calc((100% - var(--editorial-width)) / 2));
```

At ordinary widths, the accepted local gutters remain: up to 48px for chapters, with the Hero retaining its own composition inset. At ultra-wide widths the outer gutters grow instead of stretching cards and text across the viewport. Shared navigation remains viewport-centered; Contact actions align to the editorial field on wider displays.

Readable copy has its own narrower measure inside that field: Project reading copy remains capped at 760px; introductions and supporting summaries retain their existing limits. A wider atmospheric canvas does not authorize longer text lines.

## Responsive breakpoints

Primary visual breakpoints:

- `1000px` — tablet / reduced desktop composition
- `760px` — mobile reflow
- `680px` — compact Project Detail behavior where needed

Do not create unnecessary breakpoint fragmentation.

## Grid philosophy

Desktop may use:

- asymmetry;
- staggered secondary cards;
- unequal columns;
- large title blocks beside smaller metadata;
- deliberate offset edges.

Mobile should prioritize:

- readable stacking;
- full-width text flow;
- reduced visual background type;
- no horizontal overflow;
- no interaction that depends on pointer hover.

---

# 7. Spacing and editorial rhythm

Whitespace is not decorative emptiness. It establishes chapter rhythm.

Use a restrained spacing vocabulary based around:

`4 / 8 / 12 / 16 / 20 / 24 / 28 / 36 / 48 / 58 / 66px`

## Section rhythm

Homepage sections should not all use identical vertical padding.

Approved production spacing includes approximately:

- Desktop above 1000px: Cover `25px / 48px`, Systems `46px / 58px`, Work Index and NOW `46px / 52px` top/bottom padding; Homepage Contact `60px` top.
- Tablet and mobile retain their accepted responsive spacing.
- Hero remains viewport-height. Work Index is content-driven and has no forced `100vh` minimum.

The important rule is not the exact number. The rule is:

> A major chapter should feel deliberate, but the page should never look like isolated 100vh slides stacked together.

## Hero → Cover Story transition

The transition must be relatively tight.

Do not restore the earlier large dead zone between the full-screen Hero and Cover Story.

The ticker / lower Hero boundary should visually hand off into Cover Story.

Cover opens as a compact editorial chapter rather than a second viewport-height slide. Systems, Work Index, and NOW use content-led desktop spacing; the Work Index has no forced `100vh` minimum. Keep these chapters continuous without compressing their content.

---

# 8. Editorial rules and section separation

The site uses **rules, not boxes**.

## Section-level separation

Major Homepage chapter transitions use one restrained 1px deep-green rule, `--chapter-rule: rgba(32,49,38,.88)`. Systems, Work Index, NOW, and Contact own the incoming boundary. The ticker/lower Hero treatment owns Hero → Cover; Cover receives no additional top border. Avoid doubled rules and obsolete one-off bottom shadows.

Section-label rules remain a separate editorial device. Background and ambient shifts, typography, and whitespace still create chapter rhythm. Never substitute strong white or bright-green full-width borders for the subtle chapter rule.

## Section labels

The section-label pattern is a signature editorial component.

Example:

```text
01  COVER STORY ─────────────────────────
02  SELECTED SYSTEMS ────────────────────
03  PROJECT INDEX ───────────────────────
```

Rules:

- IBM Plex Mono;
- uppercase;
- section number in signal green;
- white/off-white label;
- thin deep-green rule;
- small scale;
- never compete with the section title.

---

# 9. Shape language

The previous 0px-only rule is obsolete.

The current approved system intentionally combines **flat editorial geometry** with **rounded technical surfaces**.

## Radius roles

### `0px`

Use for:

- editorial tables;
- structural rules;
- flat information rows;
- text-led layout;
- elements that should feel printed rather than card-like.

### `7–10px`

Use for:

- compact technical controls;
- small command surfaces;
- small nested panels.

### `12px`

Use for:

- focused control containers;
- compact CTA;
- important technical sub-surface.

### `16px`

Use for:

- system cards;
- NOW cards;
- meaningful grouped technical panels.

## Avoid

- giant 28–40px lifestyle-card radii;
- pill-shaped content cards;
- rounded every-container syndrome;
- radius used merely to make a layout feel “modern SaaS”.

Rounded surfaces should signal a self-contained system object.

---

# 10. Depth and surfaces

The site should remain mostly flat.

## Elevation hierarchy

### Level 0 — editorial field

- no border required;
- no shadow;
- typography carries the hierarchy.

### Level 1 — quiet rule

- `1px` `line`;
- section label;
- table row;
- internal metadata separation.

### Level 2 — technical surface

- `panel`;
- `1px line-strong`;
- `10–16px` radius;
- no drop shadow.

### Level 3 — interaction

- border moves toward `line-hover`;
- text or signal marker may move toward green;
- slight transform only when approved.

### Level 4 — signal

- acid green fill or strong acid-green state;
- reserved for primary action or meaningful status.

## Shadows

Generic drop shadows are not part of the core system.

Do not simulate elevation with Material-style shadow stacks.

Depth comes from:

- surface contrast;
- ambient field;
- foreground/background relationship;
- motion;
- real UI previews;
- typography overlap.

---

# 11. Glass treatment

Glass is now an **approved exception**.

The earlier blanket prohibition on glassmorphism no longer applies.

However:

> Glass is a special navigation treatment, not a reusable card style.

## Approved use

- shared floating logo and navigation across Homepage, Work Directory, and Project Detail;
- restrained blur/translucency;
- subdued dark green-gray fill and border from one hue family, with border alpha no greater than fill alpha;
- no exaggerated glossy highlight;
- no bright frosted-white surface.

## Do not use glass for

- project cards;
- Work Directory rows;
- NOW cards;
- Project Detail content sections;
- every floating label;
- technical panels.

Glass is a special site-chrome treatment, not a general card or surface style. Keep it limited to the shared floating logo and navigation implementation described below.

---

# 12. Shared floating navigation and logo

The floating navigation and logo are shared site components across:

- Homepage
- Work Directory
- Project Detail

They must not be reimplemented independently per page.

## Logo

The identity mark remains fixed in the upper-left viewport area.

It floats above the page and does not scroll with content.

Its position, scale, blur treatment, and responsive behavior should match the approved Homepage implementation.

The circular logo container uses the same low-prominence dark green-gray glass treatment as navigation, with a same-hue border no stronger than its fill and no pale independent outline.

The decorative identity mark uses its verified intrinsic `233 × 116` dimensions in shared markup; CSS continues to set its visible size.

## Glass navigation

The glass navigation remains fixed near the top center of the viewport.

The shared navigation labels and destinations are:

- Homepage: `HOME` → `#top`, `WORK` → `/work/`, `CONTACT` → `#contact`.
- Work Directory: `HOME` → Homepage, `WORK` → the current Work Directory, `CONTACT` → the local `#contact`.
- Project Detail: `HOME` → Homepage, `WORK` → `/work/` as the current section, `CONTACT` → the local `#contact`.

Mark `HOME` as the current page on Homepage and `WORK` as the current page on Work Directory. On Project Detail, `WORK` is marked `aria-current="location"`; Homepage HOME and Work Directory WORK use `aria-current="page"`. The shared selector `.nav a[aria-current]` covers both states, before the green hover/focus rule.

Accepted production glass values: navigation fill `rgba(72,82,75,.16)` and border `rgba(72,82,75,.11)`; logo fill `rgba(72,82,75,.11)` and border `rgba(72,82,75,.08)`. Navigation uses `11px` mono labels and `44px` minimum hit height; mobile labels are `10px` (`9px` at `380px` and below). Mobile navigation reserves space for the fixed logo using `calc(100% - 108px)` with a `205px` minimum width.

Approved characteristics:

- compact width relative to viewport;
- low-prominence, translucent dark green-gray surface and a same-hue border no stronger than the fill;
- restrained backdrop blur;
- 18px-class radius;
- tracked IBM Plex Mono navigation labels;
- no stronger shadow or bright independent outline;
- no extra decorative glass layers.

The floating logo, glass navigation, and progress indicator use one reusable production implementation across all three page types. Homepage defines the canonical progress behavior; Work and Project Detail reuse it.

## Scroll progress

The Homepage production implementation is the canonical progress implementation.

Every page that uses the glass navigation must reuse the same component and progress behavior.

Requirements:

- page top: progress is fully absent;
- scrolling: progress grows smoothly;
- page bottom: progress reaches completion;
- scrolling back to top: progress fully disappears;
- no residual segment may remain at 0%;
- progress follows total document scroll, not section-local scroll.

Do not recreate this behavior separately for Work or Project Detail.

## Page state

Only navigation labels/current-page state may vary by page.

The glass shell, logo positioning, and progress behavior remain shared.

---

# 13. Hero — Homepage-specific

The Homepage Hero is a signature composition and should not be generalized into every page.

## Primary role

The Hero introduces:

- identity;
- personal magazine framing;
- atmosphere;
- a single strong typographic moment;
- entry into the work.

It is not a product marketing hero.

## Approved characteristics

- large Bricolage typography;
- low-contrast `ADRIAN` ghost type;
- controlled green emphasis;
- floating glass navigation;
- continuous ticker;
- scroll-progress line;
- subtle pointer-reactive ghost behavior;
- broad ambient background field.

## Ticker

The ticker loops seamlessly while running and exposes an accessible `PAUSE` / `RESUME` control. An explicit pause persists for the current tab session; reduced motion keeps the ticker static and remains authoritative.

Do not allow the content to visibly disappear before the repeated sequence arrives.

## Ghost motion

Ghost typography may react to pointer or scroll.

It must remain:

- low contrast;
- slow;
- subordinate;
- non-blocking;
- disabled/reduced appropriately under reduced-motion preference.

---

# 14. Cover Story — Homepage-specific

Cover Story behaves like the opening feature of a technology magazine.

It should not become:

- a SaaS feature section;
- a giant equal card;
- a decorative artwork panel with little information.

## Hierarchy

1. section label;
2. project title;
3. project summary;
4. metadata / action;
5. technical story / signal flow;
6. supporting details.

The title is intentionally smaller than the first experimental composition.

Accepted production Cover Story display reference:

```css
font-size: clamp(62px, 7.1vw, 104px);
line-height: .94;
letter-spacing: -.045em;
```

Approved summary reference:

```css
max-width: 420px;
font-size: clamp(17px, 1.6vw, 21px);
line-height: 1.42;
```

The project summary must not visually compete with the title.

Technical metadata remains quiet.

---

# 15. Selected Systems — Homepage-specific

Selected Systems is not an equal-card project grid.

The section should communicate hierarchy between systems.

## Approved composition language

- one primary system;
- two secondary systems;
- secondary cards may stagger and intentionally misalign at the right edge;
- gap between cards is visible and deliberate;
- meaningful technical content may live inside bordered panels;
- 16px major card radius is approved;
- hover/reveal motion is restrained.

## Card behavior

Cards may use:

```css
background: #0B100D;
border: 1px solid #2D4632;
border-radius: 16px;
box-shadow: none;
```

Hover may strengthen the border toward `#456440`.

Do not add floaty shadow lift.

---

# 16. Work Index — Homepage-specific

The Homepage Work Index is a signature editorial ledger.

It is not a ranking and not a card grid.

## Hierarchy

- project name strongest;
- number/status secondary;
- class/year metadata;
- arrow/action as signal.

Rows remain flat.

Use:

- thin row rules;
- no card radius;
- no shadow;
- restrained hover;
- peer dimming may be used on pointer-capable devices.

The table is one of the clearest expressions of the “personal technology magazine” concept.

The Work Index remains content-driven at desktop widths. Do not add a forced `100vh` minimum that turns it into a presentation slide.

---

# 17. NOW — Homepage-specific

NOW is concise.

It communicates current direction rather than an exhaustive skills list.

## Approved structure

- section label;
- strong “WHAT’S ACTIVE.” title;
- two equal-size content containers;
- BUILDING / EXPLORING structure;
- 16px technical-panel radius;
- restrained green signal.

Do not turn NOW into:

- a badge cloud;
- technology-logo wall;
- résumé timeline;
- AI keyword list.

---

# 18. Contact — Homepage-specific

Contact is the closing magazine chapter.

Keep:

- “Get in touch.”
- acid-green emphasis on `touch.`;
- compact copy;
- strong but simple `SEND A SIGNAL` action.

The CTA may use solid acid green with dark ink.

It should not become a soft pill-shaped SaaS button.

LinkedIn is not part of the approved Homepage footer treatment unless explicitly restored later.

---

# 19. Motion system

Motion creates continuity and depth.

It should never become a showreel.

## Approved motion families

### Reveal

- small vertical travel;
- opacity transition;
- restrained stagger;
- cubic-bezier similar to `.22,1,.36,1`.

### Hover

- subtle border emphasis;
- small positional change only where useful;
- no bouncy springs;
- no exaggerated scale.

### Continuous motion

Only use when conceptually justified.

Examples:

- seamless Hero ticker;
- scroll progress;
- very subtle ghost-type response.

Continuous decorative motion must provide an accessible user pause/resume control unless reduced-motion preferences already disable it. The Homepage ticker keeps its seamless loop while running, and an explicit pause persists for the current tab session. `prefers-reduced-motion: reduce` keeps it static and takes precedence over the control.

## Avoid

- bounce;
- large zoom;
- heavy glitch;
- constant card floating;
- spinning decorative UI;
- animation on every label;
- repeated green pulse.

## Reduced motion

Always support:

```css
@media (prefers-reduced-motion: reduce)
```

Disable or greatly shorten non-essential transitions and remove pointer/scroll spectacle.

---

# 20. Responsive behavior

Responsive design should preserve hierarchy, not reproduce desktop geometry at smaller scale.

## Desktop

May use:

- editorial asymmetry;
- staggered cards;
- large display typography;
- floating navigation;
- pointer-reactive effects;
- multi-column metadata.

## Tablet

Reduce:

- horizontal spacing;
- extreme offsets;
- oversized type;
- non-essential background type.

Preserve the section hierarchy.

## Mobile

Priorities:

1. readability;
2. no horizontal overflow;
3. clear project sequence;
4. adequate touch targets;
5. reduced ambient complexity;
6. no hover-dependent comprehension.

Mobile should not merely stack every desktop card without reconsidering spacing.

---

# 21. Work Directory — approved archetype

The `/work/` page is an **editorial card index of project articles**.

It is no longer defined as a ledger-only page.

The approved direction is the frozen **Technical Publication Index** card system.

## Purpose

The page presents the complete public body of work while encouraging visitors to enter each project article.

It should feel like:

- a technical publication index;
- a set of compact project files;
- a magazine directory authored by one person.

It should not feel like:

- a SaaS feature grid;
- a marketplace;
- a dashboard;
- a generic portfolio card wall.

## Shared top chrome

Use the shared floating logo and glass navigation component.

Do not create a Work-specific version of the progress indicator.

## Work Hero

Keep the Work intro editorial and relatively simple:

- large `WORK` display title;
- small mono chapter label;
- short directory description;
- project count / publication metadata.

Do not add a hero card or decorative project graphic.

## Project cards

Desktop may display approximately four compact cards per row when space allows.

The layout may reflow responsively; do not force four columns at the expense of readable card proportions.

### Approved card character

Cards are:

- typography-first;
- compact but not dense;
- 16px rounded technical surfaces;
- bordered with `line-strong`;
- shadowless;
- free of decorative diagrams, dots, signal lines, or abstract graphics.

Each card contains:

- project number;
- project type;
- project status;
- project title;
- concise summary;
- text CTA.

The year is not required on the card.

### Card spacing

Use the accepted production card spacing: `300px` minimum card height, `16px` padding, `30px` title-block offset, and `14px` summary gap. Preserve the generous editorial rhythm.

Cards need deliberate breathing room around:

- metadata;
- title;
- summary;
- CTA.

Do not use fixed excessive height merely to force equal rows.

Do not compress the card until it resembles a dashboard tile.

### Card hierarchy

Priority:

1. project title;
2. project summary;
3. project type / status;
4. project number;
5. CTA.

Metadata should be readable but subordinate.

Project type/status should use slightly larger mono text than the earliest prototype for legibility.

## CTA

The approved Work card CTA is **text-only acid-green emphasis**.

Use:

- `READ ARTICLE ↗`;
- acid-green text;
- no solid acid-green fill;
- no rounded filled button;
- small horizontal motion or subtle brightness change on hover.

The CTA must remain visible without competing with the project title.

## Interaction

Cards may:

- slightly translate upward on hover;
- strengthen border color;
- subtly change background field.

Avoid:

- large scale;
- shadow lift;
- glow;
- bounce;
- decorative animated graphics.

## Bottom Contact

The Work Directory ends with the shared Homepage `Get in touch.` Contact section.

Reuse the approved Contact composition and interaction.

LinkedIn remains omitted unless explicitly restored later.

---

# 22. Project Detail — approved archetype

Project Detail pages are **technical magazine articles**.

They share one coherent layout system generated from canonical project data.

Do not design every project as a unique microsite.

## Shared top chrome

Project Detail uses the same floating logo and glass navigation as Homepage and Work.

The scroll-progress implementation must reuse the canonical Homepage component.

## Project Hero

The Hero is intentionally **card-free**.

Do not place:

- topology cards;
- system cards;
- screenshots inside framed hero cards;
- decorative technical panels.

The Hero should contain only the project article entry information.

### Approved Hero hierarchy

1. project / article chapter label;
2. large project title;
3. project type;
4. project status;
5. project summary;
6. project actions.

The year is not displayed in the approved Hero.

### Hero actions

Project actions such as `LIVE DEMO` and `SOURCE` may use larger text-link CTAs than Work-card actions.

They remain primarily typographic. Production Project actions use `9px` IBM Plex Mono with a `44px` minimum hit height.

The accepted Project Hero uses `720 clamp(64px, 7.6vw, 118px)/.92`, tracking `-.045em`, and Bricolage width `96` / optical size `64`. At widths up to `900px`, the title uses `clamp(58px, 8.5vw, 90px)`; up to `680px`, `clamp(38px, 12.4vw, 64px)/.94`. Canonical title rows remain separate block spans; words are not split internally.

Project section headings use `650 clamp(34px, 4vw, 52px)/1`, tracking `-.045em`, width `94` / optical size `48`. Up to `760px`, line-height is `1.08` and tracking `-.035em`. Hero summaries use `clamp(18px, 1.65vw, 22px)/1.48`, with `18px` mobile text.

Avoid oversized acid-green filled buttons unless a future project explicitly requires one.

## Article rhythm

Project pages alternate between:

- editorial copy;
- structured technical modules;
- small rounded technical surfaces;
- restrained field/background changes.

Do not wrap every section in a card.

Text-led article sections remain mostly flat.

## Section labels

Use the shared mono chapter-label language.

Project sections may use numbered labels such as:

- `01 PROJECT OVERVIEW`
- `02 CONTENT PIPELINE`
- `03 IMPLEMENTATION`
- `04 VIEWER WORKFLOW`
- `05 RECEIVER CONTROLS`

Numbers remain signal green.

## Overview

The Overview is primarily editorial copy.

A small side technical note/card may appear when it improves scanning.

Do not convert the entire overview into a two-card layout.

## Content Pipeline / Topology

Use a topology diagram only when the project has a meaningful technical stack, data pipeline, process graph, or system sequence.

Do not invent topology for projects that do not need it.

### Approved topology treatment

The topology lives inside the relevant technical section, not the Hero.

Each stage is a **small technical card**:

- `12px` radius;
- `1px line-strong` border;
- `panel` background;
- compact mono kicker;
- readable stage title;
- quiet supporting metadata.

Stages are connected by acid-green or muted directional arrows.

The topology container itself has **no full-width top or bottom border**.

Do not add a surrounding mega-card around the whole topology.

Desktop may use a horizontal sequence.

Mobile stacks the stages vertically and removes connector arrows when necessary.

## Technical copy

Implementation sections support longer explanatory text.

A small supporting note panel may summarize:

- deployment;
- state;
- dependencies;
- constraints;
- non-goals.

The surrounding article remains flat.

## Workflow

Workflow steps may use small rounded technical cards.

Use:

- numbered signal-green index;
- concise display heading;
- short explanatory paragraph.

Keep the number of cards driven by actual project content.

## Output / controls

Compact output or control modules may use smaller technical surfaces.

They should be factual, not decorative.

When many items exist, responsive wrapping or column reduction is preferred over shrinking text excessively.

## Images and interactive modules

Real project evidence remains preferred.

Use:

- actual interfaces;
- real screenshots;
- interactive embeds;
- real system output.

Image/interactive treatment should follow the same surface and border language.

Supported Project Detail image modules require verified positive integer intrinsic `width` and `height`; the shared renderer emits those dimensions with lazy loading and asynchronous decoding.

Do not invent decorative imagery to fill space.

The reusable `report-table` module presents structured public output as a native editorial table. Use a dark field, thin deep-green rules, mono column headings, off-white values, and restrained green emphasis for meaningful status cells. Keep the table horizontally scrollable when its minimum readable width exceeds the viewport, and provide its accessible label and explanatory note/caption in canonical data. Mark illustrative samples clearly; never imply that sample values are live.

## Optional article grammar V2

Fixed grammar, variable composition: modules are approved forms of expression, not a mandatory sequence. `decision` and `verification` are optional; use them only when semantically justified. Evidence is an editorial quality rule, not a mandatory visual section.

### Decision

An engineering fork / choice relationship belongs within the existing technical-magazine article. Reuse the normal section head, chapter labels, typography, dark field and article rhythm. Show chosen and avoided paths with restrained signal green on the CHOSEN label and connector; the avoided path is quieter. Place editorial reason below, with an optional constraint using a restrained rule. Keep the relationship flat, without dashboard cards, matrices or scoring. Desktop presents the paths around a relationship connector; compact/mobile stacks them with a small downward connector. Long text wraps safely.

### Verification

A reviewed-state checkpoint presents factual readouts, not a scorecard, analytics dashboard, KPI cards or badge wall. Reuse the section head, thin `line-strong` top boundary, one static restrained green checkpoint marker, quiet mono metadata, readable factual values and subtle dividers. Use approximately three columns where desktop width allows and one column on compact/mobile. Green remains a restrained signal, never a data-controlled quality/status color. The marker is a shared renderer/CSS treatment; module content does not select its appearance or add provenance fields.

## Bottom Contact

Every Project Detail page ends with the shared Homepage `Get in touch.` Contact section.

This provides a consistent closing chapter across the site.

## Generator contract

Project Detail remains generated from canonical project data.

Shared implementation lives in:

- the Project Detail template;
- shared Project Detail CSS;
- canonical project definitions.

Do not manually maintain divergent individual project-page HTML in production.

The frozen Project Page HTML is a visual reference, not a replacement for the generator.

When a source repository changes, use [`docs/PROJECT-STORY-REFRESH.md`](docs/PROJECT-STORY-REFRESH.md) for `Refresh Project Story for <project>` or `Audit all Project Stories against their source repositories`. Inspect evidence from the canonical repository URL, classify material public changes, update canonical story data only when claims are stale, regenerate, and run the listed QA. This is a review-assisted workflow; repository changes never trigger an automatic website rewrite or publication.

---

# 23. AI positioning

AI may appear in project content where relevant.

AI is not the identity of the site.

Do not repeatedly describe the person as:

- AI Engineer;
- AI Developer;
- AI Builder;
- LLM Expert.

Prefer concrete descriptions when relevant:

- agentic workflows;
- developer tools;
- local AI;
- automation systems;
- human-in-the-loop systems;
- agent products.

The Hero does not need AI positioning.

---

# 24. Real project visuals

Prefer real visual evidence:

- actual interface;
- terminal state;
- product UI;
- visualization;
- system output;
- meaningful screenshots;
- real interactive demo.

Do not use generic decorative project art when a meaningful project artifact exists.

Do not capture a weak screenshot solely to fill space.

---

# 25. Do / Don't

## Do

- treat typography as the main visual system;
- preserve controlled asymmetry;
- use green as a signal;
- use section-label rules as editorial chapter markers;
- use ambient fields softly;
- use rounded panels only for system objects;
- keep Work Index and ledgers flat;
- allow selected technical surfaces to be bordered and rounded;
- preserve real project information;
- make page hierarchy obvious before adding effects;
- keep the visual identity personal.

## Don't

- turn the site into a card grid;
- turn every section into a separate 100vh slide;
- use strong full-width border after every section;
- put glass on every surface;
- use 16px radius on every object;
- add generic drop shadows;
- make all labels green;
- create cyberpunk fake-terminal decoration;
- use fake code as texture;
- add Matrix-style effects;
- use excessive gradients;
- over-animate;
- center everything;
- make Work pages look like SaaS feature pages;
- make Project Detail pages look like generic agency case studies;
- solve hierarchy problems by adding more UI chrome.

---

# 26. Accessibility and interaction

## Focus

Interactive controls must have visible keyboard focus.

Signal green is acceptable for focus emphasis when contrast remains sufficient.

## Touch

Mobile interactive targets should be comfortably tappable.

Do not preserve tiny desktop interaction targets on mobile.

Shared site links and buttons use `touch-action: manipulation`; keep this limited to tap controls and preserve the browser's native tap highlight.

## Motion

Respect `prefers-reduced-motion`.

## Contrast

Muted metadata can be visually quiet, but essential information must remain readable against the dark field.

Do not reduce opacity so far that hierarchy becomes inaccessible.

---

# 27. Agent implementation guide

## Primary instruction

When implementing a page:

> Make it feel like another chapter of the same personal technology magazine, not another website using the same green color.

## Before adding a component, ask

1. Is this information editorial text, technical state, or an interactive object?
2. Does it need a container?
3. If it needs a container, is it a flat editorial structure or a rounded technical surface?
4. Is acid green communicating a real signal?
5. Does the visual element improve comprehension or only add decoration?
6. Does the page still feel authored by one person?

## Container decision

### Use no container when

- typography can establish hierarchy;
- content belongs to an editorial flow;
- a table row or rule is sufficient.

### Use a bordered technical surface when

- multiple controls/states belong together;
- the content represents a system object;
- a real interface or readout needs containment.

### Use glass only when

- the component is navigation;
- the visual treatment has been explicitly approved.

---

# 28. Codex implementation rules

When this design system is handed to Codex:

1. Preserve existing content and data architecture unless the approved design requires a structural change.
2. Do not replace generated Project Detail pages with manually maintained duplicates.
3. Prefer shared CSS tokens and reusable structural styles over one-off per-page values.
4. Do not copy prototype wrapper classes into production unless they genuinely belong in the production architecture.
5. Preserve section-specific approved interactions from the Frozen references.
6. Preserve accessibility, semantic HTML, SEO metadata, and generator behavior.
7. Follow the approved Homepage, Work Directory, and Project Detail archetypes; do not invent a new page language.
8. Validate desktop and mobile.
9. Support reduced motion.
10. Treat the approved visual references as visual truth and this document as the global design-system truth.

---

# 29. v1.0 implementation checkpoint

The design system is visually frozen at v1.0 for the current site architecture.

Approved page archetypes:

- Homepage
- Work Directory
- Project Detail

Future revisions should increment the document only when a new page type, new shared component, or deliberate art-direction change is approved.

Implementation is not considered complete until:

- shared floating nav/logo is reused across all page types;
- Homepage progress behavior is used as the canonical implementation;
- Work Directory matches the frozen Technical Publication Index reference;
- Project Detail generator matches the frozen article archetype;
- Contact is shared consistently;
- desktop and mobile are visually reviewed;
- reduced-motion behavior is retained;
- content, SEO, accessibility, and generation workflows remain intact.

---

# 30. Final design test

For every page and component, ask:

> Does this feel like a page from the same personal technology magazine?

Then ask:

> Is the design expressing information, hierarchy, navigation, atmosphere, or project understanding?

If the answer to the second question is no, remove the element.

Default to restraint.
