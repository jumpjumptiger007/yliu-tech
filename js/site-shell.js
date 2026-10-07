const chromeByPage = {
  home: { root: "", links: [["HOME", "#top", "page"], ["WORK", "/work/", ""], ["CONTACT", "#contact", ""]] },
  work: { root: "../", links: [["HOME", "../index.html#top", ""], ["WORK", "#main", "page"], ["CONTACT", "#contact", ""]] },
  project: { root: "../../", links: [["HOME", "../../index.html#top", ""], ["WORK", "../", "location"], ["CONTACT", "#contact", ""]] },
};

function renderChrome(element) {
  const page = chromeByPage[element.getAttribute("page")] ?? chromeByPage.home;
  const nav = page.links.map(([label, href, current]) => `<a href="${href}"${current ? ` aria-current="${current}"` : ""}>${label}</a>`).join("");
  const template = document.createElement("template");
  template.innerHTML = `<a class="brand-anchor" href="${page.links[0][1]}" aria-label="Yiqiang Adrian Liu — home"><img src="${page.root}assets/brand/yal-mark.svg" alt="" width="233" height="116"></a>
    <header class="site-header" aria-label="Primary navigation"><div class="nav-wrap"><nav class="nav" aria-label="Primary navigation">${nav}</nav>
      <svg class="progress-outline" viewBox="0 0 455 63" preserveAspectRatio="none" role="progressbar" aria-label="Reading progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><path class="active" d="M 1 38 Q 1 58 20 58 L 435 58 Q 454 58 454 38"></path></svg>
    </div></header>`;
  element.replaceWith(template.content);
}

function renderContact(element) {
  const number = element.getAttribute("number") || "05";
  element.innerHTML = `<section class="contact" id="contact" aria-labelledby="contact-title">
    <div class="contact-head"><p class="section-tag"><span>${number}</span> CONTACT / SIGNAL</p><i aria-hidden="true"></i></div>
    <div class="contact-copy-group" data-reveal><h1 id="contact-title">Get in <a href="mailto:contact@yliu.tech">touch.</a></h1>
      <p class="contact-copy">I’m open to interesting projects, collaborations, or just a good conversation about technology and the internet.</p></div>
    <a class="signal-link" href="mailto:contact@yliu.tech"><span>SEND A SIGNAL</span><b aria-hidden="true">→</b></a>
    <div class="contact-footer"><a href="mailto:contact@yliu.tech">EMAIL</a>
      <a href="https://github.com/jumpjumptiger007" target="_blank" rel="noopener noreferrer">GITHUB</a>
      <p>© 2026 YIQIANG ADRIAN LIU</p></div>
  </section>`;
}

document.querySelectorAll("site-chrome").forEach(renderChrome);
document.querySelectorAll("site-contact").forEach(renderContact);

const progressPath = document.querySelector(".progress-outline .active");
if (progressPath) {
  const progressBar = progressPath.ownerSVGElement;
  let frame = 0;
  const pathLength = progressPath.getTotalLength();
  progressPath.style.strokeDasharray = `${pathLength} ${pathLength}`;
  const updateProgress = () => {
    frame = 0;
    const scrollable = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const progress = scrollable > 0 ? Math.max(0, Math.min(1, window.scrollY / scrollable)) : 0;
    progressBar.setAttribute("aria-valuenow", String(Math.round(progress * 100)));
    progressPath.style.strokeDashoffset = String(pathLength * (1 - progress));
    progressPath.style.opacity = progress <= 0.0005 ? "0" : "1";
  };
  const queueProgress = () => {
    if (!frame) frame = window.requestAnimationFrame(updateProgress);
  };
  updateProgress();
  window.addEventListener("scroll", queueProgress, { passive: true });
  window.addEventListener("resize", queueProgress, { passive: true });
  window.addEventListener("load", queueProgress, { once: true });
  document.fonts?.ready.then(queueProgress);
  if ("ResizeObserver" in window) new ResizeObserver(queueProgress).observe(document.documentElement);
}

if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  document.body.classList.add("motion-ready");
  const observer = "IntersectionObserver" in window ? new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }) : null;
  const observeRevealTargets = (root) => {
    const targets = [];
    if (root.matches?.("[data-reveal]")) targets.push(root);
    targets.push(...(root.querySelectorAll?.("[data-reveal]") ?? []));
    targets.forEach((target) => observer ? observer.observe(target) : target.classList.add("is-revealed"));
  };
  observeRevealTargets(document);
  if ("MutationObserver" in window) {
    const contentObserver = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) observeRevealTargets(node);
      }));
    });
    contentObserver.observe(document.body, { childList: true, subtree: true });
  }
}
