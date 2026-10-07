import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { canonicalHomeUrl, canonicalWorkUrl, canonicalProjectUrl, siteConfig } from "../data/site.mjs";
import { hasCompleteDetail, homepageProjectUrl, isHomepageSelectedProject, isIndexableProject, isPublicProject, projectsData } from "../data/projects.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];

function check(condition, message) {
  if (!condition) failures.push(message);
}

async function readPage(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch {
    check(false, `${relativePath}: file is missing or unreadable.`);
    return null;
  }
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match ? (match[1] ?? match[2] ?? match[3] ?? "") : null;
}

function metaTags(html) {
  return tags(html, "meta");
}

function matchingMeta(html, attributeName, expectedValue) {
  return metaTags(html).filter((tag) => attribute(tag, attributeName)?.toLowerCase() === expectedValue.toLowerCase());
}

function decodeHtml(value) {
  return value.replace(/&(?:amp|lt|gt|quot|apos|#39);/g, (entity) => ({
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&apos;": "'",
    "&#39;": "'",
  })[entity]);
}

function fallbackMarkup(html, id, page) {
  const idToken = `id="${id}"`;
  const idIndex = html.indexOf(idToken);
  const containerStart = idIndex < 0 ? -1 : html.lastIndexOf("<div", idIndex);
  const containerEnd = containerStart < 0 ? -1 : html.indexOf(">", idIndex);
  check(idIndex >= 0 && containerStart >= 0 && containerEnd > idIndex, `${page}: expected one #${id} project container.`);
  if (idIndex < 0 || containerEnd <= idIndex) return "";
  const start = html.indexOf("<!-- PROJECT FALLBACK START -->", containerEnd + 1);
  const end = html.indexOf("<!-- PROJECT FALLBACK END -->", start + 1);
  check(start >= 0 && end > start, `${page}: canonical project fallback markers are missing or out of order.`);
  if (start < 0 || end <= start) return "";
  const fragment = html.slice(start + "<!-- PROJECT FALLBACK START -->".length, end);
  check((html.match(/<!-- PROJECT FALLBACK START -->/g) ?? []).length === 1 && (html.match(/<!-- PROJECT FALLBACK END -->/g) ?? []).length === 1, `${page}: fallback markers must be unique.`);
  return fragment;
}

function textContent(markup) {
  return decodeHtml(markup.replace(/<[^>]*>/g, "").trim());
}

function checkHomepageFallback(html) {
  const page = "index.html";
  const fragment = fallbackMarkup(html, "project-rows", page);
  const expected = projectsData.filter(isHomepageSelectedProject).sort((a, b) => Number(a.number) - Number(b.number));
  const rows = [...fragment.matchAll(/<a\b[^>]*>([\s\S]*?)<\/a\s*>/gi)];
  check(rows.length === expected.length, `${page}: no-JavaScript Selected Work must expose ${expected.length} direct project links; found ${rows.length}.`);
  check(tags(fragment, "article").length === 0, `${page}: Selected Work fallback must preserve the flat editorial ledger.`);
  expected.forEach((project, index) => {
    const row = rows[index];
    if (!row) return;
    const openingTag = row[0].match(/^<a\b[^>]*>/i)?.[0] ?? "";
    const label = String(project.number).padStart(2, "0");
    check(attribute(openingTag, "class")?.split(/\s+/).includes(`status-${project.status}`), `${page}: fallback project ${label} has an incorrect status class.`);
    check(attribute(openingTag, "href") === homepageProjectUrl(project), `${page}: fallback project ${label} has an incorrect href or order.`);
    check(attribute(openingTag, "aria-label") === `Open ${project.title}`, `${page}: fallback project ${label} has an incorrect accessible name.`);
    check(textContent(row[1].match(/<span\b[^>]*class=["']row-number["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "") === label, `${page}: fallback project ${label} has an incorrect number.`);
    check(textContent(row[1].match(/<span\b[^>]*class=["']row-title["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "") === project.title, `${page}: fallback project ${label} title is missing or out of order.`);
    check(textContent(row[1].match(/<span\b[^>]*class=["']row-type["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "") === project.type, `${page}: fallback project ${label} type is missing or stale.`);
    check(textContent(row[1].match(/<span\b[^>]*class=["']row-status["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "") === project.status, `${page}: fallback project ${label} status is missing or stale.`);
    check(textContent(row[1].match(/<span\b[^>]*class=["']row-year["'][^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "") === String(project.year), `${page}: fallback project ${label} year is missing or stale.`);
  });
  check(!fragment.includes("local-voice-assistant") && !fragment.includes("password-generator"), `${page}: public projects 11 and 12 must stay outside Selected Work.`);
}

function checkWorkFallback(html) {
  const page = "work/index.html";
  const fragment = fallbackMarkup(html, "work-cards", page);
  const expected = projectsData.filter(isPublicProject).sort((a, b) => Number(a.number) - Number(b.number));
  const cards = [...fragment.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article\s*>/gi)];
  check(cards.length === expected.length, `${page}: no-JavaScript Work Directory must expose ${expected.length} project cards; found ${cards.length}.`);
  const count = tags(html, "b").find((tag) => attribute(tag, "id") === "work-count");
  const countMarkup = count ? html.match(/<b\b[^>]*id=["']work-count["'][^>]*>([\s\S]*?)<\/b>/i)?.[1]?.trim() : null;
  check(countMarkup === String(expected.length).padStart(2, "0"), `${page}: static public project count must match canonical public projects (${expected.length}).`);
  expected.forEach((project, index) => {
    const card = cards[index];
    if (!card) return;
    const markup = card[0];
    const links = tags(markup, "a");
    const label = String(project.number).padStart(2, "0");
    check(links.length === 1, `${page}: project ${label} card must expose exactly one link.`);
    check(attribute(links[0] ?? "", "href") === `${project.slug}/`, `${page}: fallback project ${label} has an incorrect href or order.`);
    check(markup.includes(`status-${project.status}`), `${page}: fallback project ${label} has an incorrect status class.`);
    check(textContent(markup.match(/<div\b[^>]*class=["']card-head["'][^>]*>\s*<span>([\s\S]*?)<\/span>/i)?.[1] ?? "") === project.type, `${page}: fallback project ${label} type is missing or stale.`);
    check(textContent(markup.match(/<div\b[^>]*class=["']card-head["'][^>]*>[\s\S]*?<b>([\s\S]*?)<\/b>/i)?.[1] ?? "") === project.status, `${page}: fallback project ${label} status is missing or stale.`);
    check(textContent(markup.match(/<p\b[^>]*class=["']card-no["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "") === label, `${page}: fallback project ${label} has an incorrect number.`);
    check(textContent(markup.match(/<h3\b[^>]*class=["']card-title["'][^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? "") === project.title, `${page}: fallback project ${label} title is incorrect.`);
    check(textContent(markup.match(/<p\b[^>]*class=["']card-summary["'][^>]*>([\s\S]*?)<\/p>/i)?.[1] ?? "") === project.summary, `${page}: fallback project ${label} summary is missing or stale.`);
    check(/<span\b[^>]*class=["']card-cta["']/.test(markup) && markup.includes("READ ARTICLE") && markup.includes('aria-hidden="true">↗'), `${page}: fallback project ${label} is missing the visible READ ARTICLE CTA.`);
  });
  check(tags(fragment, "a").length === expected.length, `${page}: fallback must not contain duplicate project detail links.`);
}

function expectMeta(html, page, attributeName, key, expectedValue) {
  const matches = matchingMeta(html, attributeName, key);
  check(matches.length === 1, `${page}: expected exactly one meta ${attributeName}="${key}"; found ${matches.length}.`);
  const value = matches[0] ? decodeHtml(attribute(matches[0], "content") ?? "") : null;
  if (expectedValue !== undefined) check(value === expectedValue, `${page}: ${attributeName}="${key}" has an unexpected value.`);
  return value;
}

function expectCanonical(html, page, expectedUrl) {
  const links = tags(html, "link").filter((tag) => (attribute(tag, "rel") ?? "").toLowerCase().split(/\s+/).includes("canonical"));
  check(links.length === 1, `${page}: expected exactly one canonical link; found ${links.length}.`);
  const value = links[0] ? attribute(links[0], "href") : null;
  check(value === expectedUrl, `${page}: canonical must equal ${expectedUrl}.`);
  return value;
}

function expectTitleAndDescription(html, page, expectedTitle) {
  const titles = [...html.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)];
  check(titles.length === 1, `${page}: expected exactly one <title>; found ${titles.length}.`);
  if (expectedTitle !== undefined && titles[0]) {
    check(decodeHtml(titles[0][1].trim()) === expectedTitle, `${page}: <title> has an unexpected value.`);
  }
  expectMeta(html, page, "name", "description");
}

function expectNoKeywords(html, page) {
  const count = matchingMeta(html, "name", "keywords").length;
  check(count === 0, `${page}: meta keywords must not be present.`);
}

function expectNoindexState(html, page, shouldBeNoindex) {
  const robots = matchingMeta(html, "name", "robots");
  const noindex = robots.some((tag) => /\bnoindex\b/i.test(attribute(tag, "content") ?? ""));
  if (shouldBeNoindex) {
    check(robots.some((tag) => attribute(tag, "content")?.toLowerCase() === "noindex,follow"), `${page}: expected robots noindex,follow.`);
  } else {
    check(!noindex, `${page}: indexable page must not contain noindex.`);
  }
}

function parseJsonLd(html, page) {
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)]
    .filter((match) => attribute(`<script ${match[1]}>`, "type")?.toLowerCase() === "application/ld+json");
  check(scripts.length === 1, `${page}: expected exactly one JSON-LD block; found ${scripts.length}.`);
  if (!scripts[0]) return null;
  try {
    return JSON.parse(scripts[0][2]);
  } catch (error) {
    check(false, `${page}: JSON-LD is invalid JSON (${error.message}).`);
    return null;
  }
}

function expectSocialMetadata(html, page, { title, description, canonical, image, project }) {
  const ogFields = [
    ["og:type", "website"],
    ["og:site_name", siteConfig.name],
    ["og:title", title],
    ["og:description", description],
    ["og:url", canonical],
  ];
  for (const [key, value] of ogFields) expectMeta(html, page, "property", key, value);

  const ogImages = matchingMeta(html, "property", "og:image");
  if (image) {
    check(ogImages.length === 1, `${page}: expected exactly one og:image.`);
    if (ogImages[0]) check(decodeHtml(attribute(ogImages[0], "content") ?? "") === image, `${page}: og:image has an unexpected value.`);
  } else {
    check(ogImages.length === 0, `${page}: og:image must be omitted when no project SEO image exists.`);
  }

  const twitterCard = expectMeta(html, page, "name", "twitter:card");
  check(twitterCard === (project ? (image ? "summary_large_image" : "summary") : "summary"), `${page}: twitter:card has an unexpected value.`);
  expectMeta(html, page, "name", "twitter:title", title);
  expectMeta(html, page, "name", "twitter:description", description);
  const twitterImages = matchingMeta(html, "name", "twitter:image");
  if (image) {
    check(twitterImages.length === 1, `${page}: expected exactly one twitter:image.`);
    if (twitterImages[0]) check(decodeHtml(attribute(twitterImages[0], "content") ?? "") === image, `${page}: twitter:image has an unexpected value.`);
  } else {
    check(twitterImages.length === 0, `${page}: twitter:image must be omitted when no project SEO image exists.`);
  }
}

function expectedProjectImage(project) {
  return project.seo?.image ? new URL(project.seo.image, `${siteConfig.url}/`).href : null;
}

function xmlDecode(value) {
  return value.replace(/&(amp|lt|gt|quot|apos);/g, (_, entity) => ({
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
  })[entity]);
}

function expectBreadcrumb(document, page, expected) {
  const breadcrumb = document?.["@graph"]?.find((node) => node["@type"] === "BreadcrumbList");
  check(Boolean(breadcrumb), `${page}: BreadcrumbList is missing.`);
  const items = breadcrumb?.itemListElement ?? [];
  check(items.length === expected.length && items.every((item, index) => item["@type"] === "ListItem" && item.position === index + 1 && item.name === expected[index].name && item.item === expected[index].item), `${page}: breadcrumb hierarchy is incorrect.`);
}

async function checkWorkDirectory() {
  const page = "work/index.html";
  const html = await readPage(page);
  if (!html) return;
  checkWorkFallback(html);
  const title = "Work — Yiqiang Adrian Liu";
  const description = "The complete work directory: software, tools, systems, and experiments by Yiqiang Adrian Liu.";
  expectTitleAndDescription(html, page, title);
  expectMeta(html, page, "name", "description", description);
  expectCanonical(html, page, canonicalWorkUrl);
  expectSocialMetadata(html, page, { title, description, canonical: canonicalWorkUrl, image: null, project: false });
  expectNoKeywords(html, page);
  expectNoindexState(html, page, false);
  const document = parseJsonLd(html, page);
  const collection = document?.["@graph"]?.find((node) => ["CollectionPage", "WebPage"].includes(node["@type"]));
  check(collection?.url === canonicalWorkUrl && collection?.name === title && collection?.description === description, `${page}: collection metadata is incorrect.`);
  check(collection?.isPartOf?.["@id"] === `${siteConfig.url}/#website`, `${page}: collection must reference the WebSite.`);
  expectBreadcrumb(document, page, [{ name: "Home", item: canonicalHomeUrl }, { name: "Work", item: canonicalWorkUrl }]);
  check(collection?.breadcrumb?.["@id"] === `${canonicalWorkUrl}#breadcrumb`, `${page}: collection breadcrumb reference is incorrect.`);
}

async function checkStaleArchitecture(directory = root) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await checkStaleArchitecture(filename);
    else if (/\.(?:html|mjs|js)$/.test(entry.name)) {
      const source = await readFile(filename, "utf8");
      const staleRepository = "https://github.com/jumpjumptiger007/" + "portfolio-website";
      check(!source.includes(staleRepository), `${path.relative(root, filename)}: stale repository URL found.`);
    }
  }
}

async function checkHomepage() {
  const page = "index.html";
  const html = await readPage(page);
  if (!html) return;
  checkHomepageFallback(html);
  expectTitleAndDescription(html, page, siteConfig.homepageTitle);
  expectMeta(html, page, "name", "description", siteConfig.homepageDescription);
  const canonical = expectCanonical(html, page, canonicalHomeUrl);
  expectSocialMetadata(html, page, {
    title: siteConfig.homepageTitle,
    description: siteConfig.homepageDescription,
    canonical,
    image: new URL(siteConfig.profileImage, `${siteConfig.url}/`).href,
    project: false,
  });
  expectNoKeywords(html, page);
  expectNoindexState(html, page, false);

  const jsonLd = parseJsonLd(html, page);
  check(Array.isArray(jsonLd?.["@graph"]), `${page}: JSON-LD must contain an @graph array.`);
  const graph = jsonLd?.["@graph"] ?? [];
  const website = graph.find((node) => node["@type"] === "WebSite");
  const person = graph.find((node) => node["@type"] === "Person");
  check(website?.["@id"] === `${siteConfig.url}/#website`, `${page}: expected the configured WebSite node.`);
  check(website?.url === canonicalHomeUrl && website?.name === siteConfig.name, `${page}: WebSite URL or name is incorrect.`);
  check(website?.description === siteConfig.homepageDescription, `${page}: WebSite description is incorrect.`);
  check(website?.publisher?.["@id"] === `${siteConfig.url}/#person`, `${page}: WebSite must reference the Person publisher.`);
  check(person?.["@id"] === `${siteConfig.url}/#person` && person?.name === siteConfig.personName, `${page}: expected the configured Person node.`);
  check(person?.alternateName === siteConfig.alternateName, `${page}: Person alternateName is incorrect.`);
  check(person?.url === canonicalHomeUrl && person?.image === new URL(siteConfig.profileImage, `${siteConfig.url}/`).href, `${page}: Person URL or image is incorrect.`);
  check(person?.jobTitle === "Independent Developer & Builder", `${page}: Person jobTitle is incorrect.`);
  check(Array.isArray(person?.sameAs) && person.sameAs.includes(siteConfig.githubUrl), `${page}: Person must include the configured GitHub profile.`);

  check(html.includes("03</span> CURATED INDEX") && html.includes("<h2 id=\"index-title\">SELECTED WORK</h2>"), `${page}: curated section label or heading is incorrect.`);
  check(html.includes("Ten selected projects from the complete directory of software, tools, systems, and experiments."), `${page}: curated section description is incorrect.`);
  check(html.includes("CURATED INDEX / 10 ENTRIES") && html.includes("BROWSE FULL DIRECTORY"), `${page}: curated note or full-directory link is incorrect.`);
}

function checkProjectCollections() {
  const sortedNumbers = (projects) => projects.map((project) => Number(project.number)).sort((left, right) => left - right);
  const homepage = projectsData.filter(isHomepageSelectedProject);
  const directory = projectsData.filter(isPublicProject);
  check(sortedNumbers(homepage).join(",") === "1,2,3,4,5,6,7,8,9,10", "Canonical Homepage curation must contain exactly projects 01–10.");
  check(sortedNumbers(directory).join(",") === "1,2,3,4,5,6,7,8,9,10,11,12", "Canonical public Work Directory must contain exactly projects 01–12.");
  const selectedSlugs = ["interdemtv", "codex-provider-switcher", "job-search-agent", "samantha-ai-assistant", "signal-atlas", "codex-autopilot", "personal-tech-magazine", "pollen-alert-germany", "qpsk-visualization", "sonic-link"];
  const exactSequence = (collection, slugs) => [...collection].sort((left, right) => left.number - right.number)
    .map((project) => `${project.number}:${project.slug}`).join(",") === slugs.map((slug, index) => `${index + 1}:${slug}`).join(",");
  check(exactSequence(homepage, selectedSlugs), "Homepage must contain the exact approved sequence with Sonic Link at 10.");
  check(exactSequence(directory, [...selectedSlugs, "local-voice-assistant", "password-generator"]), "Work must contain the exact approved sequence with Sonic Link at 10 and no Bulk Email Sender.");
  const sonicLink = projectsData.find((project) => project.slug === "sonic-link");
  const bulkEmailSender = projectsData.find((project) => project.slug === "bulk-email-sender");
  check(sonicLink?.number === 10 && isHomepageSelectedProject(sonicLink) && isIndexableProject(sonicLink), "Sonic Link must be selected, public and indexable project 10.");
  check(bulkEmailSender?.number === 13 && bulkEmailSender.hidden === true && bulkEmailSender.homepageSelected === false && bulkEmailSender.seo?.indexable === false && hasCompleteDetail(bulkEmailSender), "Bulk Email Sender must retain its complete detail as hidden, non-indexable project 13.");
  check(projectsData.filter(hasCompleteDetail).length === 13, "Exactly 13 complete Project Details must remain.");
  check(projectsData.filter(isIndexableProject).length === 12, "Exactly 12 Project Details must be indexable.");
  check(homepage.every(isPublicProject), "Homepage-selected projects must all be public.");
  check(!homepage.some((project) => ["local-voice-assistant", "password-generator"].includes(project.slug)), "Projects 11 and 12 must stay outside Homepage curation.");
  const localVoiceAssistant = projectsData.find((project) => project.slug === "local-voice-assistant");
  const passwordGenerator = projectsData.find((project) => project.slug === "password-generator");
  check(localVoiceAssistant?.number === 11 && localVoiceAssistant.status === "archived" && isPublicProject(localVoiceAssistant), "Local Voice Assistant must remain public project 11 with archived status.");
  check(passwordGenerator?.number === 12 && isPublicProject(passwordGenerator), "Password Generator must remain public project 12.");
  check(localVoiceAssistant?.homepageSelected === false && passwordGenerator?.homepageSelected === false, "Projects 11 and 12 must be excluded from Homepage by explicit curation state.");
  check(projectsData.filter((project) => project.hidden === true).every((project) => !isIndexableProject(project)), "Hidden projects must remain non-public and non-indexable.");
  check(directory.filter((project) => hasCompleteDetail(project) && project.seo?.indexable !== false).every(isIndexableProject), "Public complete Project Details must be indexable unless explicitly excluded.");
}

async function checkProject(project) {
  const relativePath = `work/${project.slug}/index.html`;
  const html = await readPage(relativePath);
  if (!html) return;

  const indexable = isIndexableProject(project);
  expectNoindexState(html, relativePath, !indexable);

  const effectiveTitle = project.seo?.title ?? `${project.title} — ${siteConfig.personName}`;
  const effectiveDescription = project.seo?.description ?? project.summary;
  expectTitleAndDescription(html, relativePath, effectiveTitle);
  const canonical = expectCanonical(html, relativePath, canonicalProjectUrl(project.slug));
  expectMeta(html, relativePath, "name", "description", effectiveDescription);
  const image = expectedProjectImage(project);
  expectSocialMetadata(html, relativePath, {
    title: effectiveTitle,
    description: effectiveDescription,
    canonical,
    image,
    project: true,
  });
  expectNoKeywords(html, relativePath);

  const document = parseJsonLd(html, relativePath);
  const jsonLd = document?.["@graph"]?.find((node) => node["@type"] === "CreativeWork");
  expectBreadcrumb(document, relativePath, [{ name: "Home", item: canonicalHomeUrl }, { name: "Work", item: canonicalWorkUrl }, { name: project.title, item: canonical }]);
  check(jsonLd?.["@type"] === "CreativeWork", `${relativePath}: structured data must use CreativeWork.`);
  check(jsonLd?.url === canonical, `${relativePath}: CreativeWork URL must equal the canonical URL.`);
  check(jsonLd?.name === project.title && jsonLd?.description === effectiveDescription, `${relativePath}: CreativeWork name or description is incorrect.`);
  check(jsonLd?.creator?.["@id"] === `${siteConfig.url}/#person`, `${relativePath}: CreativeWork creator must reference the Person entity.`);
  check(jsonLd?.isPartOf?.["@id"] === `${siteConfig.url}/#website`, `${relativePath}: CreativeWork must reference the WebSite entity.`);
  if (image) check(jsonLd?.image === image, `${relativePath}: CreativeWork image is incorrect.`);
}

async function checkSitemap() {
  const sitemap = await readPage("sitemap.xml");
  if (!sitemap) return;
  check(sitemap.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "sitemap.xml: expected an XML declaration.");
  check((sitemap.match(/<urlset\b/g) ?? []).length === 1 && /<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"[^>]*>/.test(sitemap), "sitemap.xml: expected one valid sitemap urlset root.");
  check((sitemap.match(/<\/urlset>/g) ?? []).length === 1, "sitemap.xml: expected a closing urlset element.");
  const entries = [...sitemap.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((match) => match[1]);
  const rawLocs = [...sitemap.matchAll(/<loc>([\s\S]*?)<\/loc>/g)].map((match) => match[1]);
  const locs = rawLocs.map(xmlDecode);
  check(entries.length === rawLocs.length, "sitemap.xml: each URL entry must contain exactly one loc element.");
  check(entries.every((entry) => (entry.match(/<loc>/g) ?? []).length === 1), "sitemap.xml: each URL entry must contain exactly one loc element.");
  check(rawLocs.length > 0 && rawLocs.length === (sitemap.match(/<loc>/g) ?? []).length, "sitemap.xml: every loc element must have valid basic structure.");
  check(new Set(locs).size === locs.length, "sitemap.xml: duplicate loc URLs were found.");

  for (const loc of locs) {
    try {
      const url = new URL(loc);
      check(url.protocol === "https:", `sitemap.xml: ${loc} must use HTTPS.`);
      check(url.hostname === "yliu.tech", `sitemap.xml: ${loc} must use yliu.tech.`);
      check(!url.hash && !url.search, `sitemap.xml: ${loc} must not contain a fragment or query.`);
      check(url.href === loc, `sitemap.xml: ${loc} must be an absolute canonical URL.`);
    } catch {
      check(false, `sitemap.xml: ${loc} is not an absolute URL.`);
    }
    check(!loc.includes("/projects/") && !loc.includes("/demos/"), `sitemap.xml: legacy URL ${loc} must be excluded.`);
    check(!loc.includes("#"), `sitemap.xml: fragment URL ${loc} must be excluded.`);
  }

  const expected = [canonicalHomeUrl, canonicalWorkUrl, ...projectsData.filter(isIndexableProject).map((project) => canonicalProjectUrl(project.slug))].sort();
  check([...locs].sort().join("\n") === expected.join("\n"), "sitemap.xml: URLs do not match the exact set of expected canonical pages.");
  for (const project of projectsData.filter((item) => item.seo?.indexable === false && hasCompleteDetail(item))) {
    check(!locs.includes(canonicalProjectUrl(project.slug)), `sitemap.xml: explicitly non-indexable project ${project.slug} must be absent.`);
  }
}

async function checkRobots() {
  const robots = await readPage("robots.txt");
  if (!robots) return;
  const lines = robots.split(/\r?\n/).map((line) => line.trim());
  check(lines.includes("User-agent: *"), "robots.txt: missing User-agent: *.");
  check(lines.includes("Allow: /"), "robots.txt: missing Allow: /.");
  check(lines.filter((line) => /^Sitemap:/i.test(line)).length === 1 && lines.includes(`Sitemap: ${siteConfig.url}/sitemap.xml`), "robots.txt: sitemap directive is missing or incorrect.");
  check(!/^Disallow:\s*\//im.test(robots), "robots.txt: canonical public pages must not be blocked.");
}

async function checkLegacyPages() {
  const pages = [
    "demos/bulk-email-sender/index.html",
    "demos/password-generator/index.html",
    "demos/qpsk-visualization/index.html",
    "projects/cable/index.html",
    "projects/password-generator/index.html",
    "projects/pollen-alert-germany/index.html",
    "projects/qpsk-modulation/index.html",
  ];
  for (const page of pages) {
    const html = await readPage(page);
    if (!html) continue;
    const robots = matchingMeta(html, "name", "robots");
    check(robots.some((tag) => attribute(tag, "content")?.toLowerCase() === "noindex,follow"), `${page}: expected robots noindex,follow.`);
  }
}

async function main() {
  checkProjectCollections();
  check(!projectsData.some((project) => project.slug === "portfolio-v1" || project.title === "Portfolio V1"), "Canonical data must not contain Portfolio V1.");
  await checkHomepage();
  await checkWorkDirectory();
  await checkStaleArchitecture();
  for (const project of projectsData.filter(hasCompleteDetail)) await checkProject(project);
  await checkSitemap();
  await checkRobots();
  await checkLegacyPages();

  if (failures.length) {
    console.error(`SEO validation failed with ${failures.length} issue${failures.length === 1 ? "" : "s"}:`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
    return;
  }

  console.log(`SEO validation passed: homepage, Work directory, ${projectsData.filter(isIndexableProject).length} indexable Project Detail page(s), sitemap, robots, and legacy directives.`);
}

const requestedScript = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : "";
if (requestedScript === import.meta.url) {
  main().catch((error) => {
    console.error(`SEO validation failed: ${error.message}`);
    process.exitCode = 1;
  });
}
