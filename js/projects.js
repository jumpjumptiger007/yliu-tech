import { homepageProjectUrl, isHomepageSelectedProject, projectsData } from "../data/projects.mjs";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

const externalAttributes = (url) => /^https?:\/\//i.test(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
const linkFor = (project, label, className) => {
  const href = homepageProjectUrl(project);
  return `<a class="${className}" href="${escapeHtml(href)}"${externalAttributes(href)}>${escapeHtml(label)} <span aria-hidden="true">↗</span></a>`;
};

function renderFeatured(project) {
  const target = document.querySelector("#featured-project");
  if (!target || !project) return;
  const headline = project.featureHeadline.map((line, index) => `<span${index === 1 ? ' class="green"' : ""}>${escapeHtml(line)}</span>`).join("");
  const signal = project.detail.modules.find((module) => module.type === "signal");
  const technical = project.detail.modules.find((module) => module.type === "technical");
  const presentation = project.homepagePresentation?.cover ?? {};
  const coverTags = (presentation.tags ?? project.tags).map((tag) => `<li>${escapeHtml(tag)}</li>`).join("");
  const stages = presentation.stages ?? (signal?.stages ?? project.featureFlow).map((title, index) => ({
    phase: String(index + 1).padStart(2, "0"),
    title,
  }));
  const timeline = stages.map((stage, index) => {
    const detail = stage.detail?.map(escapeHtml).join("<br>");
    return `<div class="timeline-step${index === Math.min(3, stages.length - 1) ? " active" : ""}"><span>${escapeHtml(stage.phase ?? String(index + 1).padStart(2, "0"))}</span><b>${escapeHtml(stage.title ?? stage)}</b>${detail ? `<small>${detail}</small>` : ""}</div>`;
  }).join("");
  const technicalParagraphs = technical?.paragraphs ?? [];
  const readouts = presentation.readouts ?? [];
  const technicalNarrative = presentation.technicalNarrative ?? technicalParagraphs[0] ?? project.summary;
  const details = `<div class="cover-details"><div class="tech-copy"><h3>TECHNICAL DETAIL</h3><p>${escapeHtml(technicalNarrative)}</p></div>${readouts.length
    ? `<div class="tech-side"><h3>IMPLEMENTATION</h3><div class="cover-detail-points">${readouts.map((item) => `<div class="cover-detail-point"><span>${escapeHtml(item.label)}</span><b>${escapeHtml(item.value)}</b></div>`).join("")}</div></div>`
    : technicalParagraphs[1] ? `<div class="tech-side"><h3>IMPLEMENTATION</h3><p>${escapeHtml(technicalParagraphs[1])}</p></div>` : ""}</div>`;

  target.innerHTML = `<div class="cover-heading">
    <div class="cover-title-block"><p class="cover-kicker">${String(project.number).padStart(2, "0")} / ${escapeHtml(project.type)} / ${escapeHtml(project.year)} / <span class="${escapeHtml(project.status)}">${escapeHtml(project.status)}</span></p>
      <h2 class="cover-title" id="featured-title">${headline}</h2></div>
    <div class="cover-summary"><p>${escapeHtml(presentation.summary ?? project.summary)}</p><ul class="cover-tags">${coverTags}</ul></div>
  </div>
  <div class="timeline-wrap"><p class="timeline-head"><strong>${escapeHtml(presentation.timelineTitle ?? signal?.title ?? "Project sequence")}</strong><span>${escapeHtml(presentation.timelineLabel ?? signal?.label ?? "PROJECT FLOW")}</span></p><div class="timeline">${timeline}</div></div>
  ${details}
  <div class="cover-actions">${linkFor(project, "VIEW PROJECT", "feature-link")}${presentation.descriptor ? `<span>${escapeHtml(presentation.descriptor)}</span>` : ""}</div>`;
}

function renderProviderControl(preview) {
  if (!preview) return "";
  const groups = preview.providerGroups.map((group) =>
    `<section class="provider-group"><h5>${escapeHtml(group.label)}</h5><ul>${group.providers.map((provider) => `<li>${escapeHtml(provider)}</li>`).join("")}</ul></section>`).join("");
  const commands = preview.commands.map((command) =>
    `<span class="command-chip${command.toLowerCase() === "use" ? " on" : ""}">${escapeHtml(command)}</span>`).join("");
  return `<section class="provider-control" aria-label="${escapeHtml(preview.label)} technical surface"><header class="provider-control-head"><p>${escapeHtml(preview.label)}</p><p>${escapeHtml(preview.platform)} <span aria-hidden="true">/</span> ${escapeHtml(preview.version)}</p></header>
    <div class="provider-control-body"><div class="provider-groups">${groups}</div></div>
    <div class="provider-command-rail" aria-label="Command sequence">${commands}</div></section>`;
}

function renderSecondary(project) {
  const signal = project.detail.modules.find((module) => module.type === "signal");
  const presentationFlow = project.homepagePresentation?.systemFlow;
  const stages = presentationFlow?.steps ?? (signal?.stages ?? []).slice(0, 4);
  const emphasis = presentationFlow?.emphasis ?? stages[Math.floor(stages.length / 2)];
  const flow = stages.map((stage, index) => `${index ? '<i aria-hidden="true">→</i>' : ""}<span${String(stage).toLowerCase() === String(emphasis).toLowerCase() ? ' class="focus"' : ""}>${escapeHtml(stage)}</span>`).join("");
  return `<article class="system-secondary" data-reveal><p class="system-meta">${String(project.number).padStart(2, "0")} / ${escapeHtml(project.type)} / ${escapeHtml(project.year)} / <span class="${escapeHtml(project.status)}">${escapeHtml(project.status)}</span></p>
    <h3>${escapeHtml(project.title)}</h3><p>${escapeHtml(project.summary)}</p><div class="mini-flow">${flow}</div>${linkFor(project, "OPEN SYSTEM", "system-link")}</article>`;
}

function renderSystems(projects) {
  const target = document.querySelector("#selected-systems");
  if (!target) return;
  const [primary, ...secondary] = projects;
  if (!primary) return;
  const titleMarkup = escapeHtml(primary.title);
  target.innerHTML = `<div class="systems-layout"><article class="system-primary" data-reveal><p class="system-meta">${String(primary.number).padStart(2, "0")} / ${escapeHtml(primary.type)} / ${escapeHtml(primary.year)} / <span class="${escapeHtml(primary.status)}">${escapeHtml(primary.status)}</span></p>
    <h3>${titleMarkup}</h3><p>${escapeHtml(primary.summary)}</p>${renderProviderControl(primary.systemPreview)}${linkFor(primary, "OPEN SYSTEM", "system-link")}</article>
    <div class="systems-stack">${secondary.map(renderSecondary).join("")}</div></div>`;
}

function renderIndex(projects) {
  const target = document.querySelector("#project-rows");
  if (!target) return;
  const note = document.querySelector(".index-note");
  if (note) note.textContent = `CURATED INDEX / ${String(projects.length).padStart(2, "0")} ENTRIES`;
  target.innerHTML = projects.map((project) => {
    const href = homepageProjectUrl(project);
    return `<a class="project-row status-${escapeHtml(project.status)}" href="${escapeHtml(href)}"${externalAttributes(href)} aria-label="Open ${escapeHtml(project.title)}">
      <span class="row-number">${String(project.number).padStart(2, "0")}</span><span class="row-title">${escapeHtml(project.title)}</span>
      <span class="row-type">${escapeHtml(project.type)}</span><span class="row-status">${escapeHtml(project.status)}</span><span class="row-year">${escapeHtml(project.year)}</span><span class="row-arrow" aria-hidden="true">↗</span></a>`;
  }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
  const selectedProjects = projectsData.filter(isHomepageSelectedProject).sort((a, b) => Number(a.number) - Number(b.number));
  renderFeatured(selectedProjects.find((project) => project.featured));
  renderSystems(selectedProjects.filter((project) => project.selectedSystem));
  renderIndex(selectedProjects);
});
