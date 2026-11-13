import { projects, repoNames, headlineRepos, contributionSnapshot } from "./data.js";
import { insides } from "./inside.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
  );
const icon = (name) => `<i data-lucide="${name}"></i>`;
const icons = () => window.lucide?.createIcons();

$("#projects").innerHTML = projects
  .map(
    (p, i) => `
  <article class="project reveal" id="${p.id}">
    <button type="button" class="project-media" data-demo="${p.id}" aria-label="Open the ${p.name} live demo">
      <img src="./assets/${p.image}" width="${p.width}" height="${p.height}" loading="lazy" alt="${p.name} demo interface">
      <span class="media-hint">${icon("play")}Try the live demo</span>
    </button>
    <div class="project-body">
      <p class="project-kicker"><span>0${i + 1}</span>${p.category}</p>
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <blockquote class="decision"><p class="decision-label">Key decision</p><p>${p.decision}</p></blockquote>
      <ul class="stack" aria-label="Stack">${p.stack.map((s) => `<li>${s}</li>`).join("")}</ul>
      <div class="project-links">
        <a href="https://gauravch-code.github.io/${p.repo}/" target="_blank" rel="noopener">Live demo ${icon("arrow-up-right")}</a>
        <a href="https://github.com/gauravch-code/${p.repo}" target="_blank" rel="noopener">Source ${icon("arrow-up-right")}</a>
      </div>
    </div>
    <section class="inside" data-inside="${p.id}" aria-label="Inside ${p.name}">
      <header><span class="inside-tag">Inside</span><h4>${insides[p.id].title}</h4></header>
      ${insides[p.id].html}
    </section>
  </article>`,
  )
  .join("");

$$("[data-inside]").forEach((el) => insides[el.dataset.inside].init?.(el));

// Strip conventional-commit prefixes like "fix(scope):" or "[BUG]:" and trailing issue references
function cleanTitle(title) {
  const t = title
    .replace(/^\s*(?:\[(?:fix|feat|bug|chore|docs)\](?:\([^)]*\))?:?|(?:fix|feat|bug|chore|docs|refactor|perf|test)(?:\([^)]*\))?!?:)\s*/i, "")
    .replace(/\s*\((?:fixes|closes)?\s*#\d+\)\s*$/i, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

function row(p) {
  const name = repoNames[p.repo] || p.repo;
  return `<li><a href="https://github.com/${escape(p.repo)}/pull/${Number(p.number)}" target="_blank" rel="noopener">
    <span class="pr-project">${escape(name)}</span>
    <span class="pr-title">${escape(cleanTitle(p.title))}</span>
    <span class="pr-number">#${Number(p.number)}</span>
  </a></li>`;
}

function renderContributions(prs) {
  const merged = prs.filter((p) => p.merged);
  const open = prs.filter((p) => !p.merged);
  $("#merged-count").textContent = merged.length;
  $("#proof-merged").textContent = merged.length;
  $("#open-count").textContent = open.length;
  $("#open-count-2").textContent = open.length;
  $("#repo-count").textContent = new Set(prs.map((p) => p.repo)).size;
  $("#merged-list").innerHTML = merged.map(row).join("");
  $("#open-list").innerHTML = open.map(row).join("");
  const place = (repo) => (headlineRepos.indexOf(repo) + 1 || headlineRepos.length + 1);
  const names = [...new Set(merged.map((p) => p.repo))]
    .sort((a, b) => place(a) - place(b))
    .map((repo) => repoNames[repo] || repo.split("/")[1]);
  const shown = names.slice(0, 9);
  $("#merged-into").innerHTML =
    shown.map((n) => `<li>${escape(n)}</li>`).join("") +
    (names.length > shown.length
      ? `<li class="more"><a href="#open-source">and ${names.length - shown.length} more</a></li>`
      : "");
}

async function loadContributions() {
  renderContributions(contributionSnapshot);
  try {
    const cached = JSON.parse(localStorage.getItem("gc-contributions-v4"));
    if (cached && Array.isArray(cached.prs) && Date.now() - cached.time < 15 * 60 * 1000) {
      renderContributions(cached.prs);
      $("#github-status").textContent = "Live from GitHub";
      return;
    }
  } catch {
    /* Storage is optional. */
  }
  try {
    const response = await fetch(
      "https://api.github.com/search/issues?q=author%3Agauravch-code+is%3Apr+-user%3Agauravch-code&per_page=100",
      { signal: AbortSignal.timeout(8000), headers: { Accept: "application/vnd.github+json" } },
    );
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    const data = await response.json();
    // Closed pull requests that were never merged are left out
    const prs = data.items
      .filter((p) => p.state === "open" || p.pull_request?.merged_at)
      .map((p) => ({
        repo: p.repository_url.split("/repos/")[1],
        number: p.number,
        merged: Boolean(p.pull_request.merged_at),
        title: p.title,
      }));
    renderContributions(prs);
    $("#github-status").textContent = "Live from GitHub";
    try {
      localStorage.setItem("gc-contributions-v4", JSON.stringify({ time: Date.now(), prs }));
    } catch {
      /* Private browsing can disable storage. */
    }
  } catch {
    /* Keep the dated snapshot. */
  }
}

const dialog = $("#demo-dialog");
let returnFocus;
function openDemo(id, trigger) {
  const p = projects.find((p) => p.id === id);
  const url = `https://gauravch-code.github.io/${p.repo}/`;
  returnFocus = trigger;
  $("#demo-name").textContent = `${p.name} live demo`;
  $("#demo-external").href = url;
  $("#demo-frame").title = `${p.name} live demo`;
  $("#demo-loading").hidden = false;
  $("#demo-frame").src = url;
  dialog.showModal();
  document.body.style.overflow = "hidden";
}
$$("[data-demo]").forEach((b) => b.addEventListener("click", () => openDemo(b.dataset.demo, b)));
$("#demo-frame").addEventListener("load", () => ($("#demo-loading").hidden = true));
$("#demo-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});
dialog.addEventListener("close", () => {
  $("#demo-frame").removeAttribute("src");
  document.body.style.overflow = "";
  returnFocus?.focus({ preventScroll: true });
});

$("#copy-email").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText("gaurav.pvt25@gmail.com");
    $("#copy-status").textContent = "Email copied.";
  } catch {
    $("#copy-status").textContent = "gaurav.pvt25@gmail.com";
  }
});

const reveal = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        reveal.unobserve(e.target);
      }
    }),
  { rootMargin: "0px 0px 15% 0px", threshold: 0 },
);
$$(".reveal").forEach((el) => reveal.observe(el));
document.documentElement.classList.add("js");

const sections = $$("main section[id]");
const navLinks = $$(".header nav a[href^='#']");
function navPosition() {
  let current = "";
  for (const s of sections) if (s.getBoundingClientRect().top < 160) current = s.id;
  navLinks.forEach((a) => {
    const active = a.hash === `#${current}`;
    a.classList.toggle("active", active);
    if (active) a.setAttribute("aria-current", "location");
    else a.removeAttribute("aria-current");
  });
}
window.addEventListener("scroll", navPosition, { passive: true });
navPosition();

icons();
loadContributions();
