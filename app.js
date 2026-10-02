import { projects, contributionSnapshot } from "./data.js";

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const escape = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
let reduced = motionQuery.matches;
let paused = reduced,
  orbiting = false,
  focused = false,
  exploded = false,
  active = projects[0],
  scene;
let runId = 0;
const icon = (name) => `<i data-lucide="${name}"></i>`;
const icons = () => window.lucide?.createIcons();

$("#projects").innerHTML = projects
  .map(
    (p, i) => `
  <article class="project reveal" id="${p.id}">
    <div class="project-copy"><div class="project-index"><b>0${i + 1}</b><span>${p.category}</span></div>
      <h3>${p.name}</h3><p class="project-desc">${p.description}</p>
      <div class="decision"><span>THE ENGINEERING DECISION</span><p>${p.decision}</p></div>
      <p class="stack">${p.stack}</p><div class="project-actions"><a class="solid-link" href="https://gauravch-code.github.io/${p.repo}/" target="_blank" rel="noopener">Live demo ${icon("arrow-up-right")}</a><a class="text-link" href="https://github.com/gauravch-code/${p.repo}" target="_blank" rel="noopener">Source ${icon("github")}</a></div>
    </div>
    <div><div class="project-media"><div class="media-bar"><span><i></i>${p.short.toUpperCase()}</span><span>LIVE DEMO ${icon("arrow-up-right")}</span></div><button type="button" data-demo="${p.id}" aria-label="Explore ${p.name} demo"><img src="./assets/${p.image}" width="${p.width}" height="${p.height}" loading="lazy" alt="${p.name} working demo interface"><span class="media-overlay">${icon("maximize-2")}</span></button></div><p class="project-motif">${p.caption}</p></div>
  </article>`,
  )
  .join("");

function steps() {
  const s = active.scenarios[Number($("#scenario").value)];
  $("#execution").innerHTML = s.steps
    .map((text, i) => `<li data-step="${i + 1}">${text}</li>`)
    .join("");
  $("#result").className = "result";
  $("#result").textContent = active.ready;
  $(".fallback-graph").innerHTML = s.steps
    .map(
      (text, i) =>
        `<${i % 2 ? "b" : "span"}>${escape(text)}</${i % 2 ? "b" : "span"}>`,
    )
    .join("");
}

function cancelRun() {
  runId++;
  $("#run").disabled = false;
  $("#run span").textContent = "Run scenario";
  scene?.setExecution(-1, 0);
}

function selectProject(id) {
  active = projects.find((p) => p.id === id) || projects[0];
  cancelRun();
  const index = projects.indexOf(active);
  $(".bench").setAttribute("aria-labelledby", `tab-${active.id}`);
  $("#system-index").textContent = `MODULE 0${index + 1}`;
  $("#system-title").textContent = active.short;
  $("#system-summary").textContent = active.summary;
  $("#scenario").innerHTML = active.scenarios
    .map((s, i) => `<option value="${i}">${s.name}</option>`)
    .join("");
  $("#inspect-project").href = `#${active.id}`;
  $("#inspect-project").setAttribute(
    "aria-label",
    `View ${active.name} project`,
  );
  $$("[data-project]").forEach((b) => {
    const selected = b.dataset.project === active.id;
    b.setAttribute("aria-selected", String(selected));
    b.tabIndex = selected ? 0 : -1;
  });
  scene?.select(id);
  $("#scene-fallback p").textContent = `${active.short} / ${active.summary}`;
  steps();
}

$$("[data-project]").forEach((b) =>
  b.addEventListener("click", () => selectProject(b.dataset.project)),
);
$(".module-selector").addEventListener("keydown", (e) => {
  if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
  e.preventDefault();
  const index = projects.indexOf(active);
  const next =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? 3
        : (index + (e.key === "ArrowRight" ? 1 : 3)) % 4;
  selectProject(projects[next].id);
  $(`#tab-${projects[next].id}`).focus();
});
$("#scenario").addEventListener("change", () => {
  cancelRun();
  steps();
});
$("#run").addEventListener("click", async () => {
  const token = ++runId;
  const scenario = active.scenarios[Number($("#scenario").value)];
  const rows = $$("#execution li");
  $("#run").disabled = true;
  $("#run span").textContent = "Running...";
  $("#result").className = "result";
  $("#result").textContent = "Executing selected path...";
  rows.forEach((r) => (r.className = ""));
  for (let i = 0; i < rows.length; i++) {
    if (token !== runId) return;
    rows[i].className = "running";
    scene?.setExecution(i, scenario.branch);
    await new Promise((resolve) => setTimeout(resolve, reduced ? 70 : 680));
    if (token !== runId) return;
    rows[i].className = "done";
  }
  $("#result").textContent = scenario.result;
  $("#result").className = `result ${scenario.branch ? "warning" : "complete"}`;
  $("#run").disabled = false;
  $("#run span").textContent = "Run again";
  scene?.setExecution(4, scenario.branch);
});

function updateControls() {
  $("#motion").setAttribute("aria-pressed", String(paused));
  $("#motion").setAttribute(
    "aria-label",
    paused ? "Resume animation" : "Pause animation",
  );
  $("#motion").dataset.tooltip = paused
    ? "Resume animation"
    : "Pause animation";
  $("#motion").innerHTML = icon(paused ? "play" : "pause");
  $("#orbit").setAttribute("aria-pressed", String(orbiting));
  $("#focus-scene").setAttribute("aria-pressed", String(focused));
  $("#explode").setAttribute("aria-pressed", String(exploded));
  scene?.setMotion({ paused, orbiting, focused, exploded, reduced });
  icons();
}
$("#motion").addEventListener("click", () => {
  paused = !paused;
  updateControls();
});
$("#orbit").addEventListener("click", () => {
  orbiting = !orbiting;
  if (orbiting && !reduced) paused = false;
  updateControls();
});
$("#focus-scene").addEventListener("click", () => {
  focused = !focused;
  orbiting = false;
  updateControls();
});
$("#reset").addEventListener("click", () => {
  paused = reduced;
  orbiting = false;
  focused = false;
  exploded = false;
  scene?.reset();
  selectProject("winnow");
  updateControls();
});
$("#explode").addEventListener("click", () => {
  exploded = !exploded;
  focused = exploded;
  orbiting = false;
  updateControls();
});
motionQuery.addEventListener("change", (e) => {
  reduced = e.matches;
  paused = reduced;
  orbiting = false;
  updateControls();
});

function renderContributions(prs) {
  const sorted = [...prs].sort((a, b) => Number(b.merged) - Number(a.merged));
  $("#merged-count").textContent = sorted.filter((p) => p.merged).length;
  $("#open-count").textContent = sorted.filter((p) => !p.merged).length;
  $("#repo-count").textContent = new Set(sorted.map((p) => p.repo)).size;
  $("#contributions").innerHTML = sorted
    .map((p) => {
      const slug = p.repo.split("/")[1];
      const name =
        slug === "typescript-sdk"
          ? "MCP TypeScript SDK"
          : slug === "sentence-transformers"
            ? "Sentence Transformers"
            : slug === "opensre"
              ? "OpenSRE"
              : slug.charAt(0).toUpperCase() + slug.slice(1);
      return `<a class="contribution" href="https://github.com/${escape(p.repo)}/pull/${Number(p.number)}" target="_blank" rel="noopener"><div class="pr-repo">${escape(name)}<small>#${Number(p.number)}</small></div><div><h3>${escape(p.title)}</h3></div><span class="pr-state ${p.merged ? "merged" : "open"}">${icon(p.merged ? "git-merge" : "git-pull-request")}${p.merged ? "Merged" : "Open"}</span>${icon("arrow-up-right")}</a>`;
    })
    .join("");
  icons();
}

async function loadContributions() {
  renderContributions(contributionSnapshot);
  let cached;
  try {
    cached = JSON.parse(localStorage.getItem("gc-contributions-v3"));
    if (
      cached &&
      Number.isFinite(cached.time) &&
      cached.time > 0 &&
      cached.time <= Date.now() &&
      Array.isArray(cached.prs) &&
      cached.prs.every(
        (p) =>
          typeof p.repo === "string" &&
          /^[\w.-]+\/[\w.-]+$/.test(p.repo) &&
          Number.isInteger(p.number) &&
          typeof p.title === "string" &&
          typeof p.merged === "boolean",
      )
    ) {
      renderContributions(cached.prs);
      $("#github-status").textContent =
        `CACHED / ${new Date(cached.time).toLocaleDateString("en-US")}`;
      if (Date.now() - cached.time < 15 * 60 * 1000) return;
    }
  } catch {
    /* Storage is optional. */
  }
  try {
    const response = await fetch(
      "https://api.github.com/search/issues?q=author%3Agauravch-code+is%3Apr+-user%3Agauravch-code&per_page=100",
      {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: "application/vnd.github+json" },
      },
    );
    if (!response.ok) throw new Error(`GitHub ${response.status}`);
    const data = await response.json();
    const prs = data.items
      .filter((p) => p.state === "open" || p.pull_request?.merged_at)
      .map((p) => ({
        repo: p.repository_url.split("/repos/")[1],
        number: p.number,
        merged: Boolean(p.pull_request.merged_at),
        title: p.title.replace(/^(\[fix\]|fix)(\([^)]*\))?:?\s*/i, ""),
      }));
    renderContributions(prs);
    $("#github-status").textContent = "LIVE / GITHUB";
    try {
      localStorage.setItem(
        "gc-contributions-v3",
        JSON.stringify({ time: Date.now(), prs }),
      );
    } catch {
      /* Private browsing can disable storage. */
    }
  } catch {
    $("#github-status").textContent += " / OFFLINE";
  }
}

const dialog = $("#demo-dialog");
let returnFocus;
$$("[data-demo]").forEach((button) =>
  button.addEventListener("click", () => {
    const p = projects.find((p) => p.id === button.dataset.demo);
    const url = `https://gauravch-code.github.io/${p.repo}/`;
    returnFocus = button;
    $("#demo-name").textContent = p.name;
    $("#demo-external").href = url;
    $("#demo-frame").title = `${p.name} live demo`;
    $("#demo-loading").hidden = false;
    $("#demo-frame").src = url;
    dialog.showModal();
    document.body.style.overflow = "hidden";
  }),
);
$("#demo-frame").addEventListener("load", () => {
  $("#demo-loading").hidden = true;
});
$("#demo-close").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
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
  { threshold: 0.08 },
);
$$(".reveal").forEach((el) => reveal.observe(el));
document.documentElement.classList.add("js");
const sections = $$("main>section");
const navLinks = $$(".header nav a");
function navPosition() {
  let current = sections[0].id;
  for (const s of sections)
    if (s.getBoundingClientRect().top < 200) current = s.id;
  navLinks.forEach((a) => {
    const isActive = a.hash === `#${current}`;
    a.classList.toggle("active", isActive);
    if (isActive) a.setAttribute("aria-current", "location");
    else a.removeAttribute("aria-current");
  });
}
window.addEventListener("scroll", navPosition, { passive: true });
selectProject("winnow");
updateControls();
loadContributions();

try {
  const { createScene } = await import("./scene.js");
  scene = createScene({
    canvas: $("#systems-canvas"),
    labels: $("#scene-labels"),
    onSelect: selectProject,
    reduced,
  });
  scene.select(active.id);
  updateControls();
  $("#scene-loading").hidden = true;
  document.documentElement.dataset.scene = "ready";
} catch (error) {
  $("#scene-loading").hidden = true;
  $("#systems-canvas").hidden = true;
  $("#scene-fallback").hidden = false;
  document.documentElement.dataset.scene = "fallback";
  ["orbit", "focus-scene", "motion", "explode"].forEach((id) => {
    $(`#${id}`).disabled = true;
  });
  console.warn(
    "3D unavailable; architecture and projects remain accessible.",
    error,
  );
}
