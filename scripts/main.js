async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k === "href" || k === "target" || k === "rel") node.setAttribute(k, v);
    else node.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  kids.filter(Boolean).forEach(c => node.append(c.nodeType ? c : document.createTextNode(c)));
  return node;
}

function renderSocialLinks(links) {
  const container = document.getElementById("social-links");
  container.innerHTML = "";
  (links || []).forEach(l => {
    const a = el("a", { href: l.href, target: "_blank", rel: "noopener noreferrer" }, l.label);
    container.append(a);
  });
}

function renderResearch(research) {
  const ul = document.getElementById("research-list");
  ul.innerHTML = "";
  (research || [])
    .sort((a,b) => (b.year || 0) - (a.year || 0))
    .forEach(r => {
      const title = el("strong", {}, r.title);
      const authors = r.authors?.length ? el("div", { class: "meta" }, r.authors.join(", ")) : null;
      const venue = el("div", { class: "meta" }, [r.venue || "", r.year ? ` • ${r.year}` : ""].join(""));
      const links = el("div", { class: "badges" }, (r.links || []).map(l => el("a", { class: "badge", href: l.href, target: "_blank", rel: "noopener noreferrer" }, l.label)));
      const summary = r.summary ? el("div", { class: "meta" }, r.summary) : null;
      ul.append(el("li", {}, [title, authors, venue, links, summary]));
    });
}

function setupScrollSpy() {
  const links = Array.from(document.querySelectorAll('[data-nav]'));
  const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const active = new Set();
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const id = entry.target.getAttribute('id');
      const link = links.find(a => a.getAttribute('href') === `#${id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        active.add(link);
      } else {
        active.delete(link);
      }
    });
    links.forEach(l => l.classList.remove('active'));
    const pick = links.find(l => active.has(l)) || null;
    if (pick) pick.classList.add('active');
  }, { rootMargin: '-40% 0px -55% 0px', threshold: [0, 1.0] });
  sections.forEach(s => obs.observe(s));
}

async function boot() {
  try {
    const [profile, research] = await Promise.all([
      loadJSON("data/profile.json"),
      loadJSON("data/research.json")
    ]);

    document.getElementById("name").textContent = profile.name || "Shivam Mittal";
    document.getElementById("footer-name").textContent = profile.name || "Shivam Mittal";
    document.getElementById("tagline").textContent = profile.tagline || "";
    document.getElementById("bio").textContent = profile.bio || "";
    document.getElementById("year").textContent = new Date().getFullYear();
    if (profile.avatar) document.getElementById("avatar").src = profile.avatar;

    renderSocialLinks(profile.links || []);
    renderResearch(research || []);
    setupScrollSpy();
  } catch (e) {
    console.error(e);
    const content = document.querySelector(".content");
    const warn = el("div", { class: "card" }, "Failed to load content. Please check your data/*.json files.");
    content.prepend(warn);
  }
}

boot();
