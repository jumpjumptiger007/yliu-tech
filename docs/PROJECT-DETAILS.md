# Project Article Grammar V2 — authoring contract

`data/projects.mjs` is the canonical project definition source for both the homepage renderer and Project Detail generator. Homepage metadata stays in this file; a completed detail is represented by `detail: { status: "complete", modules: [...] }`.

Generate every completed detail page with:

```sh
node scripts/generate-site.mjs
```

Or generate one page by slug:

```sh
node scripts/generate-site.mjs job-search-agent
```

The renderer lives in `scripts/project-detail-template.mjs`. Generated pages are written to `work/<slug>/index.html`; do not edit those outputs directly. Keep legacy demos under `projects/<slug>/` and V5 embedded demos under `demos/<slug>/`.

## Fixed grammar, variable composition

**FIXED GRAMMAR, VARIABLE COMPOSITION.** Modules define approved forms of expression, not a mandatory sequence. Select and order modules according to the project's story. Do not standardize every story into the same six-section article. Both new modules are optional and require semantic justification.

| Module | Semantic role and canonical content |
| --- | --- |
| `overview` | What the project is and why it exists; narrative `paragraphs`, not a stack dump. |
| `signal` | High-level linear `stages`; stages need not be software components. |
| `system` | Components, sources, storage, services and architecture relationships in non-empty text `rows`; optional `caption`. Existing `variant: "readable-rows"` is supported. |
| `technical` | Meaningful mechanisms and constraints in `paragraphs`, not a generic technology list. |
| `workflow` | User/system behavioral sequence in `steps` with `title` and `text`; distinct from architecture. |
| `output` | Real capabilities or outputs in `items` with `title` and `text`; optional `caption`, no temporal sequence required. |
| `interactive` | Genuine embedded interaction; strongest direct evidence where appropriate. |
| `report-table` | Factual structured/table-like output. |
| `image` | Genuine editorial evidence; do not default to screenshots or create a screenshot gallery. |
| `decision` | An engineering choice, its alternative, rationale and optional constraint. |
| `verification` | Factual reviewed-state readouts, not quality ratings. |

Every module requires supported `type` and non-empty `label` and `title`. Copy lists, stages, rows, steps and items must be non-empty, with non-empty text values. All canonical text is escaped; arbitrary HTML is not supported. Keep renderer paths generic, with no project-specific conditionals.

## Evidence policy

Evidence is a semantic quality rule, not a mandatory new visual section.

- **Source Evidence:** internal review evidence from source code, tests, workflows, releases and documentation.
- **Story Evidence:** public factual information such as topology, workflow, runtime facts, implementation facts and outputs.
- **Direct Evidence:** something the visitor directly experiences, such as an embedded interaction or live app/demo.

A fact existing in source does not automatically belong in the public story. Expose evidence only when it improves understanding. Identify illustrative values explicitly; do not present them as live or verified project facts.

## Decision modules

```js
{
  type: "decision",
  label: "Engineering choice",
  title: "Keep submission under human control",
  chosen: "Assisted application",
  avoided: "Autonomous submission",
  reason: "The user reviews the application before submitting it.",
  constraint: "Submission remains a manual step."
}
```

Only `type`, `label`, `title`, `chosen`, `avoided`, `reason`, `constraint` are allowed. All except `constraint` are required non-empty strings; `constraint` must also be non-empty when present. The shared renderer uses a semantic section, fixed CHOSEN / NOT CHOSEN headings, a choice relationship, editorial reason and optional constraint. This is an engineering fork, not a comparison matrix, scoring model or dashboard.

## Verification modules

```js
{
  type: "verification",
  label: "Verification",
  title: "Reviewed implementation state",
  items: [
    { label: "Tests", value: "230 passed" },
    { label: "Build", value: "PASS" }
  ],
  caption: "Illustrative example values; not production project facts."
}
```

Only `type`, `label`, `title`, `items`, `caption` are allowed. `items` is a required non-empty array of objects containing only required non-empty strings `label` and `value`. `caption` is optional and must be non-empty when present. The renderer emits a semantic `dl` beneath a fixed reviewed-state checkpoint marker. The marker and restrained green are renderer/CSS treatments; they are not data-controlled statuses. Values are factual readouts, never claims like QUALITY: EXCELLENT, SECURITY: SAFE or PERFORMANCE: AMAZING.

Both new module schemas reject all unsupported properties, including `color`, `icon`, `severity`, `score`, `badge`, `green`, `progress`, `layout`, `variant`, `className`, `emphasis` and `status`. Do not add data-controlled visual fields, reviewed SHA/date fields or provenance objects inside either module. The only source cursor remains optional canonical `storySource: { lastReviewedCommit: "<full 40-character SHA>" }`: this story has been reviewed through that source revision. [CREATE](PROJECT-PUBLISHING.md) and [AUDIT / REFRESH](PROJECT-STORY-REFRESH.md) define when it can be recorded.

## Interactive modules

Use an `interactive` module for a local interactive artifact. It requires `type`, `label`, `title`, `src`, and `frameTitle`; `caption` and `runtimeProfile` are optional. `src` must be a site-root-relative local file that exists inside the repository. The default profile embeds the artifact in a lazy, script-only sandboxed iframe. Use this module when interaction materially supports the Project Detail without adding project-specific renderer logic.

`runtimeProfile` is a closed enum. Omit it for ordinary embeds. The reserved `trusted-media` profile is only for reviewed, same-origin local embeds that need microphone and clipboard-write capabilities. The renderer applies the exact policy `sandbox="allow-scripts allow-same-origin"` and `allow="microphone; clipboard-write"`; omitted profiles keep `sandbox="allow-scripts"` and receive no `allow` attribute. Do not use this profile as arbitrary iframe configuration or add permission attributes to project data. Clipboard writes must still come from a direct user action inside the embedded application.

## Image modules

Use an `image` module for a local editorial image. It requires `type`, `label`, `title`, `src`, `alt`, `width`, and `height`; `caption` is optional. `width` and `height` must be verified positive integer intrinsic pixel dimensions from the source asset. Do not estimate or guess them. The shared renderer emits the intrinsic dimensions with `loading="lazy"` and `decoding="async"`.

## Report tables

Use `report-table` for structured report/output evidence. Required fields are `type`, `label`, `title`, a non-empty string list `headers`, and a non-empty array `rows`. Every row must have exactly as many cells as headers. Optional `note` and `caption` are non-empty explanatory text; illustrative data must be explicitly identified as non-live in `note`.

Cells are non-empty strings or strict `{ text: "Low (1)", emphasis: true }` objects. Object cells require non-empty `text` and boolean `emphasis`; no other keys are supported. `emphasis: false` renders normal text. Emphasis marks meaningful status with semantic strong text and the shared signal color; it is not a styling configuration. All content is escaped, never interpreted as HTML.

The shared renderer emits a semantic table with column headers and a labelled, keyboard-focusable horizontal scroll region. CSS preserves readable columns on small screens. Keep this module factual and compact; do not use it as a general layout grid or add data-driven colors, classes, links, or HTML cells.
