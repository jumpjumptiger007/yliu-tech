import { absoluteSiteUrl, canonicalProjectUrl, siteConfig } from "../data/site.mjs";
import { isIndexableProject, projectLiveUrl } from "../data/projects.mjs";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const siteAssetHref = (path) => `../../${path}`;

function renderActions(project) {
  const actions = [];
  if (project.liveUrl && project.detail?.actions?.liveDemo === true) {
    const external = /^https?:\/\//i.test(project.liveUrl);
    const href = external ? project.liveUrl : projectLiveUrl(project, { fromDetail: true });
    actions.push(`<a class="project-action" href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}><span>LIVE DEMO</span><span aria-hidden="true">↗</span></a>`);
  }
  if (project.githubUrl) actions.push(`<a class="project-action" href="${escapeHtml(project.githubUrl)}" target="_blank" rel="noopener noreferrer"><span>SOURCE</span><span aria-hidden="true">↗</span></a>`);
  return actions.length ? `<nav class="project-actions" aria-label="Project actions">${actions.join("")}</nav>` : "";
}

function renderSignal(project, module, index) {
  const headingId = `detail-signal-${project.slug}-${index}`;
  const stages = module.stages.map((stage, stageIndex) => `<li><span>${String(stageIndex + 1).padStart(2, "0")}</span><strong>${escapeHtml(stage)}</strong></li>`).join("");
  return `<section class="article-section signal-section" data-reveal aria-labelledby="${headingId}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${headingId}">${escapeHtml(module.title)}</h2></div></div><ol class="signal-sequence">${stages}</ol></section>`;
}

function renderCopy(module, className, index) {
  const paragraphs = module.paragraphs.map((paragraph) => `<p class="project-copy">${escapeHtml(paragraph)}</p>`).join("");
  return `<section class="article-section detail-section ${className}" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div><div class="copy-stack">${paragraphs}</div></section>`;
}

function renderWorkflow(module, index) {
  const steps = module.steps.map((step, index) => `<li><span class="flow-index">${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.text)}</p></li>`).join("");
  return `<section class="article-section module-section workflow-section" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div><ol class="workflow-list">${steps}</ol></section>`;
}

function renderOutput(module, index) {
  const items = module.items.map((item) => `<div><span>${escapeHtml(item.title)}</span><p>${escapeHtml(item.text)}</p></div>`).join("");
  const caption = module.caption ? `<p class="output-caption">${escapeHtml(module.caption)}</p>` : "";
  return `<section class="article-section module-section output-section" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div><div class="output-grid">${items}</div>${caption}</section>`;
}

function renderImage(module, index) {
  const caption = module.caption ? `<figcaption>${escapeHtml(module.caption)}</figcaption>` : "";
  return `<section class="article-section detail-section media-section" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div><figure class="project-image"><img src="${escapeHtml(siteAssetHref(module.src))}" alt="${escapeHtml(module.alt)}" width="${escapeHtml(module.width)}" height="${escapeHtml(module.height)}" loading="lazy" decoding="async">${caption}</figure></section>`;
}

function renderReportTable(module, index) {
  const headers = module.headers.map((header) => `<th scope="col">${escapeHtml(header)}</th>`).join("");
  const rows = module.rows.map((row) => `<tr>${row.map((cell) => {
    const text = escapeHtml(typeof cell === "string" ? cell : cell.text);
    return `<td>${cell.emphasis === true ? `<strong class="report-table-emphasis">${text}</strong>` : text}</td>`;
  }).join("")}</tr>`).join("");
  const note = module.note ? `<p class="report-table-note" id="${module.id}-note">${escapeHtml(module.note)}</p>` : "";
  const caption = module.caption ? `<p class="report-table-caption">${escapeHtml(module.caption)}</p>` : "";
  return `<section class="article-section detail-section report-section" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div>${note}<div class="report-table-scroll" role="region" tabindex="0" aria-labelledby="${module.id}"><table class="report-table" aria-labelledby="${module.id}"${module.note ? ` aria-describedby="${module.id}-note"` : ""}><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>${caption}</section>`;
}

function renderInteractive(module, index) {
  const caption = module.caption ? `<figcaption class="interactive-caption">${escapeHtml(module.caption)}</figcaption>` : "";
  return `<section class="article-section detail-section media-section" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div><figure class="interactive-frame"><iframe src="${escapeHtml(siteAssetHref(module.src))}" title="${escapeHtml(module.frameTitle)}" loading="lazy" sandbox="allow-scripts"></iframe>${caption}</figure></section>`;
}

function renderSystem(module, index) {
  const isFlow = /(?:pipeline|\bflow\b|generation|publishing)/i.test(`${module.label} ${module.title}`);
  const variantClass = module.variant === "readable-rows" ? " system-section-readable-rows" : "";
  const rows = module.rows.map((row) => isFlow
    ? `<div class="topology-row" role="list">${row.map((node, nodeIndex) => `${nodeIndex ? '<span class="topology-connector" aria-hidden="true">→</span>' : ""}<div class="topology-stage" role="listitem"><strong>${escapeHtml(node)}</strong></div>`).join("")}</div>`
    : `<ul class="system-values">${row.map((node) => `<li>${escapeHtml(node)}</li>`).join("")}</ul>`).join("");
  const caption = module.caption ? `<p class="system-caption">${escapeHtml(module.caption)}</p>` : "";
  const content = isFlow ? `<div class="topology" aria-label="${escapeHtml(module.title)} sequence">${rows}</div>` : `<div class="system-groups">${rows}</div>`;
  return `<section class="article-section module-section system-section${variantClass}" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div>${content}${caption}</section>`;
}

function renderDecision(module, index) {
  const constraint = module.constraint ? `<p class="decision-constraint">${escapeHtml(module.constraint)}</p>` : "";
  return `<section class="article-section module-section decision-section" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div><div class="decision-relationship"><div class="decision-path decision-chosen"><h3>CHOSEN</h3><p>${escapeHtml(module.chosen)}</p></div><span class="decision-connector" aria-hidden="true">↔</span><div class="decision-path decision-avoided"><h3>NOT CHOSEN</h3><p>${escapeHtml(module.avoided)}</p></div></div><p class="project-copy decision-reason">${escapeHtml(module.reason)}</p>${constraint}</section>`;
}

function renderVerification(module, index) {
  const items = module.items.map((item) => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join("");
  const caption = module.caption ? `<p class="verification-caption">${escapeHtml(module.caption)}</p>` : "";
  return `<section class="article-section module-section verification-section" data-reveal aria-labelledby="${module.id}"><div class="section-head"><div><p class="chapter-label"><b>${String(index + 1).padStart(2, "0")}</b> ${escapeHtml(module.label)}</p><h2 id="${module.id}">${escapeHtml(module.title)}</h2></div></div><div class="verification-checkpoint"><p class="verification-marker"><span aria-hidden="true">●</span> REVIEWED STATE</p><dl class="verification-readouts">${items}</dl>${caption}</div></section>`;
}

function renderModule(project, module, index) {
  const current = { ...module, id: `detail-${project.slug}-${index}` };
  switch (current.type) {
    case "signal": return renderSignal(project, current, index);
    case "overview": return renderCopy(current, "overview-section", index);
    case "technical": return renderCopy(current, "technical-section", index);
    case "workflow": return renderWorkflow(current, index);
    case "output": return renderOutput(current, index);
    case "image": return renderImage(current, index);
    case "report-table": return renderReportTable(current, index);
    case "interactive": return renderInteractive(current, index);
    case "system": return renderSystem(current, index);
    case "decision": return renderDecision(current, index);
    case "verification": return renderVerification(current, index);
    default: throw new Error(`Unsupported detail module: ${current.type}`);
  }
}

export function renderProjectDetail(project) {
  const title = escapeHtml(project.title);
  const summary = escapeHtml(project.summary);
  const seoTitle = project.seo?.title ?? `${project.title} — ${siteConfig.personName}`;
  const seoDescription = project.seo?.description ?? project.summary;
  const canonicalUrl = canonicalProjectUrl(project.slug);
  const seoImage = project.seo?.image ? absoluteSiteUrl(project.seo.image) : null;
  const modules = project.detail.modules.map((module, index) => renderModule(project, module, index)).join("\n");
  const status = escapeHtml(project.status);
  const titleMarkup = project.detail.titleLines?.length === 2
    ? `<span>${escapeHtml(project.detail.titleLines[0])}</span><span>${escapeHtml(project.detail.titleLines[1])}</span>`
    : title;
  const statusClass = `status-${project.status}`;

  const projectJsonLd = {
    "@type": "CreativeWork",
    name: project.title,
    description: seoDescription,
    url: canonicalUrl,
    creator: {
      "@type": "Person",
      "@id": `${siteConfig.url}/#person`,
      name: siteConfig.personName,
      url: `${siteConfig.url}/`,
    },
    isPartOf: {
      "@type": "WebSite",
      "@id": `${siteConfig.url}/#website`,
      name: siteConfig.name,
      url: `${siteConfig.url}/`,
    },
  };
  if (seoImage) projectJsonLd.image = seoImage;
  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${siteConfig.url}/` },
      { "@type": "ListItem", position: 2, name: "Work", item: `${siteConfig.url}/work/` },
      { "@type": "ListItem", position: 3, name: project.title, item: canonicalUrl },
    ],
  };
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [projectJsonLd, breadcrumb],
  }).replace(/</g, "\\u003c");
  const robotsMeta = isIndexableProject(project) ? "" : '  <meta name="robots" content="noindex,follow">\n';
  const imageMeta = seoImage
    ? `  <meta property="og:image" content="${escapeHtml(seoImage)}">\n  <meta name="twitter:image" content="${escapeHtml(seoImage)}">\n`
    : "";

  return `<!doctype html>
<!-- Generated by scripts/generate-site.mjs — do not edit directly. -->
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#050706">
  <meta name="description" content="${escapeHtml(seoDescription)}">
  <title>${escapeHtml(seoTitle)}</title>
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(siteConfig.name)}">
  <meta property="og:title" content="${escapeHtml(seoTitle)}">
  <meta property="og:description" content="${escapeHtml(seoDescription)}">
  <meta property="og:url" content="${canonicalUrl}">
${imageMeta}  <meta name="twitter:card" content="${seoImage ? "summary_large_image" : "summary"}">
  <meta name="twitter:title" content="${escapeHtml(seoTitle)}">
  <meta name="twitter:description" content="${escapeHtml(seoDescription)}">
${robotsMeta}  <script type="application/ld+json">${jsonLd}</script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=IBM+Plex+Mono:wght@400;500;600&family=Instrument+Sans:wdth,wght@75..100,400..700&display=swap" rel="stylesheet">
  <link rel="icon" href="../../assets/favicon/favicon.ico" sizes="any">
  <link rel="stylesheet" href="../../css/site-shell.css">
  <link rel="stylesheet" href="../../css/project-detail.css">
  <script type="module" src="../../js/site-shell.js"></script>
</head>
<body class="project-detail-page">
  <a class="skip-link" href="#main">Skip to project details</a>
  <site-chrome page="project"></site-chrome>
  <main id="main">
    <article>
      <header class="project-hero">
        <div class="project-hero-grid" data-reveal>
          <div class="project-lead">
            <p class="chapter-label"><b>PROJECT / ${String(project.number).padStart(2, "0")}</b> FEATURE ARTICLE</p>
            <h1 id="project-title">${titleMarkup}</h1>
            <div class="hero-meta"><span><b>TYPE</b> ${escapeHtml(project.type)}</span><span><b>STATUS</b> <i class="${statusClass}">${status}</i></span></div>
          </div>
          <div class="project-intro"><p class="hero-summary">${summary}</p>${renderActions(project)}</div>
        </div>
      </header>
${modules}
    </article>
    <site-contact number="06"></site-contact>
  </main>
</body>
</html>
`;
}

export const supportedDetailModules = new Set(["signal", "overview", "technical", "workflow", "output", "image", "report-table", "interactive", "system", "decision", "verification"]);
