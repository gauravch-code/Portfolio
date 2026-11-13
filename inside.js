// One "Inside" panel per project: a small working view of the decision that shaped it.
// Figures come from each repository's own docs; anything illustrative says so in its note.

const source = (repo, path, label) =>
  `<a href="https://github.com/gauravch-code/${repo}/blob/main/${path}" target="_blank" rel="noopener">${label}</a>`;

// Winnow: threshold sweep from docs/evals.md (60 held-out emails, seed 42).
const sweep = [
  { t: "0.75", pct: "8.3%", n: 5, cost: "$0.41", latency: "104 ms" },
  { t: "0.99", pct: "38.3%", n: 23, cost: "$2.01", latency: "464 ms" },
  { t: "0.995", pct: "50.0%", n: 30, cost: "$2.63", latency: "604 ms" },
  { t: "0.999", pct: "63.3%", n: 38, cost: "$3.32", latency: "764 ms" },
  { t: "0.9995", pct: "78.3%", n: 47, cost: "$4.13", latency: "944 ms" },
  { t: "0.9999", pct: "93.3%", n: 56, cost: "$4.94", latency: "1.12 s" },
];

// Fixed scatter so the same dots light up at the same threshold on every visit.
function scatter(count) {
  const order = [...Array(count).keys()];
  let seed = 42;
  for (let i = count - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    const j = seed % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rank = [];
  order.forEach((dot, r) => (rank[dot] = r));
  return rank;
}

const winnow = {
  title: "Turn the confidence dial",
  html: `
    <div class="dial">
      <div class="dial-control">
        <label for="winnow-threshold">Confidence threshold</label>
        <output id="winnow-t" for="winnow-threshold">0.75</output>
        <input type="range" id="winnow-threshold" min="0" max="${sweep.length - 1}" step="1" value="0" />
        <div class="dial-ends"><span>Trust the classifier</span><span>Ask the LLM more</span></div>
      </div>
      <div class="dots" id="winnow-dots" aria-hidden="true">${"<span></span>".repeat(60)}</div>
      <dl class="readout">
        <div><dt>Sent to the LLM</dt><dd id="winnow-esc">8.3%</dd><dd class="sub" id="winnow-n">5 of 60 emails</dd></div>
        <div><dt>Cost per 1,000 emails</dt><dd id="winnow-cost">$0.41</dd><dd class="sub">$5.30 if the LLM read everything</dd></div>
        <div><dt>Mean latency</dt><dd id="winnow-lat">104 ms</dd><dd class="sub">1.20 s if the LLM read everything</dd></div>
      </dl>
    </div>
    <p class="inside-note">
      Each dot is one of 60 held-out emails; lit dots are escalated. The classifier alone is 86.7% accurate in 3.7 ms.
      Cost and latency are modeled from token counts. ${source("winnow", "docs/evals.md", "Read the eval")}
    </p>`,
  init(root) {
    const rank = scatter(60);
    const dots = [...root.querySelectorAll("#winnow-dots span")];
    const input = root.querySelector("#winnow-threshold");
    const set = (id, text) => (root.querySelector(id).textContent = text);
    const update = () => {
      const s = sweep[Number(input.value)];
      dots.forEach((d, i) => d.classList.toggle("on", rank[i] < s.n));
      set("#winnow-t", s.t);
      set("#winnow-esc", s.pct);
      set("#winnow-n", `${s.n} of 60 emails`);
      set("#winnow-cost", s.cost);
      set("#winnow-lat", s.latency);
      input.setAttribute("aria-valuetext", `Threshold ${s.t}, ${s.pct} sent to the LLM`);
      input.style.setProperty("--fill", `${(Number(input.value) / (sweep.length - 1)) * 100}%`);
    };
    input.addEventListener("input", update);
    update();
  },
};

const traceguard = {
  title: "Follow one run to a decision",
  html: `
    <ol class="trace">
      <li><span class="trace-step">Run recorded</span><p>Every step and tool call is stored as a trace.</p></li>
      <li><span class="trace-step">Policy check</span><p>A deterministic tool checks the 30-day refund window. No model is involved.</p></li>
      <li><span class="trace-step">Model draft</span><p>The model writes a reply. It is a draft, not an answer.</p></li>
      <li class="trace-review">
        <span class="trace-step">Human review</span>
        <p class="verdict" id="tg-verdict" role="status" data-state="waiting">Waiting for a reviewer</p>
        <div class="trace-actions">
          <button type="button" class="chip-button" data-verdict="approved">Approve</button>
          <button type="button" class="chip-button" data-verdict="changes">Request changes</button>
        </div>
      </li>
    </ol>
    <p class="inside-note">
      The flow of the built-in support agent. Review records a decision; it never sends a reply.
      ${source("TraceGuard", "README.md", "Read the notes")}
    </p>`,
  init(root) {
    const verdict = root.querySelector("#tg-verdict");
    const text = {
      approved: "Approved. Decision saved with the trace; nothing was sent.",
      changes: "Changes requested. The note is saved with the trace.",
    };
    root.querySelectorAll("[data-verdict]").forEach((b) =>
      b.addEventListener("click", () => {
        const same = verdict.dataset.state === b.dataset.verdict;
        verdict.dataset.state = same ? "waiting" : b.dataset.verdict;
        verdict.textContent = same ? "Waiting for a reviewer" : text[b.dataset.verdict];
        root.querySelectorAll("[data-verdict]").forEach((x) => x.setAttribute("aria-pressed", String(x === b && !same)));
      }),
    );
  },
};

const sre = {
  title: "Watch the escalation",
  html: `
    <div class="incident" id="sre-incident">
      <div class="incident-chart">
        <svg viewBox="0 0 640 190" preserveAspectRatio="none" aria-hidden="true">
          <line class="axis" x1="0" y1="170" x2="640" y2="170" />
          <line class="threshold" x1="0" y1="50" x2="640" y2="50" />
          <rect class="window" x="168" y="174" width="232" height="5" rx="2.5" />
          <path class="usage" pathLength="1" d="M0,112 C50,104 110,72 160,44 L168,117 C220,105 290,70 338,44 L349,107 C420,104 520,103 640,102" />
        </svg>
        <span class="chart-label threshold-label">80% of limit: alert</span>
        <span class="chart-label window-label">120 s escalation window</span>
        <span class="marker" style="left:25%;top:23.2%">1</span>
        <span class="marker" style="left:52.8%;top:23.2%">2</span>
        <span class="marker quiet" style="left:96%;top:53.7%">3</span>
      </div>
      <ol class="incident-steps">
        <li><strong>First alert: restart.</strong> Memory crosses 80% of the limit. The agent reads limits and logs, then tries the cheapest fix.</li>
        <li><strong>It recurs: raise the limit.</strong> A second alert inside the window means the restart did not hold, so the limit doubles from 10Mi to 20Mi.</li>
        <li><strong>Silence.</strong> Usage sits well under the threshold and the watchdog stops alerting.</li>
      </ol>
    </div>
    <p class="inside-note">
      <button type="button" class="chip-button" id="sre-replay">Replay</button>
      An illustration of the escalation logic. The thresholds are the project's real defaults.
      ${source("Agentic-SRE-Pipeline", "README.md", "Read the design")}
    </p>`,
  init(root) {
    const chart = root.querySelector("#sre-incident");
    const play = () => {
      chart.classList.remove("play");
      void chart.offsetWidth;
      chart.classList.add("play");
    };
    root.querySelector("#sre-replay").addEventListener("click", play);
    const seen = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          play();
          seen.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    seen.observe(chart);
  },
};

// Toolgen: Run A vs Run B from DESIGN.md (20 conversations each, seed 42).
const runs = [
  { name: "Category coverage", a: 75, b: 100, max: 100, show: (v) => `${v}%` },
  { name: "Tool entropy", a: 4.51, b: 4.93, max: 5.32, show: (v) => `${v.toFixed(2)} bits` },
  { name: "Tool-pair uniqueness", a: 0.59, b: 0.7, max: 1, show: (v) => v.toFixed(2) },
  { name: "Mean judge score", a: 3.62, b: 3.87, max: 5, show: (v) => `${v.toFixed(2)} / 5` },
];
const bar = (run, value, m) =>
  `<div class="run run-${run}"><span class="run-bar"><i style="width:${(value / m.max) * 100}%"></i></span><span class="run-value">${m.show(value)}</span></div>`;

const toolgen = {
  title: "Does steering cost quality?",
  html: `
    <div class="compare">
      <ul class="legend" aria-label="Runs">
        <li class="run-a"><i></i>Run A, steering off</li>
        <li class="run-b"><i></i>Run B, steering on</li>
      </ul>
      <dl class="compare-rows">
        ${runs.map((m) => `<div><dt>${m.name}</dt><dd>${bar("a", m.a, m)}${bar("b", m.b, m)}</dd></div>`).join("")}
      </dl>
    </div>
    <p class="inside-note">
      Steering toward underused tools made the dataset more varied, and the judge scored it higher, not lower.
      20 conversations per run, seed 42; bars are scaled to each metric's maximum.
      ${source("toolgen", "DESIGN.md", "Read the analysis")}
    </p>`,
};

export const insides = { winnow, traceguard, sre, toolgen };
