export function mountMini({
  projects,
  getProject,
  selectProject,
  openDemo,
  runScenario,
  icons,
}) {
  const host = document.createElement("aside");
  host.className = "mini";
  host.id = "mini";
  host.setAttribute("aria-label", "Mini-Gaurav companion");
  // Code-native character art extends the portfolio's earlier illustrated Mini-Gaurav.
  host.innerHTML = `<button class="mini-character" id="mini-character" type="button" aria-label="Open Mini-Gaurav actions" aria-controls="mini-panel" aria-expanded="false">
    <svg class="mini-avatar" viewBox="0 0 120 180" fill="none" aria-hidden="true" data-mood="idle">
      <defs><linearGradient id="mini-coat" x1="35" y1="80" x2="84" y2="125" gradientUnits="userSpaceOnUse"><stop stop-color="#c4d0d0"/><stop offset="1" stop-color="#829996"/></linearGradient><linearGradient id="mini-skin" x1="60" y1="28" x2="60" y2="74" gradientUnits="userSpaceOnUse"><stop stop-color="#e7b38d"/><stop offset="1" stop-color="#ce916f"/></linearGradient></defs>
      <ellipse cx="60" cy="170" rx="28" ry="4" fill="#000" opacity=".4"/>
      <g class="mini-body">
        <path d="M43 123H77L79 157H65L60 134L55 157H40Z" fill="#2e393d" stroke="#161c20" stroke-width="2"/>
        <path d="M40 155H55V165H33C32 160 35 157 40 155ZM65 155H79L87 162V165H65Z" fill="#e0e6df" stroke="#283331" stroke-width="2"/>
        <path d="M52 71H69V88H51Z" fill="#d49974"/>
        <path d="M43 80L52 78L60 84L68 78L80 81L86 122C72 129 49 129 34 122Z" fill="url(#mini-coat)" stroke="#526a68" stroke-width="1.5"/>
        <path d="M53 80L60 84L67 80L70 124H50Z" fill="#dedfd4"/>
        <path d="M44 80L51 78L60 95L48 99ZM76 80L69 78L60 95L73 99Z" fill="#dce4df"/>
        <path d="M40 104L50 105M73 105L82 102M71 98L74 124" stroke="#516b69" stroke-width="1.5"/>
        <g class="mini-arm-rest"><path d="M40 83C30 86 28 106 28 122L39 124L46 93Z" fill="url(#mini-coat)" stroke="#526a68" stroke-width="1.5"/><ellipse cx="33" cy="126" rx="5.5" ry="7" fill="#dcaa83"/><path d="M79 82C90 84 95 102 93 122L83 124L75 94Z" fill="url(#mini-coat)" stroke="#526a68" stroke-width="1.5"/><ellipse cx="88" cy="126" rx="5.5" ry="7" fill="#dcaa83"/></g>
        <g class="mini-arm-wave"><path d="M79 83L86 80L99 64L109 70L96 94L85 101L76 93Z" fill="url(#mini-coat)" stroke="#526a68" stroke-width="1.5"/><g fill="#dfac85" stroke="#bd8765" stroke-width=".6"><ellipse cx="106" cy="60" rx="7" ry="9"/><rect x="99" y="43" width="3.3" height="15" rx="1.6"/><rect x="103" y="39" width="3.3" height="19" rx="1.6"/><rect x="107" y="41" width="3.3" height="17" rx="1.6"/><rect x="111" y="45" width="3.3" height="14" rx="1.6"/><path d="M100 62L95 56C91 54 91 60 98 67Z"/></g><path d="M40 83C30 86 28 106 28 122L39 124L46 93Z" fill="url(#mini-coat)"/><ellipse cx="33" cy="126" rx="5.5" ry="7" fill="#dcaa83"/></g>
        <g class="mini-tablet"><path d="M38 94L48 105M82 94L75 106" stroke="#b7c7c4" stroke-width="12" stroke-linecap="round"/><rect x="44" y="99" width="33" height="24" rx="3" fill="#252e30" stroke="#d3ded7" stroke-width="2"/><path d="M50 106H64M50 111H70M50 116H60" stroke="#b6f36a" stroke-width="2"/><ellipse cx="44" cy="110" rx="4" ry="6" fill="#dfac85"/><ellipse cx="77" cy="110" rx="4" ry="6" fill="#dfac85"/></g>
      </g>
      <g class="mini-head"><ellipse cx="38" cy="49" rx="4" ry="7" fill="#ce946e"/><ellipse cx="82" cy="49" rx="4" ry="7" fill="#ce946e"/><path d="M38 36C38 21 82 21 82 36V53C82 68 72 78 60 78C48 78 38 68 38 53Z" fill="url(#mini-skin)" stroke="#b58060" stroke-width=".8"/>
        <path d="M38 50L39 54C44 68 50 66 60 69C70 66 76 67 81 54L82 50V59C81 71 71 79 60 79C49 79 39 71 38 59Z" fill="#342720"/><path d="M37 46C31 34 34 23 43 20C45 11 59 9 66 14C80 10 90 24 84 44L80 49L77 33C67 30 61 31 56 34C49 31 42 33 40 43Z" fill="#171b1d"/><path d="M42 25C50 18 61 17 69 23M55 29C63 23 75 24 79 29" stroke="#394042" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M44 40L53 39M67 39L76 40" stroke="#30241e" stroke-width="2" stroke-linecap="round"/>
        <g class="mini-eyes"><ellipse cx="49" cy="47" rx="4.8" ry="3.9" fill="#f6eadc"/><ellipse cx="71" cy="47" rx="4.8" ry="3.9" fill="#f6eadc"/><g class="mini-pupils" fill="#251d18"><circle cx="49" cy="47" r="2.4"/><circle cx="71" cy="47" r="2.4"/></g></g>
        <path d="M60 48L58 56L62 57" stroke="#b77c59" stroke-width="1.2" stroke-linecap="round"/><path d="M49 61C52 57 57 57 60 60C63 57 68 57 71 61L65 63L60 62L55 63Z" fill="#30241e"/><path class="mini-smile" d="M51 65C56 70 65 70 70 65" stroke="#f5e7d6" stroke-width="2.4" stroke-linecap="round"/><path class="mini-focused-mouth" d="M54 67H67" stroke="#e7c5ac" stroke-width="1.8" stroke-linecap="round"/>
      </g>
    </svg><span>Mini-Gaurav</span></button>
    <section class="mini-panel" id="mini-panel" role="dialog" aria-modal="false" aria-labelledby="mini-title" hidden>
      <div class="mini-panel-head"><div><span class="mini-online"></span><h2 id="mini-title">Mini-Gaurav</h2></div><button class="icon-button" id="mini-home" aria-label="Reset companion position" title="Reset position"><i data-lucide="move"></i></button><button class="icon-button" id="mini-close" aria-label="Close Mini-Gaurav actions" title="Minimize"><i data-lucide="minus"></i></button><button class="icon-button" id="mini-hide" aria-label="Hide Mini-Gaurav" title="Hide companion"><i data-lucide="x"></i></button></div>
      <p class="mini-message" id="mini-message" role="status" aria-live="polite">Hey, I'm Gaurav's little lab companion.</p>
      <label class="mini-project-label" for="mini-project">PROJECT</label><select id="mini-project">${projects.map((p) => `<option value="${p.id}">${p.short}</option>`).join("")}</select>
      <div class="mini-actions"><button data-mini-action="run"><i data-lucide="play"></i>Run scenario</button><button data-mini-action="demo"><i data-lucide="external-link"></i>Open demo</button><button data-mini-action="oss"><i data-lucide="git-pull-request"></i>Open source</button><button data-mini-action="about"><i data-lucide="user-round"></i>About Gaurav</button><a href="./Gaurav_Resume.pdf" target="_blank" rel="noopener"><i data-lucide="file-down"></i>Resume</a><button data-mini-action="email"><i data-lucide="copy"></i>Copy email</button></div>
      <div class="mini-panel-foot"><a href="mailto:gaurav.pvt25@gmail.com">Let's talk <i data-lucide="arrow-up-right"></i></a><span>LAB COMPANION / 01</span></div>
    </section><div class="mini-speech" id="mini-speech" role="status" aria-live="polite" hidden></div>`;
  document.body.append(host);
  const q = (s) => host.querySelector(s),
    character = q("#mini-character"),
    panel = q("#mini-panel"),
    speech = q("#mini-speech"),
    avatar = q(".mini-avatar"),
    launcher = document.querySelector("#mini-launcher");
  let dragging,
    moved = false,
    moodTimer,
    position,
    speechTimer,
    companionRun = false,
    userPlaced = false,
    parkingFrame = false;
  const setMood = (mood, ms = 0) => {
    clearTimeout(moodTimer);
    avatar.dataset.mood = mood;
    if (ms) moodTimer = setTimeout(() => (avatar.dataset.mood = "idle"), ms);
  };
  const message = (text) => (q("#mini-message").textContent = text);
  const store = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Storage is optional. */
    }
  };
  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  };
  function fitPosition(next) {
    if (!next || !Number.isFinite(next.x) || !Number.isFinite(next.y)) return;
    position = {
      x: Math.max(8, Math.min(innerWidth - host.offsetWidth - 8, next.x)),
      y: Math.max(80, Math.min(innerHeight - host.offsetHeight - 12, next.y)),
    };
    host.style.left = `${position.x}px`;
    host.style.top = `${position.y}px`;
    host.style.right = "auto";
    host.style.bottom = "auto";
  }
  function park() {
    parkingFrame = false;
    if (host.hidden || dragging || !panel.hidden) return;
    const w = host.offsetWidth,
      h = host.offsetHeight,
      bottom = innerHeight - h - 16,
      right = innerWidth - w - 18;
    const preferred =
      userPlaced && position ? position : { x: right, y: bottom };
    const candidates = [
      preferred,
      { x: 12, y: bottom },
      { x: right, y: 85 },
      { x: 12, y: 85 },
    ];
    const controls = [
      ...document.querySelectorAll(
        "main a, main button, main select, footer a",
      ),
    ]
      .map((el) => el.getBoundingClientRect())
      .filter(
        (r) => r.width && r.height && r.bottom > 76 && r.top < innerHeight,
      );
    const score = (p) =>
      controls.filter(
        (r) =>
          p.x < r.right + 6 &&
          p.x + w > r.left - 6 &&
          p.y < r.bottom + 6 &&
          p.y + h > r.top - 6,
      ).length;
    const safe =
      candidates.find((p) => score(p) === 0) ||
      candidates.reduce((a, b) => (score(a) <= score(b) ? a : b));
    fitPosition(safe);
    positionPanel();
  }
  function schedulePark() {
    if (parkingFrame) return;
    parkingFrame = true;
    requestAnimationFrame(park);
  }
  function positionPanel() {
    const r = character.getBoundingClientRect(),
      elements = [panel, speech];
    elements
      .filter((el) => !el.hidden)
      .forEach((el) => {
        const w = el.offsetWidth,
          h = el.offsetHeight;
        el.style.left = `${Math.max(12, Math.min(innerWidth - w - 12, r.right - w))}px`;
        el.style.top = `${Math.max(78, Math.min(innerHeight - h - 12, r.top - h - 12))}px`;
      });
  }
  function say(text, hold = 0) {
    clearTimeout(speechTimer);
    if (host.hidden || !panel.hidden) {
      speech.hidden = true;
      return;
    }
    speech.textContent = text;
    speech.hidden = false;
    positionPanel();
    if (hold)
      speechTimer = setTimeout(() => {
        speech.hidden = true;
      }, hold);
  }
  function close(focus = false) {
    panel.hidden = true;
    character.setAttribute("aria-expanded", "false");
    launcher.setAttribute("aria-expanded", "false");
    if (focus) character.focus({ preventScroll: true });
    schedulePark();
  }
  function show() {
    host.hidden = false;
    if (position) fitPosition(position);
    store("gc-mini-hidden", false);
    panel.hidden = false;
    speech.hidden = true;
    character.setAttribute("aria-expanded", "true");
    launcher.setAttribute("aria-expanded", "true");
    q("#mini-project").value = getProject().id;
    const busy = document.querySelector("#run").disabled;
    setMood(busy ? "working" : "wave", busy ? 0 : 2000);
    positionPanel();
    q("#mini-project").focus({ preventScroll: true });
  }
  character.addEventListener("click", (e) => {
    if (moved) {
      e.preventDefault();
      moved = false;
      return;
    }
    panel.hidden ? show() : close();
  });
  character.setAttribute(
    "aria-keyshortcuts",
    "ArrowUp ArrowDown ArrowLeft ArrowRight",
  );
  character.setAttribute(
    "aria-description",
    "Arrow keys move the companion. Enter opens its actions.",
  );
  character.addEventListener("keydown", (e) => {
    const delta = {
      ArrowLeft: [-24, 0],
      ArrowRight: [24, 0],
      ArrowUp: [0, -24],
      ArrowDown: [0, 24],
    }[e.key];
    if (!delta) return;
    e.preventDefault();
    const r = host.getBoundingClientRect();
    fitPosition({ x: r.left + delta[0], y: r.top + delta[1] });
    userPlaced = true;
    positionPanel();
    store("gc-mini-position", position);
  });
  launcher.addEventListener("click", () =>
    panel.hidden || host.hidden ? show() : close(true),
  );
  q("#mini-close").addEventListener("click", () => close(true));
  q("#mini-hide").addEventListener("click", () => {
    close();
    host.hidden = true;
    speech.hidden = true;
    store("gc-mini-hidden", true);
    launcher.focus({ preventScroll: true });
  });
  q("#mini-home").addEventListener("click", () => {
    position = null;
    userPlaced = false;
    host.removeAttribute("style");
    store("gc-mini-position", null);
    positionPanel();
  });
  q("#mini-project").addEventListener("change", (e) => {
    selectProject(e.target.value);
    message(getProject().summary);
    setMood("wave", 1300);
  });
  host.addEventListener("click", async (e) => {
    const action = e.target.closest("[data-mini-action]")?.dataset.miniAction;
    if (!action) return;
    if (action === "run") {
      companionRun = true;
      close(true);
      runScenario();
    }
    if (action === "demo") {
      close();
      openDemo(getProject().id, character);
    }
    if (action === "oss" || action === "about") {
      close();
      const target = document.querySelector(
        action === "oss" ? "#open-source" : "#about",
      );
      target.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
      target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
    if (action === "email") {
      try {
        await navigator.clipboard.writeText("gaurav.pvt25@gmail.com");
        message("Email copied. Let's build something good.");
        setMood("wave", 1800);
      } catch {
        message("gaurav.pvt25@gmail.com");
      }
    }
  });
  document.addEventListener("portfolio:project", () => {
    q("#mini-project").value = getProject().id;
  });
  document.addEventListener("portfolio:run", (e) => {
    q('[data-mini-action="run"]').disabled = e.detail.state === "running";
    if (e.detail.state === "running") {
      setMood("working");
      message(`Running ${getProject().short}...`);
      if (companionRun) say(`Running ${getProject().short}...`);
    } else if (e.detail.state === "complete") {
      message(e.detail.result);
      setMood("wave", 1800);
      if (companionRun) {
        say(e.detail.result, 5000);
        companionRun = false;
      }
    } else {
      setMood("idle");
      message(getProject().summary);
      if (companionRun) {
        say("Scenario stopped.", 2000);
        companionRun = false;
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      !panel.hidden &&
      !document.querySelector("dialog[open]")
    ) {
      e.preventDefault();
      close(true);
    }
  });
  document.addEventListener("pointerdown", (e) => {
    if (
      !panel.hidden &&
      !host.contains(e.target) &&
      !launcher.contains(e.target)
    )
      close();
  });
  character.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    const r = host.getBoundingClientRect();
    dragging = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      left: r.left,
      top: r.top,
    };
    moved = false;
    character.setPointerCapture(e.pointerId);
  });
  character.addEventListener("pointermove", (e) => {
    if (!dragging || dragging.id !== e.pointerId) return;
    const dx = e.clientX - dragging.x,
      dy = e.clientY - dragging.y;
    if (Math.hypot(dx, dy) > 6) moved = true;
    if (moved) {
      fitPosition({ x: dragging.left + dx, y: dragging.top + dy });
      positionPanel();
      host.classList.add("dragging");
    }
  });
  const endDrag = () => {
    if (dragging && moved) {
      userPlaced = true;
      store("gc-mini-position", position);
    }
    dragging = null;
    host.classList.remove("dragging");
  };
  character.addEventListener("pointerup", endDrag);
  character.addEventListener("pointercancel", endDrag);
  character.addEventListener("lostpointercapture", endDrag);
  // One gaze update per animation frame, and never while motion is paused.
  let gazePending = false;
  document.addEventListener(
    "pointermove",
    (e) => {
      if (
        gazePending ||
        host.hidden ||
        dragging ||
        matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.documentElement.dataset.paused === "true"
      )
        return;
      gazePending = true;
      requestAnimationFrame(() => {
        gazePending = false;
        const r = character.getBoundingClientRect();
        const dx = Math.max(
            -1.5,
            Math.min(1.5, (e.clientX - r.left - r.width / 2) / 200),
          ),
          dy = Math.max(
            -1,
            Math.min(1, (e.clientY - r.top - r.height * 0.25) / 250),
          );
        avatar.style.setProperty("--gaze-x", `${dx}px`);
        avatar.style.setProperty("--gaze-y", `${dy}px`);
      });
    },
    { passive: true },
  );
  window.addEventListener("resize", () => {
    if (position && !host.hidden) fitPosition(position);
    positionPanel();
    schedulePark();
  });
  window.addEventListener("scroll", schedulePark, { passive: true });
  host.hidden = read("gc-mini-hidden") === true;
  const savedPosition = read("gc-mini-position");
  if (
    savedPosition &&
    Number.isFinite(savedPosition.x) &&
    Number.isFinite(savedPosition.y)
  ) {
    position = savedPosition;
    userPlaced = true;
    if (!host.hidden) fitPosition(position);
  }
  setMood("wave", 2200);
  icons();
  schedulePark();
}
