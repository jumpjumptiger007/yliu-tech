# Repository Agent Instructions

## Project boundaries

- This repository contains Portfolio V5 / Personal Tech Magazine, a static site built with HTML, CSS, browser JavaScript, and Node.js ES modules.
- Use `README.md` for the repository map and hosting overview. Avoid copying its full structure or setup guidance here.
- Treat `DESIGN.md` as the visual source of truth. Preserve the documented editorial identity, responsive behavior, and reduced-motion support.
- Treat `data/projects.mjs` as the canonical source for project content and metadata. Treat `data/site.mjs` as the source for site identity and canonical URL helpers.
- `work/index.html` is the manually authored Work directory and reads project data at runtime. Do not replace it with generated output.
- Keep V5 embedded demos under `demos/<slug>/`. `projects/<slug>/` contains legacy or historical artifacts; preserve that role when adding project files.
- New Project Story (CREATE): follow `docs/PROJECT-PUBLISHING.md`, then `docs/PROJECT-DETAILS.md`.
- Audit or Refresh an existing Project Story: follow `docs/PROJECT-STORY-REFRESH.md`, then `docs/PROJECT-DETAILS.md`. Audit is always read-only and cannot advance the source cursor. CREATE and REFRESH mutation starts only after the required user-approved plan.
- Detailed workflow contracts live in those documents; visual rules live in `DESIGN.md`.
- For Project Detail authoring and SEO rules, follow `docs/PROJECT-DETAILS.md` and `docs/SEO.md`. Update those documents when changing their documented authoring contracts.

## Generated output and validation

- `work/<slug>/index.html` files are generated from canonical project data and the shared renderer. Do not edit these pages directly; change their source and regenerate them.
- `node scripts/generate-site.mjs` regenerates all complete Project Details. `node scripts/generate-site.mjs <slug>` regenerates one detail and refreshes `sitemap.xml` and `robots.txt`.
- Keep generated Project Details in sync with their sources. After changing `data/projects.mjs` fields used by Project Details or `scripts/project-detail-template.mjs`, regenerate the affected detail pages before considering the change complete; regenerate all details when a shared renderer change can affect every project.
- Review generated-file diffs after running the generator; it writes files into the repository.
- Run `node scripts/check-seo.mjs` after changes that affect project metadata, generated Project Details, SEO behavior, canonical URLs, sitemap/robots output, or public routes.
- The repository has no package manifest or test runner. Use the documented Node scripts rather than assuming package-manager test commands.
- The root `CNAME` identifies `yliu.tech`. The repository does not specify the active GitHub Pages publishing source; verify hosting configuration before relying on a deployment assumption.
