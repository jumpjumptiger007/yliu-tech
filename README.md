# Portfolio V5

This repository (`jumpjumptiger007/yliu-tech`) contains the current Portfolio V5 implementation, publicly presented as Personal Tech Magazine: a static personal technical magazine for software, tools, systems, and experiments. The public project name is separate from the GitHub repository name.

## Repository structure

- `index.html` — homepage
- `work/index.html` — comprehensive public Work directory
- `css/styles.css` — homepage styles
- `css/work.css` — Work directory styles
- `js/projects.js` — homepage project rendering
- `js/work.js` — Work directory rendering
- `data/projects.mjs` — canonical project data
- `scripts/project-detail-template.mjs` — shared Project Detail renderer
- `scripts/generate-site.mjs` — Project Detail generator
- `work/<slug>/index.html` — generated Project Details
- `demos/<slug>/` — embedded V5 project interactions
- `projects/<slug>/` — legacy and historical project artifacts
- `docs/PROJECT-PUBLISHING.md` — CREATE workflow for new Project Stories
- `docs/PROJECT-DETAILS.md` — Project Article Grammar and authoring contract
- `docs/PROJECT-STORY-REFRESH.md` — read-only AUDIT and approved REFRESH workflow
- `DESIGN.md` — visual source of truth
- `assets/brand/yal-mark.svg` — production brand mark

## Project Details

The repository has 10 canonical projects and 10 generated Project Details. `/work/` is the comprehensive directory for all public projects, including prototypes and archived work; the homepage remains the editorial entry point. InterDemTV has a separate public Live Demo. Bulk Email Sender, QPSK Visualization, and Password Generator include embedded V5 interactions.

Generate all complete Project Details:

```sh
node scripts/generate-site.mjs
```

Generate one Project Detail:

```sh
node scripts/generate-site.mjs <slug>
```

Check balanced HTML structure across every generated Project Detail:

```sh
node scripts/check-html-structure.mjs
```

`work/index.html` is the manually authored directory page and reads the canonical data at runtime. Files under `work/<slug>/index.html` are generated Project Detail output. Update the canonical data or shared renderer, then regenerate; do not edit generated pages manually.

For a new Project Story, follow [CREATE](docs/PROJECT-PUBLISHING.md). For `Audit Project Story: <project>`, `Audit all Project Stories`, or `Refresh Project Story: <project>`, follow [AUDIT / REFRESH](docs/PROJECT-STORY-REFRESH.md). Audit changes no files; Refresh requires an approved plan. Both use the [authoring contract](docs/PROJECT-DETAILS.md).

## Hosting and contact

The site is static HTML, CSS, and JavaScript and is compatible with GitHub Pages. `CNAME` contains `yliu.tech`. The publishing source branch is not specified in this repository; verify the repository's Pages settings for the active source.

Contact: [contact@yliu.tech](mailto:contact@yliu.tech). V5 does not use a contact backend.
