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

function makeStatusFilters(items, hostId, onChange) {
  const host = document.getElementById(hostId);
  if (!host) return;
  host.innerHTML = "";
  const statuses = ["All", "ONGOING", "COMPLETED"];
  statuses.forEach((s, idx) => {
    const b = el("button", { class: "filter" + (idx === 0 ? " active" : "") }, s);
    b.addEventListener("click", () => {
      host.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      onChange(s === "All" ? null : s);
    });
    host.append(b);
  });
}

function renderProjects(items) {
  const list = document.getElementById("proj-list");
  function draw(filterStatus) {
    list.innerHTML = "";
    (items || [])
      .filter(p => !filterStatus || (p.status || "").toUpperCase() === filterStatus)
      .sort((a,b) => (b.sort || 0) - (a.sort || 0))
      .forEach(p => {
        const h3 = el("h3", {}, p.title || "Untitled");
        const meta = el("div", { class: "meta" }, [p.status ? p.status : "", p.when ? ` • ${p.when}` : "", p.org ? ` • ${p.org}` : ""].filter(Boolean).join(""));
        const body = p.summary ? el("p", {}, p.summary) : null;
        const tags = el("div", { class: "badges" }, (p.tags || []).map(t => el("span", { class: "badge" }, t)));
        const links = el("div", { class: "badges" }, (p.links || []).map(l => el("a", { class: "badge", href: l.href, target: "_blank", rel: "noopener noreferrer" }, l.label)));
        list.append(el("li", { class: "r-item" }, [h3, meta, body, tags, links]));
      });
  }
  makeStatusFilters(items, "proj-filters", draw);
  draw(null);
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

function renderReadingSplit(reading) {
  const cur = document.getElementById("reading-current");
  const read = document.getElementById("reading-read");
  cur.innerHTML = ""; read.innerHTML = "";
  (reading || []).forEach(r => {
    const a = el("a", { href: r.href, target: "_blank", rel: "noopener noreferrer" }, r.title);
    const meta = el("div", { class: "meta" }, [
      r.authors?.length ? r.authors.join(", ") : "",
      r.source ? ` • ${r.source}` : "",
      r.year ? ` • ${r.year}` : ""
    ].join(""));
    const li = el("li", {}, [a, meta]);
    if ((r.status || "").toLowerCase() === "currently reading") cur.append(li);
    else read.append(li);
  });
}

async function boot() {
  try {
    const [profile, research, reading] = await Promise.all([
      loadJSON("data/profile.json"),
      loadJSON("data/research.json"),
      loadJSON("data/reading.json").catch(() => ([]))
    ]);

    document.getElementById("name").textContent = profile.name || "Shivam Mittal";
    document.getElementById("footer-name").textContent = profile.name || "Shivam Mittal";
    document.getElementById("tagline").textContent = profile.tagline || "";
    document.getElementById("bio").textContent = profile.bio || "";
    document.getElementById("year").textContent = new Date().getFullYear();
    if (profile.avatar) document.getElementById("avatar").src = profile.avatar;

    renderSocialLinks(profile.links || []);
    renderProjects(research || []);
    renderReadingSplit(reading || []);
    setupScrollSpy();
  } catch (e) {
    console.error(e);
    const content = document.querySelector(".content");
    const warn = el("div", { class: "card" }, "Failed to load content. Please check your data/*.json files.");
    content.prepend(warn);
  }
}

boot();
