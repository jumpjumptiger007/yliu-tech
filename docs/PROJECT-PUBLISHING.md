# Project Publishing — CREATE

CREATE publishes a completely new Project Story. A new project must not begin with immediate website mutation. Work from a verified source repository and the existing [article grammar](PROJECT-DETAILS.md), with [DESIGN.md](../DESIGN.md) governing visuals. Existing stories use [AUDIT / REFRESH](PROJECT-STORY-REFRESH.md).

## Source review and planning

The sequence is source repository → repository audit → product understanding → Project Story Plan → module selection → evidence selection → Visual Acceptance only if genuinely new visual grammar is required → user approval before repository mutation → canonical implementation → generation → QA → review → record reviewed source commit.

Verify the exact source repository; never guess it from a project name. Resolve its default-branch HEAD to a full 40-character SHA and pin the review to that revision. Inspect implementation, relevant tests/configuration/workflows, releases and documentation needed to understand purpose, behavior and constraints. README alone and commit messages alone are insufficient evidence. Distinguish released behavior from work in progress; disclose unavailable evidence rather than inventing claims. Do not expose credentials or private source material.

If the active portfolio planning environment cannot access the canonical external source repository, stop source-dependent planning and request a verified **Source Audit Handoff**. Do not guess repository state, invent the source HEAD, infer architecture or capabilities from the repository name, or begin portfolio mutation.

The handoff must identify the canonical source repository and the exact full 40-character reviewed default-branch HEAD SHA. It must contain separately verified primary-source findings, with evidence references pinned to that revision, sufficient to support the Project Story Plan under the source review requirements above. Disclose evidence gaps; a handoff does not lower those requirements. Once a sufficient verified handoff is supplied, the planning agent may continue CREATE using it for external source facts while independently reading the current portfolio repository through its own connector. The complete Project Story Plan still requires user approval before portfolio mutation.

The first formal output is:

```text
PROJECT STORY PLAN

Project:
Source:
Purpose:

Proposed structure:
1. ...
2. ...

Evidence strategy:
- ...

Not included:
- module — reason

New visual grammar required:
YES / NO

Proposed homepage role:
...

Source revision reviewed:
<full SHA>
```

Module composition is an editorial choice: not every story uses every module, and the article sequence is not globally fixed. Choose evidence that clarifies the story rather than exposing every fact found in source. Document omitted modules and their reasons. Reuse approved grammar; seek Visual Acceptance only for genuinely new forms. Obtain user approval of the complete plan, including any required visual acceptance, before modifying repository files.

## Approved implementation and acceptance

Implement canonical project content and metadata in `data/projects.mjs`; use `data/site.mjs` for identity/canonical URL helpers. Preserve the manual Work directory and existing stories. Keep V5 embedded demos in `demos/<slug>/`; `projects/<slug>/` remains historical. Follow [SEO](SEO.md) for public routing and metadata. Generated `work/<slug>/index.html` files are never edited directly.

Generate with `node scripts/generate-site.mjs` (or a specific slug). Run `node scripts/check-seo.mjs`, `node scripts/check-html-structure.mjs`, syntax checks for changed JS/MJS and `git diff --check`. Inspect generated diffs, sitemap and robots. QA affected pages at desktop and compact/mobile widths, including 1440, 390 and 320; use 1920 for long/new layouts. Check hierarchy, wrapping, overflow, keyboard navigation, reduced motion, console/resource errors and actual embedded interactions. Check Homepage and Work wherever metadata changes appear.

Complete the active workflow's required review. Only then record `storySource: { lastReviewedCommit: "<full verified SHA>" }`, meaning the story has been reviewed through that source revision; validate again after recording it. No parallel provenance metadata is required. Report source revision, evidence, changed files, validation and anything unverified. This workflow does not itself authorize commits, pushes, merges, PRs, deployment or publication; those actions require separate authorization.
