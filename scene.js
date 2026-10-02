import * as T from "./vendor/three.module.min.js";

export function createScene({ canvas, labels, onSelect, reduced }) {
  const renderer = new T.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.setClearColor("#101112");
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.5;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const world = new T.Scene();
  world.fog = new T.Fog("#101112", 24, 48);
  const camera = new T.PerspectiveCamera(30, 1, 0.1, 100);
  const bench = new T.Group();
  world.add(bench);
  const colors = {
    lime: 0xb6f36a,
    mint: 0x81e4cf,
    red: 0xfc806f,
    white: 0xe3e8e4,
  };
  const mat = (color, metalness = 0.35, roughness = 0.4) =>
    new T.MeshStandardMaterial({ color, metalness, roughness });
  const metal = mat(0x777f7c, 0.75, 0.29),
    dark = mat(0x202729, 0.65, 0.36),
    black = mat(0x131719, 0.25, 0.6),
    pale = mat(0xd3d9d3, 0.4, 0.35);
  const lightMat = (color) =>
    new T.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      metalness: 0.15,
      roughness: 0.4,
    });
  const lime = lightMat(colors.lime),
    mint = lightMat(colors.mint),
    red = lightMat(colors.red),
    white = lightMat(colors.white);
  world.add(new T.HemisphereLight(0xe6f0eb, 0x263034, 2.2));
  const key = new T.DirectionalLight(0xfff9e8, 4);
  key.position.set(-8, 15, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 10;
  key.shadow.camera.bottom = -10;
  key.shadow.normalBias = 0.035;
  world.add(key);
  const fill = new T.DirectionalLight(0x9caab8, 2);
  fill.position.set(7, 6, -9);
  world.add(fill);

  // A procedural light room gives metal surfaces reflections without a remote HDR asset.
  const env = new T.Scene();
  env.background = new T.Color(0x222626);
  [
    [-7, 6, 0],
    [7, 7, 0],
    [0, 12, -6],
  ].forEach(([x, y, z]) => {
    const panel = new T.Mesh(
      new T.BoxGeometry(5, 0.15, 8),
      new T.MeshBasicMaterial({ color: 0xffffff }),
    );
    panel.position.set(x, y, z);
    env.add(panel);
  });
  const pmrem = new T.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(env, 0.06);
  world.environment = envMap.texture;
  pmrem.dispose();
  env.traverse((o) => {
    if (o.isMesh) {
      o.geometry.dispose();
      o.material.dispose();
    }
  });

  function box(parent, w, h, d, x, y, z, material = dark) {
    const m = new T.Mesh(new T.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function cylinder(parent, r, h, x, y, z, material = metal, segments = 32) {
    const m = new T.Mesh(new T.CylinderGeometry(r, r, h, segments), material);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function wire(parent, points, color = 0x626b67, width = 0.018) {
    const path = new T.CatmullRomCurve3(
      points.map((p) => new T.Vector3(...p)),
      false,
      "catmullrom",
      0.05,
    );
    const mesh = new T.Mesh(
      new T.TubeGeometry(path, 32, width, 5, false),
      mat(color, 0.7, 0.35),
    );
    parent.add(mesh);
    return path;
  }
  function print(parent, text, x, z, width = 2.4, color = "#afbcb5", y = 0.18) {
    const surface = document.createElement("canvas");
    surface.width = 768;
    surface.height = 96;
    const ctx = surface.getContext("2d");
    ctx.clearRect(0, 0, 768, 96);
    ctx.fillStyle = color;
    ctx.font = "500 36px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 384, 48);
    const texture = new T.CanvasTexture(surface);
    texture.colorSpace = T.SRGBColorSpace;
    const plane = new T.Mesh(
      new T.PlaneGeometry(width, width / 8),
      new T.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      }),
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(x, y, z);
    parent.add(plane);
  }
  box(
    world,
    150,
    0.1,
    150,
    0,
    -0.4,
    0,
    new T.MeshBasicMaterial({ color: 0x101112 }),
  );
  const grid = new T.GridHelper(80, 80, 0x272c2c, 0x202526);
  grid.position.y = -0.33;
  grid.material.transparent = true;
  grid.material.opacity = 0.16;
  world.add(grid);
  box(bench, 11.5, 0.22, 8.7, 0, -0.12, 0, mat(0x353d3b, 0.65, 0.4));
  box(bench, 11.3, 0.08, 8.5, 0, 0.035, 0, black);
  [-5.3, 5.3].forEach((x) =>
    [-3.9, 3.9].forEach((z) => {
      cylinder(bench, 0.065, 0.07, x, 0.11, z, metal, 12);
      box(bench, 0.07, 0.011, 0.009, x, 0.15, z, black);
    }),
  );
  print(bench, "GC / SYSTEMS ENGINEERING", 0, 4.02, 3.9, "#83928b", 0.085);
  print(bench, "OPEN SYSTEMS / 2026", 0, -4.02, 2.6, "#83928b", 0.085);
  // These are four independent systems on one workbench, not an invented integration.
  const stations = [];
  const names = ["Winnow", "TraceGuard", "Agentic SRE", "Toolgen"];
  const ids = ["winnow", "traceguard", "sre", "toolgen"];
  const positions = [
    [-2.8, 0, -2.05],
    [2.8, 0, -2.05],
    [-2.8, 0, 2.05],
    [2.8, 0, 2.05],
  ];
  const accents = [lime, mint, red, white];
  positions.forEach(([x, y, z], i) => {
    const group = new T.Group();
    group.position.set(x, y, z);
    bench.add(group);
    box(group, 4.8, 0.16, 3.4, 0, 0.17, 0, dark);
    box(group, 4.6, 0.035, 3.2, 0, 0.265, 0, black);
    const rail = box(
      group,
      4.7,
      0.045,
      0.025,
      0,
      0.31,
      1.63,
      accents[i].clone(),
    );
    print(
      group,
      `0${i + 1} / ${names[i].toUpperCase()}`,
      0,
      1.37,
      3.0,
      "#bec8c0",
      0.29,
    );
    for (let n = 0; n < 5; n++) {
      box(group, 0.16, 0.015, 0.015, -1.9 + n * 0.22, 0.293, -1.35, metal);
    }
    const label = document.createElement("button");
    label.className = "scene-label";
    label.tabIndex = -1;
    label.setAttribute("aria-label", `Select ${names[i]}`);
    label.innerHTML = `${names[i]}<span>0${i + 1} / ${["CLASSIFY", "OBSERVE", "REMEDIATE", "GENERATE"][i]}</span>`;
    label.onclick = () => onSelect(ids[i]);
    labels.append(label);
    stations.push({
      id: ids[i],
      group,
      rail,
      label,
      paths: [],
      parts: [],
      color: accents[i],
      labelPoint: new T.Vector3(0, 0.1, 1.7),
    });
  });

  // Winnow: incoming documents, a finned local processor, and two routing branches.
  const w = stations[0];
  box(w.group, 1.1, 0.13, 1.4, -1.65, 0.36, 0, metal);
  for (let i = 0; i < 4; i++) {
    const m = box(
      w.group,
      0.8,
      0.035,
      1.05,
      -1.65,
      0.48 + i * 0.09,
      -0.03 + i * 0.04,
      pale,
    );
    m.rotation.y = 0.08 * i;
    box(
      w.group,
      0.5,
      0.008,
      0.025,
      -1.7,
      0.5 + i * 0.09,
      -0.2 + i * 0.04,
      dark,
    );
  }
  box(w.group, 1.4, 0.18, 1.35, 0, 0.38, 0, metal);
  const chip = box(w.group, 1.1, 0.42, 1.02, 0, 0.7, 0, black.clone());
  w.parts.push(chip);
  for (let i = 0; i < 8; i++)
    box(w.group, 0.07, 0.33, 0.95, -0.43 + i * 0.12, 1.05, 0, metal);
  box(w.group, 0.78, 0.025, 0.035, 0, 1.23, 0.37, lime);
  print(w.group, "LOCAL CPU", 0, 0.58, 1, "#b6f36a", 0.485);
  [-0.73, 0.73].forEach((z, i) => {
    box(w.group, 0.9, 0.12, 0.62, 1.66, 0.37, z, metal);
    box(w.group, 0.75, 0.16, 0.48, 1.66, 0.51, z, i ? mint : lime);
  });
  w.paths.push(
    wire(
      w.group,
      [
        [-1.65, 0.65, 0],
        [-0.8, 0.4, 0],
        [0, 0.4, 0],
        [0.7, 0.4, 0],
        [1, 0.4, -0.73],
        [1.65, 0.6, -0.73],
      ],
      colors.lime,
    ),
  );
  w.paths.push(
    wire(
      w.group,
      [
        [-1.65, 0.65, 0],
        [-0.8, 0.4, 0],
        [0, 0.4, 0],
        [0.7, 0.4, 0],
        [1, 0.4, 0.73],
        [1.65, 0.6, 0.73],
      ],
      colors.mint,
    ),
  );

  // TraceGuard: a timed trace strip, a console, and the physically separated review gate.
  const t = stations[1];
  const heights = [0.65, 1.0, 1.5, 1.1];
  heights.forEach((h, i) => {
    const x = -1.65 + i * 0.68;
    box(t.group, 0.48, h, 0.78, x, 0.34 + h / 2, -0.25, metal);
    box(t.group, 0.5, 0.06, 0.81, x, 0.35 + h, -0.25, mint);
    for (let j = 0; j < 4; j++)
      box(t.group, 0.3, 0.025, 0.02, x, 0.42 + j * 0.12, -0.65, black);
    t.parts.push(
      box(t.group, 0.04, 0.055, 0.025, x + 0.12, 0.47, -0.665, mint.clone()),
    );
  });
  box(t.group, 1.15, 0.7, 0.16, 1.38, 0.83, -0.35, metal);
  box(t.group, 0.98, 0.54, 0.025, 1.38, 0.83, -0.445, black);
  for (let i = 0; i < 4; i++)
    box(
      t.group,
      0.36 + i * 0.09,
      0.025,
      0.014,
      1.25 + i * 0.03,
      0.99 - i * 0.105,
      -0.465,
      i % 2 ? mint : pale,
    );
  box(t.group, 0.15, 0.38, 0.25, 1.38, 0.47, -0.32, metal);
  box(t.group, 1.15, 0.09, 0.68, 1.38, 0.34, 0.82, metal);
  box(t.group, 0.85, 0.13, 0.43, 1.38, 0.46, 0.82, red);
  print(t.group, "REVIEW", 1.38, 1.08, 0.94, "#fc806f", 0.29);
  t.paths.push(
    wire(
      t.group,
      [
        [-1.65, 0.46, 0.55],
        [-0.9, 0.46, 0.55],
        [0.4, 0.46, 0.55],
        [1.38, 0.75, -0.35],
      ],
      colors.mint,
    ),
  );
  t.paths.push(
    wire(
      t.group,
      [
        [-1.65, 0.46, 0.55],
        [-0.9, 0.46, 0.55],
        [0.4, 0.46, 0.55],
        [1.38, 0.55, 0.82],
      ],
      colors.red,
    ),
  );

  // SRE: three server bays, telemetry, and the constrained remediation loop.
  const s = stations[2];
  for (let i = 0; i < 3; i++) {
    const x = -1.5 + i * 1.35;
    box(s.group, 0.94, 1.38, 0.98, x, 1.0, -0.1, metal);
    box(s.group, 0.83, 1.27, 0.03, x, 1.0, 0.407, black);
    for (let j = 0; j < 5; j++) {
      box(s.group, 0.65, 0.14, 0.015, x, 0.55 + j * 0.22, 0.435, dark);
      box(
        s.group,
        0.055,
        0.025,
        0.02,
        x + 0.22,
        0.55 + j * 0.22,
        0.453,
        i === 1 ? red : mint,
      );
      for (let k = 0; k < 4; k++)
        box(
          s.group,
          0.03,
          0.009,
          0.02,
          x - 0.22 + k * 0.07,
          0.55 + j * 0.22,
          0.453,
          metal,
        );
    }
    cylinder(s.group, 0.06, 0.08, x, 1.75, -0.1, i === 1 ? red : mint, 12);
  }
  const fan = new T.Group();
  fan.position.set(-1.5, 1.4, 0.465);
  s.group.add(fan);
  for (let i = 0; i < 4; i++) {
    const blade = box(fan, 0.025, 0.19, 0.012, 0, 0.07, 0, metal);
    blade.rotation.z = (i * Math.PI) / 2;
  }
  s.parts.push(fan);
  s.paths.push(
    wire(
      s.group,
      [
        [-1.5, 0.32, 0.95],
        [0, 0.32, 0.95],
        [1.2, 0.32, 0.95],
        [1.75, 0.32, 0.3],
        [1.75, 0.32, -1],
        [-1.5, 0.32, -1],
        [-1.5, 0.32, 0.95],
      ],
      colors.mint,
    ),
  );
  s.paths.push(
    wire(
      s.group,
      [
        [0, 0.32, 0.95],
        [1.2, 0.32, 0.95],
        [1.75, 0.32, 0.3],
        [1.75, 0.32, -1],
        [0, 0.32, -1],
        [0, 1.8, -0.1],
      ],
      colors.red,
    ),
  );

  // Toolgen: connected schema endpoints with a validation rail and a repair return path.
  const g = stations[3];
  const nodes = [
    [-1.7, -0.8],
    [-0.45, -0.8],
    [0.8, -0.8],
    [-1.7, 0.55],
    [-0.45, 0.55],
    [0.8, 0.55],
  ];
  nodes.forEach(([x, z], i) => {
    box(g.group, 0.6, 0.25, 0.6, x, 0.43, z, metal);
    const cube = box(
      g.group,
      0.4,
      0.32,
      0.4,
      x,
      0.74,
      z,
      i === 4 ? white : black,
    );
    g.parts.push(cube);
    box(g.group, 0.25, 0.015, 0.025, x, 0.92, z, white);
  });
  [
    [0, 1],
    [1, 2],
    [0, 3],
    [1, 4],
    [2, 5],
    [3, 4],
    [4, 5],
  ].forEach(([a, b]) =>
    wire(
      g.group,
      [
        [nodes[a][0], 0.34, nodes[a][1]],
        [nodes[b][0], 0.34, nodes[b][1]],
      ],
      0x89938d,
      0.016,
    ),
  );
  box(g.group, 0.38, 1.1, 1.6, 1.82, 0.85, -0.05, metal);
  box(g.group, 0.02, 0.65, 1.3, 1.61, 0.92, -0.05, black);
  for (let i = 0; i < 4; i++)
    box(g.group, 0.026, 0.08, 0.17, 1.58, 0.7 + i * 0.15, -0.18, white);
  g.paths.push(
    wire(
      g.group,
      [
        [-1.7, 0.95, -0.8],
        [-0.45, 0.95, -0.8],
        [-0.45, 0.95, 0.55],
        [0.8, 0.95, 0.55],
        [1.6, 1.0, 0.1],
      ],
      colors.white,
    ),
  );
  g.paths.push(
    wire(
      g.group,
      [
        [-1.7, 0.95, -0.8],
        [-0.45, 0.95, -0.8],
        [0.8, 0.95, -0.8],
        [1.6, 1.0, -0.1],
        [1.6, 0.33, -1.3],
        [-1.7, 0.33, -1.3],
        [-1.7, 0.95, -0.8],
      ],
      colors.red,
    ),
  );

  const componentPositions = [
    [
      ["EMAIL", -1.65, 1.35, 0],
      ["LOCAL CPU", 0, 2.1, 0],
      ["LLM FALLBACK", 1.66, 1.25, 0.73],
    ],
    [
      ["TRACE STORE", -0.7, 2.3, -0.25],
      ["CONSOLE", 1.38, 1.75, -0.35],
      ["REVIEW GATE", 1.38, 1.1, 0.82],
    ],
    [
      ["WATCHDOG", -1.5, 2.35, -0.1],
      ["ALERT", 0, 2.35, -0.1],
      ["REMEDIATION", 1.2, 2.35, -0.1],
    ],
    [
      ["TOOL SCHEMAS", -1.7, 1.7, -0.8],
      ["CONNECTED CHAIN", -0.45, 1.7, 0.55],
      ["VALIDATION", 1.82, 1.9, -0.05],
    ],
  ];
  stations.forEach((st, i) => {
    st.components = [];
    st.group.traverse((obj) => {
      if (obj.geometry?.type === "BoxGeometry" && obj.position.y > 0.4) {
        st.components.push({
          mesh: obj,
          base: obj.position.clone(),
          lift: Math.min(1.1, Math.max(0.15, (obj.position.y - 0.3) * 0.8)),
        });
      }
    });
    st.detailLabels = componentPositions[i].map(([text, x, y, z]) => {
      const el = document.createElement("span");
      el.className = "component-label";
      el.textContent = text;
      el.hidden = true;
      labels.append(el);
      return { el, point: new T.Vector3(x, y, z) };
    });
  });
  const packets = [];
  stations.forEach((station, i) => {
    for (let n = 0; n < 3; n++) {
      const mesh = box(
        station.group,
        0.08,
        0.08,
        0.08,
        0,
        0,
        0,
        station.color.clone(),
      );
      packets.push({ mesh, station, offset: n / 3, speed: 0.13 + i * 0.015 });
    }
    station.group.traverse((obj) => {
      if (obj.isMesh) obj.userData.project = station.id;
    });
  });
  let active = "winnow",
    execution = -1,
    branch = 0,
    paused = reduced,
    orbiting = false,
    focused = false,
    exploded = false,
    explodeMix = 0,
    stepStart = 0,
    elapsed = 0,
    visible = true;
  let desiredPos = new T.Vector3(),
    desiredTarget = new T.Vector3(),
    target = new T.Vector3();
  const home = new T.Vector3(8, 9, 12);
  const raycaster = new T.Raycaster(),
    pointer = new T.Vector2(),
    projected = new T.Vector3();
  let pointerDown;
  canvas.addEventListener("pointerdown", (e) => {
    pointerDown = { x: e.clientX, y: e.clientY };
  });
  canvas.addEventListener("pointerup", (e) => {
    if (
      !pointerDown ||
      Math.hypot(e.clientX - pointerDown.x, e.clientY - pointerDown.y) > 8
    )
      return;
    const r = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster
      .intersectObjects(bench.children, true)
      .find(
        (h) =>
          h.object.userData.project &&
          (!focused || h.object.userData.project === active),
      );
    if (hit) onSelect(hit.object.userData.project);
  });
  canvas.addEventListener("pointermove", (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      (-(e.clientY - r.top) / r.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    canvas.style.cursor = raycaster
      .intersectObjects(bench.children, true)
      .some(
        (h) =>
          h.object.userData.project &&
          (!focused || h.object.userData.project === active),
      )
      ? "pointer"
      : "default";
  });

  function resize() {
    const { width, height } = canvas.getBoundingClientRect();
    camera.aspect = width / height;
    renderer.setSize(width, height, false);
    camera.updateProjectionMatrix();
    const fit = camera.aspect < 1.1 ? 1.5 : camera.aspect < 1.5 ? 1.3 : 1;
    home.set(8 * fit, 9 * fit, 12 * fit);
    if (!focused) camera.position.copy(home);
    draw(0);
  }
  function select(id) {
    active = id;
    execution = -1;
    branch = 0;
    stations.forEach((st) => {
      const selected = st.id === id;
      st.label.classList.toggle("active", selected);
      st.rail.material.emissiveIntensity = selected ? 1.2 : 0.1;
      st.rail.material.color.set(selected ? st.color.color : 0x64746e);
    });
  }
  function draw(dt) {
    const station = stations.find((st) => st.id === active);
    if (!paused) elapsed += dt;
    if (orbiting && !paused) bench.rotation.y += dt * 0.085;
    if (!orbiting)
      bench.rotation.y = T.MathUtils.damp(
        bench.rotation.y,
        0,
        8,
        reduced ? 1 : dt,
      );
    explodeMix = T.MathUtils.damp(
      explodeMix,
      exploded ? 1 : 0,
      6,
      reduced ? 1 : dt,
    );
    stations.forEach((st) =>
      st.components.forEach(({ mesh, base, lift }) => {
        mesh.position.copy(base);
        mesh.position.y += st.id === active ? lift * explodeMix : 0;
      }),
    );
    stations.forEach((st) => {
      st.group.visible = !focused || st.id === active;
    });
    bench.children.forEach((obj) => {
      if (obj.isMesh) obj.visible = !focused;
    });
    const selectedPos = station.group.getWorldPosition(new T.Vector3());
    desiredTarget.copy(focused ? selectedPos : new T.Vector3(0, 0.3, 0));
    if (focused) desiredTarget.y += 0.65;
    desiredPos.copy(
      focused ? selectedPos.clone().add(new T.Vector3(6, 7, 9)) : home,
    );
    const lerp = reduced ? 1 : 1 - Math.exp(-dt * 5);
    camera.position.lerp(desiredPos, lerp);
    target.lerp(desiredTarget, lerp);
    camera.lookAt(target);
    packets.forEach((p) => {
      const selected = p.station.id === active;
      const path = p.station.paths[selected ? branch : 0];
      const phase =
        selected && execution >= 0
          ? Math.min(
              1,
              (execution + Math.min(1, (elapsed - stepStart) / 0.68)) / 4 +
                p.offset * 0.045,
            )
          : (elapsed * p.speed + p.offset) % 1;
      p.mesh.position.copy(path.getPoint(phase));
      p.mesh.visible = !focused || selected;
      p.mesh.material.emissiveIntensity = selected ? 1.5 : 0.2;
      p.mesh.scale.setScalar(selected && execution >= 0 ? 1.8 : 1);
    });
    w.parts[0].material.emissive.set(
      execution >= 0 && active === "winnow" ? colors.lime : 0x000000,
    );
    w.parts[0].material.emissiveIntensity = 0.12;
    t.parts.forEach((part, i) => {
      part.material.emissiveIntensity =
        0.3 + (Math.sin(elapsed * 2 - i) + 1) * 0.3;
    });
    if (!paused) s.parts[0].rotation.z += dt * 2;
    stations.forEach((st) => {
      const point = st.group.localToWorld(st.labelPoint.clone());
      projected.copy(point).project(camera);
      st.label.style.left = `${(projected.x * 0.5 + 0.5) * canvas.clientWidth}px`;
      st.label.style.top = `${(-projected.y * 0.5 + 0.5) * canvas.clientHeight}px`;
      st.label.hidden =
        (focused && st.id !== active) ||
        Math.abs(projected.x) > 0.92 ||
        Math.abs(projected.y) > 0.92;
      st.detailLabels.forEach(({ el, point }) => {
        projected
          .copy(
            st.group.localToWorld(
              point.clone().add(new T.Vector3(0, explodeMix * 0.6, 0)),
            ),
          )
          .project(camera);
        el.style.left = `${(projected.x * 0.5 + 0.5) * canvas.clientWidth}px`;
        el.style.top = `${(-projected.y * 0.5 + 0.5) * canvas.clientHeight}px`;
        el.hidden =
          !focused ||
          st.id !== active ||
          Math.abs(projected.x) > 0.9 ||
          Math.abs(projected.y) > 0.9;
      });
    });
    renderer.render(world, camera);
  }
  const observer = new ResizeObserver(resize);
  observer.observe(canvas.parentElement);
  const viewObserver = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  viewObserver.observe(canvas);
  let last = performance.now(),
    lastDraw = 0;
  renderer.setAnimationLoop((now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (document.hidden || !visible) return;
    // Limit the scene to 30 fps, and idle rendering to 8 fps when motion is paused.
    if (now - lastDraw < (paused ? 125 : 33)) return;
    const frameDt = Math.min((now - lastDraw) / 1000, 0.15);
    lastDraw = now;
    draw(frameDt || dt);
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    renderer.setAnimationLoop(null);
    canvas.hidden = true;
    document.querySelector("#scene-fallback").hidden = false;
    labels.hidden = true;
    document.documentElement.dataset.scene = "fallback";
  });
  select("winnow");
  resize();
  return {
    select,
    setMotion(options) {
      paused = options.paused;
      orbiting = options.orbiting;
      focused = options.focused;
      exploded = options.exploded;
      reduced = options.reduced;
    },
    setExecution(step, nextBranch) {
      execution = step;
      branch = nextBranch;
      stepStart = elapsed;
    },
    reset() {
      bench.rotation.y = 0;
      elapsed = 0;
      execution = -1;
      branch = 0;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      viewObserver.disconnect();
      world.traverse((o) => {
        if (o.isMesh) {
          o.geometry.dispose();
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
      envMap.dispose();
      renderer.dispose();
    },
  };
}
