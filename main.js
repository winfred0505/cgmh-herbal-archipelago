/**
 * 長庚中藥群島 (CGMH Herbal Archipelago) — 3D 互動微縮城市主引擎
 * 架構依據：REA 逆向工程分析「HEART 政策島」(https://puma.taipei/heart-island)
 * 內容依據：《中醫藥劑部人員及業務介紹(含各院區主管人員).pptx》
 * 3D 素材整合：D:\Users\User\Desktop\3D素材 (Characters, Nature Kit, Animals, Birds, Insects)
 */
(function () {
  "use strict";

  const DATA = window.CGMH_TCM_ARCHIPELAGO_DATA;
  if (!DATA) {
    console.error("Missing CGMH_TCM_ARCHIPELAGO_DATA");
    return;
  }

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // =========================================================================
  // 1. 音效合成器 (Web Audio API 零外部依賴)
  // =========================================================================
  const AudioFX = (function () {
    let ctx = null;
    let enabled = true;
    function getCtx() {
      if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
        ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (ctx && ctx.state === "suspended") ctx.resume();
      return ctx;
    }
    return {
      toggle() {
        enabled = !enabled;
        return enabled;
      },
      click(freq = 760) {
        if (!enabled) return;
        try {
          const c = getCtx();
          if (!c) return;
          const o = c.createOscillator();
          const g = c.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(freq, c.currentTime);
          o.frequency.exponentialRampToValueAtTime(freq * 1.45, c.currentTime + 0.065);
          g.gain.setValueAtTime(0.045, c.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.065);
          o.connect(g);
          g.connect(c.destination);
          o.start();
          o.stop(c.currentTime + 0.065);
        } catch (e) {}
      },
      chime(ok = true) {
        if (!enabled) return;
        try {
          const c = getCtx();
          if (!c) return;
          const notes = ok ? [523.25, 659.25, 783.99, 1046.5] : [300, 220];
          notes.forEach((f, i) => {
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = ok ? "triangle" : "sawtooth";
            o.frequency.setValueAtTime(f, c.currentTime + i * 0.065);
            g.gain.setValueAtTime(0.06, c.currentTime + i * 0.065);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.065 + 0.25);
            o.connect(g);
            g.connect(c.destination);
            o.start(c.currentTime + i * 0.065);
            o.stop(c.currentTime + i * 0.065 + 0.25);
          });
        } catch (e) {}
      }
    };
  })();

  // =========================================================================
  // 2. 政策島 (HEART Island) 核心六角幾何與程序化材質系統
  // =========================================================================
  const R = 2.25;          // 六角島外接圓半徑 (Pointy-top hexagon)
  const SPACING = 3.15;    // 六角軸向間距 (拉大島嶼間距，讓海域與跨海拱橋視野更寬闊不擁擠)
  const TOP = 0.68;        // 島嶼頂面高度
  const WATER_Y = -0.18;   // 海平面高度
  const RING_R = 1.98;     // 環島步道半徑
  const SQ3 = Math.sqrt(3);
  const NEIGHBORS = [
    [1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]
  ];

  function mulberry(a) {
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const mulberry32 = mulberry;

  function axialToWorld(q, r) {
    return new THREE.Vector3(
      SQ3 * SPACING * (q + r / 2),
      TOP,
      1.5 * SPACING * r - 1.2
    );
  }

  function hexVertex(cx, cz, radius, k) {
    const a = Math.PI / 2 + (k * Math.PI) / 3;
    return [cx + Math.cos(a) * radius, cz + Math.sin(a) * radius];
  }

  const GROUND_TONE = {
    granite: 0xd9cbb4,
    lawn: 0xb9cd98,
    gravel: 0xc7b08f,
    street: 0xcfc3b2,
    meadow: 0xbccf9c,
    terracotta: 0xdcb79a,
    garden: 0xb4c993,
    forest: 0x9fb683,
    rubber: 0xe2a46f,
    boardwalk: 0xc9a27c,
    schoolyard: 0xc9785a,
    farmland: 0xa9b878,
    softpad: 0xb9d6e6,
    courtyard: 0xe6c79c
  };

  const CLIFF_PALETTE = {
    default: [0xb98c68, 0xa77b59, 0x977059, 0x8f8172],
    civil: [0xcbbfae, 0xb9ab97, 0xa89a86, 0x928676],
    institute: [0xbfc8c2, 0xaab5ae, 0x98a39d, 0x86908a],
    forest: [0x7d8a5a, 0x8a6e52, 0x775f48, 0x6a5747],
    youth: [0xe0a77c, 0xd59670, 0xc98a66, 0xb37a5c],
    sport: [0xb79572, 0xa9845f, 0x9a7655, 0x8a6a4e],
    education: [0xc77b5c, 0xb86e52, 0xa86449, 0x8f7564],
    lunch: [0x7a5a42, 0x6c4f3a, 0x5f4533, 0x7d7064],
    family: [0xe7c9b8, 0xdcb8a6, 0xcfa996, 0xa89484],
    card: [0xd08a64, 0xc27c58, 0xb26f4f, 0x9a7a66],
    welfare: [0x8d9b6a, 0x9a7e5e, 0x8a6f52, 0x7d7468],
    transport: [0xa7a29b, 0x96918a, 0x86817a, 0x77736d],
    hakka: [0xd97f54, 0xc26d45, 0xa85b38, 0x8c6d58]
  };

  // 建立政策島風格程序化地表紋理 (256x256 CanvasTexture)
  const textureCache = new Map();
  function makeGroundTexture(type) {
    if (textureCache.has(type)) return textureCache.get(type);
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    const rnd = mulberry(type.length * 97 + 11);
    const baseHex = GROUND_TONE[type] || GROUND_TONE.lawn;
    g.fillStyle = "#" + baseHex.toString(16).padStart(6, "0");
    g.fillRect(0, 0, 256, 256);

    const speck = (n, cols, rmin, rmax, a = 1) => {
      for (let i = 0; i < n; i++) {
        g.globalAlpha = a * (0.4 + rnd() * 0.6);
        g.fillStyle = cols[Math.floor(rnd() * cols.length)];
        g.beginPath();
        g.arc(rnd() * 256, rnd() * 256, rmin + rnd() * (rmax - rmin), 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    };

    const tiles = (sz, grout, cols) => {
      for (let y = 0; y < 256; y += sz) {
        for (let x = 0; x < 256; x += sz) {
          g.fillStyle = cols[Math.floor(rnd() * cols.length)];
          g.fillRect(x + 1, y + 1, sz - 2, sz - 2);
        }
      }
      g.strokeStyle = grout;
      g.lineWidth = 2;
      for (let i = 0; i <= 256; i += sz) {
        g.beginPath();
        g.moveTo(i, 0); g.lineTo(i, 256);
        g.moveTo(0, i); g.lineTo(256, i);
        g.stroke();
      }
    };

    if (type === "granite" || type === "courtyard") {
      tiles(32, "#bfae95", type === "courtyard" ? ["#f2dfc1", "#ebd4b0", "#f6e7ce"] : ["#dccfb8", "#d6c7ae", "#e0d3bd"]);
      speck(360, ["#b8a68b", "#efe4d2"], 0.5, 1.2, 0.5);
    } else if (type === "street") {
      tiles(24, "#b3a796", ["#d0c4b3", "#c8bba8", "#d6cbbb"]);
    } else if (type === "terracotta") {
      tiles(28, "#b98d6f", ["#dcb79a", "#d4ab8c", "#e1c0a4"]);
    } else if (type === "boardwalk") {
      for (let y = 0; y < 256; y += 16) {
        g.fillStyle = ["#c9a27c", "#bf9771", "#d1ab86"][Math.floor(rnd() * 3)];
        g.fillRect(0, y + 1, 256, 14);
      }
    } else if (type === "farmland") {
      for (let y = 0; y < 256; y += 18) {
        g.fillStyle = (y / 18) % 2 ? "#9c7a5a" : "#a9c47f";
        g.fillRect(0, y, 256, 18);
      }
      speck(500, ["#8fb37a", "#7f9a6a"], 0.6, 1.5, 0.7);
    } else if (type === "softpad") {
      for (let y = 0; y < 256; y += 32) {
        for (let x = 0; x < 256; x += 32) {
          g.fillStyle = ["#cfe4f2", "#f6dce2", "#f9ebb8", "#d4ebd4"][((x + y) / 32) % 4];
          g.fillRect(x + 1, y + 1, 30, 30);
        }
      }
    } else {
      speck(2400, ["#a9bf8e", "#c7d7a8", "#9fb684", "#b5c995"], 0.5, 1.5, 0.55);
      speck(70, ["#f3e7a6", "#ffffff", "#f2c4b2"], 0.9, 1.7, 0.85);
    }

    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    textureCache.set(type, tex);
    return tex;
  }

  // 建立政策島式分層岩壁六角島體 (Stratified Hex Cliff Geometry)
  function createStratifiedCliffMesh(cx, cz, radius, yTop, yBot, cliffKey, seed) {
    const segH = 6, segV = 5;
    const positions = [];
    const colors = [];
    const indices = [];
    const rnd = mulberry(seed);
    const strata = (CLIFF_PALETTE[cliffKey] || CLIFF_PALETTE.default).map((h) => new THREE.Color(h));

    for (let edge = 0; edge < 6; edge++) {
      const [ax, az] = hexVertex(0, 0, radius, edge);
      const [bx, bz] = hexVertex(0, 0, radius, edge + 1);
      const baseIdx = positions.length / 3;

      for (let j = 0; j <= segV; j++) {
        const v = j / segV;
        const y = yTop + (yBot - yTop) * v;
        const flare = 1 + v * 0.08 + Math.sin(v * Math.PI) * 0.03;
        const cRow = strata[Math.min(strata.length - 1, Math.floor(v * strata.length))];

        for (let i = 0; i <= segH; i++) {
          const u = i / segH;
          const px = (ax + (bx - ax) * u) * flare;
          const pz = (az + (bz - az) * u) * flare;
          const jitter = (j > 0 && j < segV && i > 0 && i < segH) ? (rnd() - 0.5) * 0.06 : 0;
          positions.push(px + jitter, y, pz + jitter);
          const shade = 0.94 + (rnd() - 0.5) * 0.1;
          colors.push(cRow.r * shade, cRow.g * shade, cRow.b * shade);
        }
      }

      for (let j = 0; j < segV; j++) {
        for (let i = 0; i < segH; i++) {
          const a = baseIdx + j * (segH + 1) + i;
          const b = a + 1;
          const c = a + (segH + 1);
          const d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.88,
      metalness: 0.04,
      flatShading: true
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cx, 0, cz);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // =========================================================================
  // 3. Three.js 場景、光影、天空穹頂與台灣山海盆地初始化
  // =========================================================================
  const stage = $("#stage");
  const labelsContainer = $("#labels");
  const tooltip = $("#tooltip");

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xf4eee3, 38, 135);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.02;
  stage.insertBefore(renderer.domElement, labelsContainer);

  const camera = new THREE.PerspectiveCamera(34, stage.clientWidth / stage.clientHeight, 0.4, 260);
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.maxPolarAngle = THREE.MathUtils.degToRad(72);
  controls.minPolarAngle = THREE.MathUtils.degToRad(14);
  controls.minDistance = 4.5;
  controls.maxDistance = 82;

  // 計算 13 島幾何中心
  const islandCenters = new Map();
  const cityCenter = new THREE.Vector3();
  DATA.islands.forEach((isl) => {
    const c = axialToWorld(isl.q, isl.r);
    islandCenters.set(isl.id, c);
    cityCenter.add(c);
  });
  cityCenter.divideScalar(DATA.islands.length);

  // 預設全景鏡頭位置 (配合加寬的群島間距微調遠近)
  const OVERVIEW_TARGET = cityCenter.clone().add(new THREE.Vector3(0, 0.2, 0.5));
  const OVERVIEW_POS = cityCenter.clone().add(new THREE.Vector3(19.5, 26.5, 30.5));
  camera.position.copy(OVERVIEW_POS);
  controls.target.copy(OVERVIEW_TARGET);
  controls.update();

  // 天空穹頂 Shader (對齊政策島 environment.js)
  const skyUniforms = {
    uTop: { value: new THREE.Color(0x9fd0ec) },
    uHorizon: { value: new THREE.Color(0xf4eee3) },
    uSun: { value: new THREE.Color(0xfff1de) },
    uSunDir: { value: new THREE.Vector3(0.4, 0.8, 0.3) },
    uNight: { value: 0.0 }
  };
  const skyMat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: skyUniforms,
    vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform vec3 uTop, uHorizon, uSun, uSunDir;
      uniform float uNight;
      varying vec3 vDir;
      float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719)))*43758.5453); }
      void main(){
        float h = clamp(vDir.y, -0.2, 1.0);
        vec3 col = mix(uHorizon, uTop, smoothstep(-0.02, 0.55, h));
        float sd = max(dot(normalize(vDir), normalize(uSunDir)), 0.0);
        col += uSun * pow(sd, 16.0) * 0.32 * (1.0 - uNight * 0.6);
        vec3 cell = floor(vDir * 170.0);
        float star = step(0.9965, hash(cell)) * smoothstep(0.08, 0.5, h) * uNight;
        col += vec3(star * 0.85);
        gl_FragColor = vec4(col, 1.0);
      }
    `
  });
  const skyDome = new THREE.Mesh(new THREE.SphereGeometry(240, 32, 16), skyMat);
  skyDome.position.copy(cityCenter);
  scene.add(skyDome);

  // 光源系統
  const hemiLight = new THREE.HemisphereLight(0xeef6fa, 0x8f8270, 0.95);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff1de, 1.35);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  Object.assign(sunLight.shadow.camera, { left: -32, right: 32, top: 34, bottom: -34, near: 1, far: 105 });
  sunLight.shadow.bias = -0.0005;
  sunLight.target.position.copy(cityCenter);
  scene.add(sunLight, sunLight.target);

  const fillLight = new THREE.DirectionalLight(0xbfd6ff, 0.35);
  fillLight.position.set(cityCenter.x + 22, 18, cityCenter.z - 22);
  scene.add(fillLight);

  // 海床底層 (讓半透明海水下的魚群、海龜、鬼蝠魟清晰呈現溫暖淺海層次)
  const seabedMesh = new THREE.Mesh(
    new THREE.CircleGeometry(240, 64),
    new THREE.MeshBasicMaterial({ color: 0x7ab8c4 })
  );
  seabedMesh.rotation.x = -Math.PI / 2;
  seabedMesh.position.set(cityCenter.x, WATER_Y - 0.36, cityCenter.z);
  scene.add(seabedMesh);

  // 海面波光 Shader (略帶清澈微透感，方便觀察水中生物游動與躍出水面)
  const waterUniforms = {
    uColor: { value: new THREE.Color(0xa4d4da) },
    uDeep: { value: new THREE.Color(0x6fa9b8) },
    uTime: { value: 0 },
    uNight: { value: 0 },
    uCenter: { value: new THREE.Vector2(cityCenter.x, cityCenter.z) }
  };
  const waterMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: waterUniforms,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `
      uniform vec3 uColor, uDeep;
      uniform float uTime, uNight;
      uniform vec2 uCenter;
      varying vec3 vW;
      void main(){
        float d = length(vW.xz - uCenter);
        float w1 = sin(vW.x * 0.38 + uTime * 0.45 + sin(vW.z * 0.28)) * sin(vW.z * 0.33 - uTime * 0.32);
        float w2 = sin((vW.x * 0.55 + vW.z) * 1.05 + uTime * 0.75) * sin(vW.x * 0.85 - vW.z * 0.42);
        vec3 col = mix(uColor, uDeep, smoothstep(8.0, 42.0, d) * 0.55);
        col += w1 * 0.02 + w2 * 0.008;
        float glint = smoothstep(0.96, 1.0, w2 * 0.5 + 0.5) * 0.06 * (1.0 - uNight) * (1.0 - smoothstep(16.0, 42.0, d));
        col += glint;
        gl_FragColor = vec4(col, 0.85);
      }
    `
  });
  const waterMesh = new THREE.Mesh(new THREE.CircleGeometry(240, 64), waterMat);
  waterMesh.rotation.x = -Math.PI / 2;
  waterMesh.position.set(cityCenter.x, WATER_Y, cityCenter.z);
  scene.add(waterMesh);

  // =========================================================================
  // 4. 建造 13 座台灣縣市六角島、跨海拱橋与 54 座微縮建築
  // =========================================================================
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  const pickables = [];
  const islandGroups = new Map();
  const buildingGroups = new Map();
  const glowMaterials = [];
  const animatedProps = [];

  // 共用材質庫
  const MAT = {
    cream: new THREE.MeshStandardMaterial({ color: 0xfff8f0, roughness: 0.75, flatShading: true }),
    coral: new THREE.MeshStandardMaterial({ color: 0xdb6a41, roughness: 0.62, flatShading: true }),
    coralDark: new THREE.MeshStandardMaterial({ color: 0xa34e34, roughness: 0.7, flatShading: true }),
    ink: new THREE.MeshStandardMaterial({ color: 0x262121, roughness: 0.65, flatShading: true }),
    wood: new THREE.MeshStandardMaterial({ color: 0xb48560, roughness: 0.75, flatShading: true }),
    woodDark: new THREE.MeshStandardMaterial({ color: 0x7a563b, roughness: 0.82, flatShading: true }),
    teal: new THREE.MeshStandardMaterial({ color: 0x3e7c8c, roughness: 0.55, flatShading: true }),
    green: new THREE.MeshStandardMaterial({ color: 0x5e9a6f, roughness: 0.7, flatShading: true }),
    gold: new THREE.MeshStandardMaterial({ color: 0xe8b944, roughness: 0.45, metalness: 0.25, flatShading: true }),
    stone: new THREE.MeshStandardMaterial({ color: 0xc9bba8, roughness: 0.85, flatShading: true }),
    glass: new THREE.MeshStandardMaterial({ color: 0x9ecbd4, roughness: 0.2, metalness: 0.3, transparent: true, opacity: 0.78 }),
    foliage1: new THREE.MeshStandardMaterial({ color: 0x86ad6a, roughness: 0.82, flatShading: true }),
    foliage2: new THREE.MeshStandardMaterial({ color: 0x9cc27a, roughness: 0.8, flatShading: true }),
    windowGlow: new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffb74d, emissiveIntensity: 0.2, roughness: 0.3 }),
    lanternGlow: new THREE.MeshStandardMaterial({ color: 0xffd166, emissive: 0xff7b00, emissiveIntensity: 0.35, roughness: 0.25 })
  };
  glowMaterials.push(MAT.windowGlow, MAT.lanternGlow);

  // 建立單座六角島嶼
  const islandCoordMap = new Map();
  DATA.islands.forEach((isl) => {
    islandCoordMap.set(`${isl.q},${isl.r}`, isl);
  });

  DATA.islands.forEach((isl, idx) => {
    const c = islandCenters.get(isl.id);
    const g = new THREE.Group();
    g.name = `island_${isl.id}`;
    worldGroup.add(g);
    islandGroups.set(isl.id, g);

    // 1) 淺灘水環 (Shallow Reef Ring)
    const shallowGeo = new THREE.CylinderGeometry(R * 1.12, R * 1.18, 0.08, 6);
    const shallowMat = new THREE.MeshStandardMaterial({
      color: isl.id === "headquarters" ? 0xf7d794 : 0xa9d6d9,
      roughness: 0.6,
      transparent: true,
      opacity: 0.65
    });
    const shallowMesh = new THREE.Mesh(shallowGeo, shallowMat);
    shallowMesh.position.set(c.x, WATER_Y + 0.02, c.z);
    g.add(shallowMesh);

    // 2) 分層岩壁基座 (Stratified Cliff)
    const cliffMesh = createStratifiedCliffMesh(c.x, c.z, R, TOP, WATER_Y - 0.25, isl.cliffTone, (idx + 1) * 37);
    cliffMesh.userData = { pickType: "island", island: isl };
    pickables.push(cliffMesh);
    g.add(cliffMesh);

    // 3) 外圍環島步道盤 (Walking Ring Cap)
    const ringGeo = new THREE.CylinderGeometry(R * 0.995, R * 0.995, 0.06, 6);
    const ringMat = new THREE.MeshStandardMaterial({
      color: isl.ringTint || 0xe3d3b8,
      roughness: 0.82,
      flatShading: true
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.set(c.x, TOP - 0.01, c.z);
    ringMesh.receiveShadow = true;
    ringMesh.userData = { pickType: "island", island: isl };
    pickables.push(ringMesh);
    g.add(ringMesh);

    // 4) 內層程序化紋理草地／地磚面 (Inner Ground Surface)
    const topGeo = new THREE.CylinderGeometry(R * 0.88, R * 0.88, 0.07, 6);
    const topMat = new THREE.MeshStandardMaterial({
      map: makeGroundTexture(isl.ground),
      roughness: 0.85
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.set(c.x, TOP + 0.01, c.z);
    topMesh.receiveShadow = true;
    topMesh.userData = { pickType: "island", island: isl };
    pickables.push(topMesh);
    g.add(topMesh);

    // 部務室中樞島金色光環裝飾
    if (isl.id === "headquarters") {
      const haloGeo = new THREE.RingGeometry(R * 0.9, R * 0.97, 6);
      haloGeo.rotateX(-Math.PI / 2);
      haloGeo.rotateY(Math.PI / 6);
      const haloMesh = new THREE.Mesh(haloGeo, MAT.gold);
      haloMesh.position.set(c.x, TOP + 0.05, c.z);
      g.add(haloMesh);
    }

    // 5) 六角頂點微縮路燈與花圃 (對齊政策島 decor.js)
    for (let k = 0; k < 6; k++) {
      const [vx, vz] = hexVertex(c.x, c.z, RING_R, k);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.38, 8), MAT.ink);
      post.position.set(vx, TOP + 0.2, vz);
      post.castShadow = true;
      g.add(post);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), MAT.lanternGlow);
      bulb.position.set(vx, TOP + 0.4, vz);
      g.add(bulb);
    }

    // 6) 建造島上各座業務微縮建築 (Miniature Policy/Pharmacy Buildings)
    isl.buildings.forEach((bldg) => {
      const bx = c.x + bldg.lx;
      const bz = c.z + bldg.lz;
      const bGroup = buildMiniatureBuilding(bldg, isl);
      bGroup.position.set(bx, TOP + 0.04, bz);
      bGroup.traverse((ch) => {
        if (ch.isMesh) {
          ch.userData = { pickType: "building", building: bldg, island: isl };
          pickables.push(ch);
        }
      });
      g.add(bGroup);
      buildingGroups.set(bldg.id, {
        group: bGroup,
        worldPos: new THREE.Vector3(bx, TOP + 0.65 * (bldg.size || 0.75), bz),
        building: bldg,
        island: isl
      });
    });
  });

  // 7) 自動偵測相鄰六角島並建造跨海微縮拱橋 (Bridges) 與紀錄橋樑連通圖
  const builtBridgePairs = new Set();
  const bridgeAdj = new Map();
  DATA.islands.forEach((isl) => bridgeAdj.set(isl.id, []));

  DATA.islands.forEach((islA) => {
    NEIGHBORS.forEach(([dq, dr]) => {
      const keyB = `${islA.q + dq},${islA.r + dr}`;
      const islB = islandCoordMap.get(keyB);
      if (!islB) return;
      bridgeAdj.get(islA.id).push(islB.id);
      const pairKey = [islA.id, islB.id].sort().join("--");
      if (builtBridgePairs.has(pairKey)) return;
      builtBridgePairs.add(pairKey);
      buildArchBridge(islandCenters.get(islA.id), islandCenters.get(islB.id), islA.id === "headquarters" || islB.id === "headquarters");
    });
  });

  function getBridgeArcPoints(posA, posB) {
    const mid = posA.clone().add(posB).multiplyScalar(0.5);
    const dir = posB.clone().sub(posA);
    const dist = dir.length();
    const dirN = dir.clone().normalize();
    const bridgeLen = Math.max(0.65, dist - R * 1.66);
    const pts = [];
    const steps = 8;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps - 0.5; // -0.5 -> +0.5
      const archY = Math.cos(t * Math.PI) * 0.14;
      const p = mid.clone().addScaledVector(dirN, t * bridgeLen);
      p.y = TOP + 0.065 + archY;
      pts.push(p);
    }
    return pts;
  }

  function findBridgePath(startId, endId) {
    if (startId === endId) return [startId];
    const queue = [[startId]];
    const visited = new Set([startId]);
    while (queue.length) {
      const path = queue.shift();
      const cur = path[path.length - 1];
      for (const nxt of bridgeAdj.get(cur) || []) {
        if (visited.has(nxt)) continue;
        const nextPath = [...path, nxt];
        if (nxt === endId) return nextPath;
        visited.add(nxt);
        queue.push(nextPath);
      }
    }
    return [startId];
  }

  function buildArchBridge(posA, posB, isHqBridge) {
    const mid = posA.clone().add(posB).multiplyScalar(0.5);
    const dir = posB.clone().sub(posA);
    const dist = dir.length();
    const bridgeLen = Math.max(0.65, dist - R * 1.66);
    const angle = Math.atan2(dir.x, dir.z);

    const bGroup = new THREE.Group();
    bGroup.position.set(mid.x, TOP + 0.04, mid.z);
    bGroup.rotation.y = angle;

    const segs = 7;
    for (let i = 0; i < segs; i++) {
      const t = (i + 0.5) / segs - 0.5;
      const archY = Math.cos(t * Math.PI) * 0.14;
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.045, bridgeLen / segs + 0.02),
        isHqBridge ? MAT.coral : MAT.wood
      );
      plank.position.set(0, archY, t * bridgeLen);
      plank.castShadow = true;
      bGroup.add(plank);
    }

    for (const side of [-0.19, 0.19]) {
      const rail = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.035, bridgeLen),
        isHqBridge ? MAT.gold : MAT.cream
      );
      rail.position.set(side, 0.19, 0);
      bGroup.add(rail);
      for (const endZ of [-bridgeLen * 0.45, 0, bridgeLen * 0.45]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.04), MAT.cream);
        post.position.set(side, 0.11, endZ);
        bGroup.add(post);
      }
    }
    worldGroup.add(bGroup);
  }

  // =========================================================================
  // 5. 政策島風格微縮建築工廠 (createPolicyModel 對齊實作)
  // =========================================================================
  function buildMiniatureBuilding(bldg, isl) {
    const g = new THREE.Group();
    const s = (bldg.size || 0.72) * 0.78;
    const kind = bldg.kind || "hospital";

    // 地基小襯墊
    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56 * s, 0.58 * s, 0.04, 8),
      MAT.stone
    );
    pad.position.y = 0.02;
    pad.receiveShadow = true;
    g.add(pad);

    const addBox = (w, h, d, x, y, z, mat) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w * s, h * s, d * s), mat);
      m.position.set(x * s, y * s, z * s);
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
      return m;
    };

    const addHipRoof = (w, h, d, x, y, z, mat = MAT.coral) => {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 4), mat);
      cone.rotation.y = Math.PI / 4;
      cone.scale.set(w * Math.SQRT2 * s, h * s, d * Math.SQRT2 * s);
      cone.position.set(x * s, (y + h * 0.5) * s, z * s);
      cone.castShadow = true;
      g.add(cone);
    };

    if (kind === "clocktower") {
      // 陳立偉：北院區業務綜理指揮鐘塔
      addBox(0.75, 0.45, 0.65, 0, 0.24, 0, MAT.cream);
      addHipRoof(0.84, 0.22, 0.74, 0, 0.46, 0, MAT.coral);
      addBox(0.36, 0.92, 0.36, 0, 0.5, 0, MAT.cream);
      addHipRoof(0.46, 0.28, 0.46, 0, 0.96, 0, MAT.coralDark);
      const face = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.14 * s, 0.04 * s, 16), MAT.windowGlow);
      face.rotation.x = Math.PI / 2;
      face.position.set(0, 0.78 * s, 0.19 * s);
      g.add(face);
    } else if (kind === "cityhall") {
      // 雙翼市政／行政辦公大樓 (陳貴福／台北／大同)
      addBox(0.88, 0.52, 0.54, 0, 0.28, 0, MAT.cream);
      addBox(0.76, 0.32, 0.44, 0, 0.68, 0, MAT.glass);
      addHipRoof(0.94, 0.22, 0.6, 0, 0.84, 0, MAT.coral);
      for (const wx of [-0.26, 0, 0.26]) {
        addBox(0.14, 0.18, 0.03, wx, 0.32, 0.27, MAT.windowGlow);
      }
    } else if (kind === "childcenter") {
      // 黃馨瑀：新藥稽核與藥師進階中心 (三軌資料管線 + 圓頂中心)
      addBox(0.78, 0.46, 0.58, 0, 0.25, 0, MAT.cream);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28 * s, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), MAT.teal);
      dome.position.set(0, 0.48 * s, 0);
      dome.castShadow = true;
      g.add(dome);
      for (const [dx, col] of [[-0.24, MAT.coral], [0, MAT.gold], [0.24, MAT.green]]) {
        addBox(0.12, 0.26, 0.03, dx, 0.26, 0.3, col);
      }
    } else if (kind === "qc_station") {
      // 邱秀麗：中藥品管抽驗與馬兜鈴酸檢驗所
      addBox(0.76, 0.48, 0.58, -0.06, 0.26, 0, MAT.cream);
      addHipRoof(0.82, 0.2, 0.64, -0.06, 0.5, 0, MAT.green);
      // 檢驗分析塔與玻璃量筒
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.15 * s, 0.72 * s, 14), MAT.glass);
      cyl.position.set(0.28 * s, 0.38 * s, 0.12 * s);
      g.add(cyl);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17 * s, 0.17 * s, 0.08 * s, 14), MAT.teal);
      cap.position.set(0.28 * s, 0.76 * s, 0.12 * s);
      g.add(cap);
    } else if (kind === "warehouse") {
      // 林昀珊：總倉藥品管理與存量調撥中心
      addBox(0.88, 0.5, 0.64, 0, 0.27, 0, MAT.cream);
      addHipRoof(0.94, 0.24, 0.7, 0, 0.52, 0, MAT.teal);
      addBox(0.28, 0.3, 0.04, -0.18, 0.17, 0.32, MAT.woodDark);
      addBox(0.22, 0.18, 0.18, 0.26, 0.11, 0.36, MAT.gold);
    } else if (kind === "infinityforum") {
      // 部務室八大業務分工協作星環廣場
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42 * s, 0.055 * s, 10, 28), MAT.coral);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.08 * s;
      g.add(ring);
      const table = new THREE.Mesh(new THREE.CylinderGeometry(0.22 * s, 0.18 * s, 0.26 * s, 16), MAT.gold);
      table.position.y = 0.16 * s;
      table.castShadow = true;
      g.add(table);
      const orb = new THREE.Mesh(new THREE.OctahedronGeometry(0.15 * s, 0), MAT.lanternGlow);
      orb.position.y = 0.48 * s;
      g.add(orb);
      animatedProps.push({ mesh: orb, type: "spin_bob", baseY: 0.48 * s });
    } else if (kind === "researchdome") {
      // 林口／高雄醫學中心中藥旗艦圓頂館
      addBox(0.95, 0.48, 0.66, 0, 0.26, 0, MAT.cream);
      addHipRoof(1.02, 0.18, 0.72, 0, 0.5, 0, MAT.coral);
      const dome = new THREE.Mesh(new THREE.SphereGeometry(0.32 * s, 20, 14, 0, Math.PI * 2, 0, Math.PI / 2), MAT.glass);
      dome.position.set(0, 0.56 * s, 0);
      g.add(dome);
      for (const wx of [-0.28, 0, 0.28]) {
        addBox(0.16, 0.2, 0.03, wx, 0.26, 0.34, MAT.windowGlow);
      }
    } else if (kind === "herb_lab" || kind === "bogongcare") {
      // 中式本草煎藥工坊／桃園傳統伙房式會館
      addBox(0.84, 0.44, 0.58, 0, 0.24, 0, MAT.wood);
      addHipRoof(0.96, 0.28, 0.7, 0, 0.46, 0, MAT.coralDark);
      addBox(0.24, 0.26, 0.03, 0, 0.16, 0.3, MAT.windowGlow);
      for (const lx of [-0.34, 0.34]) {
        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.06 * s, 10, 8), MAT.lanternGlow);
        lantern.position.set(lx * s, 0.42 * s, 0.34 * s);
        g.add(lantern);
      }
    } else {
      // 通用溫暖醫療微縮建築 (hospital, classroom, meeting, computer, shop, etc.)
      addBox(0.78, 0.52, 0.58, 0, 0.28, 0, MAT.cream);
      addHipRoof(0.86, 0.24, 0.66, 0, 0.54, 0, MAT.coral);
      addBox(0.18, 0.26, 0.03, 0, 0.15, 0.3, MAT.ink);
      addBox(0.16, 0.16, 0.03, -0.22, 0.34, 0.3, MAT.windowGlow);
      addBox(0.16, 0.16, 0.03, 0.22, 0.34, 0.3, MAT.windowGlow);
      // 十字醫療標章
      addBox(0.16, 0.05, 0.03, 0, 0.42, 0.31, MAT.coral);
      addBox(0.05, 0.16, 0.03, 0, 0.42, 0.31, MAT.coral);
    }

    return g;
  }

  // =========================================================================
  // 6. 載入 D:\Users\User\Desktop\3D素材 之 3D GLB 模型 + 人物／動物／植物分層群組
  // =========================================================================
  const peopleGroup = new THREE.Group();
  peopleGroup.name = "peopleGroup";
  const animalsGroup = new THREE.Group();
  animalsGroup.name = "animalsGroup";
  const plantsGroup = new THREE.Group();
  plantsGroup.name = "plantsGroup";
  worldGroup.add(peopleGroup, animalsGroup, plantsGroup);

  const mixers = [];
  const animatedEntities = [];
  const walkingPeople = [];
  const ecoLabelTargets = [];

  // 人物名稱僅顯示名字（去除職稱、院區與括號附註）
  const GENERIC_PERSON_NAMES = {
    "情人湖中藥衛教人員": "陳藥師",
    "台北門診領藥市民": "王阿姨",
    "林口門診候藥民眾": "林先生",
    "雲林沿海領藥長輩": "張奶奶",
    "高雄中藥科臨床藥師": "蔡藥師",
    "大同院區中藥師": "吳藥師",
    "前金區高齡就醫市民": "陳阿嬤",
    "鳳山中藥門診衛教師": "黃衛教師",
    "南區聯合儲運藥庫人員": "林專員"
  };

  function formatPersonNameOnly(rawLabel) {
    if (!rawLabel) return "";
    if (GENERIC_PERSON_NAMES[rawLabel]) return GENERIC_PERSON_NAMES[rawLabel];
    let name = String(rawLabel)
      .replace(/（[^）]*）/g, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/主管團隊藥師|主管團隊|團隊藥師|巡迴中藥師/g, "")
      .trim();
    return name || rawLabel;
  }

  function base64ToArrayBuffer(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  // 檢查座標是否與島上建築重疊
  function isNearBuilding(isl, lx, lz, margin = 0.34) {
    return (isl.buildings || []).some((b) => {
      const r = (b.size || 0.72) * 0.42 + margin;
      return Math.hypot(lx - b.lx, lz - b.lz) < r;
    });
  }

  // 政策島風格：多層團簇樹冠大樹、松柏、櫻花樹、灌木、花圃與中藥本草藥圃 (對齊 decor.js)
  const TREE_COLORS = [0x8db86f, 0x9cc27a, 0x7aa85e, 0xa8cc84, 0x679654];
  const HERB_COLORS = [0x5e9a6f, 0x86b86a, 0xdb6a41, 0xe8c547, 0xc75b7a];

  function createMiniatureTree(style, scale = 0.48, seed = 1) {
    const g = new THREE.Group();
    const r = mulberry32(seed);
    const baseCol = new THREE.Color(TREE_COLORS[seed % TREE_COLORS.length]);
    const darkMat = new THREE.MeshStandardMaterial({ color: baseCol.clone().offsetHSL(0.02, -0.04, -0.09), roughness: 0.82, flatShading: true });
    const midMat = new THREE.MeshStandardMaterial({ color: baseCol, roughness: 0.8, flatShading: true });
    const lightMat = new THREE.MeshStandardMaterial({ color: baseCol.clone().offsetHSL(-0.01, 0.05, 0.09), roughness: 0.78, flatShading: true });
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x856244, roughness: 0.88 });

    // 樹根土丘
    const mound = new THREE.Mesh(new THREE.CylinderGeometry(scale * 0.22, scale * 0.34, scale * 0.08, 7), trunkMat);
    mound.position.y = scale * 0.04;
    g.add(mound);

    if (style === "conifer") {
      const h = scale * 1.65;
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(scale * 0.08, scale * 0.12, h * 0.36, 7), trunkMat);
      trunk.position.y = h * 0.18;
      trunk.castShadow = true;
      g.add(trunk);
      for (let t = 0; t < 3; t++) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(scale * (0.58 - t * 0.13), h * 0.42, 7),
          t === 0 ? darkMat : t === 1 ? midMat : lightMat
        );
        cone.position.y = h * (0.38 + t * 0.22);
        cone.castShadow = true;
        cone.receiveShadow = true;
        g.add(cone);
      }
      return g;
    }

    if (style === "palm") {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(scale * 0.07, scale * 0.11, scale * 1.15, 7), trunkMat);
      trunk.position.y = scale * 0.58;
      trunk.castShadow = true;
      g.add(trunk);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const frond = new THREE.Mesh(new THREE.BoxGeometry(scale * 0.58, scale * 0.05, scale * 0.18), k % 2 ? lightMat : midMat);
        frond.position.set(Math.cos(a) * scale * 0.26, scale * 1.12, Math.sin(a) * scale * 0.26);
        frond.rotation.y = -a;
        frond.rotation.z = -0.35;
        frond.castShadow = true;
        g.add(frond);
      }
      return g;
    }

    // 經典政策島多團簇闊葉樹 / 花果樹
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(scale * 0.09, scale * 0.14, scale * 0.72, 7), trunkMat);
    trunk.position.y = scale * 0.36;
    trunk.castShadow = true;
    g.add(trunk);

    const clumps = 5;
    for (let t = 0; t < clumps; t++) {
      const a = (t / clumps) * Math.PI * 2 + r() * 0.4;
      const rad = scale * (0.22 + r() * 0.1);
      const sz = scale * (0.32 + r() * 0.1);
      const leaf = new THREE.Mesh(new THREE.DodecahedronGeometry(sz, 1), t % 2 === 0 ? darkMat : midMat);
      leaf.scale.set(1.05, 0.86, 1.05);
      leaf.position.set(Math.cos(a) * rad, scale * (0.78 + (t % 2) * 0.14), Math.sin(a) * rad);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      g.add(leaf);
    }
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(scale * 0.36, 1), lightMat);
    crown.scale.set(1.08, 0.88, 1.08);
    crown.position.set(0, scale * 1.08, 0);
    crown.castShadow = true;
    g.add(crown);

    if (style === "blossom" || style === "fruit") {
      const dotMat = new THREE.MeshStandardMaterial({
        color: style === "blossom" ? 0xf5b0c4 : 0xf28d35,
        roughness: 0.6
      });
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const dot = new THREE.Mesh(new THREE.SphereGeometry(scale * 0.075, 8, 6), dotMat);
        dot.position.set(Math.cos(a) * scale * 0.32, scale * (0.85 + (k % 2) * 0.16), Math.sin(a) * scale * 0.32);
        g.add(dot);
      }
    }
    return g;
  }

  function createHerbGardenBed(seed = 1) {
    const g = new THREE.Group();
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.07, 0.22), MAT.wood);
    box.position.y = 0.035;
    box.castShadow = true;
    box.receiveShadow = true;
    g.add(box);

    const soil = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, 0.18), MAT.woodDark);
    soil.position.y = 0.072;
    g.add(soil);

    for (let row = -1; row <= 1; row++) {
      for (let col = -1; col <= 1; col += 2) {
        const stem = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.042, 0),
          new THREE.MeshStandardMaterial({ color: HERB_COLORS[(seed + row + 3) % HERB_COLORS.length], roughness: 0.75, flatShading: true })
        );
        stem.position.set(row * 0.085, 0.105, col * 0.042);
        stem.castShadow = true;
        g.add(stem);
      }
    }
    return g;
  }

  // 真實比例 3D 人物工廠 (藥師、醫師、主管、部務室專員、領藥民眾 — 總高約 0.255 單位，對應約 170cm 真實人體比例)
  function createChibiPerson(role = "pharmacist", accentHex = 0xdb6a41, seed = 1) {
    const g = new THREE.Group();
    const r = mulberry32(seed);
    const skinHex = [0xf4d2b4, 0xeac09e, 0xf1c7a5][seed % 3];
    const hairHex = role === "citizen_elder" ? 0xd8d3cb : [0x261f1d, 0x3f2d22, 0x1d1b20][seed % 3];
    let coatHex = 0xffffff;
    let vestHex = accentHex;
    let pantsHex = 0x353b48;

    if (role === "director") {
      coatHex = 0x222834;
      vestHex = 0xdb6a41;
    } else if (role === "pharmacist" || role === "doctor") {
      coatHex = 0xfaf8f5;
      vestHex = role === "pharmacist" ? 0x3e7c8c : 0x5e9a6f;
    } else if (role === "nurse") {
      coatHex = 0xfceef2;
      vestHex = 0xe07a9b;
    } else if (role === "warehouse") {
      coatHex = 0x4a6278;
      vestHex = 0xf2a33a;
    } else {
      coatHex = [0x6f7fb5, 0x58a6a6, 0xe8b04a, 0x8fb37a][seed % 4];
      vestHex = accentHex;
    }

    const skinMat = new THREE.MeshStandardMaterial({ color: skinHex, roughness: 0.68 });
    const hairMat = new THREE.MeshStandardMaterial({ color: hairHex, roughness: 0.78 });
    const coatMat = new THREE.MeshStandardMaterial({ color: coatHex, roughness: 0.72 });
    const vestMat = new THREE.MeshStandardMaterial({ color: vestHex, roughness: 0.65 });
    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsHex, roughness: 0.8 });

    // 貼地自然陰影 (移除誇張厚圓柱底座)
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.055, 12),
      new THREE.MeshBasicMaterial({ color: 0x241c16, transparent: true, opacity: 0.22, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.004;
    g.add(shadow);

    // 修長雙腿 (0.00 ~ 0.105)
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.105, 0.026), pantsMat);
    legL.position.set(-0.016, 0.052, 0);
    legL.castShadow = true;
    g.add(legL);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.105, 0.026), pantsMat);
    legR.position.set(0.016, 0.052, 0);
    legR.castShadow = true;
    g.add(legR);

    // 軀幹與醫事白袍／背心 (0.10 ~ 0.205)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.031, 0.102, 10), coatMat);
    torso.position.set(0, 0.152, 0);
    torso.castShadow = true;
    g.add(torso);

    const badgeBand = new THREE.Mesh(new THREE.BoxGeometry(0.058, 0.056, 0.048), vestMat);
    badgeBand.position.set(0, 0.158, 0.002);
    badgeBand.castShadow = true;
    g.add(badgeBand);

    // 識別證
    const idCard = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.02, 0.006), MAT.cream);
    idCard.position.set(0.014, 0.162, 0.027);
    g.add(idCard);

    // 修長雙臂與手持藥箱
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.088, 0.02), coatMat);
    armL.position.set(-0.039, 0.15, 0);
    armL.castShadow = true;
    g.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.088, 0.02), coatMat);
    armR.position.set(0.039, 0.15, 0.008);
    armR.castShadow = true;
    g.add(armR);

    if (r() < 0.75) {
      const carryBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.042, 0.032, 0.032),
        new THREE.MeshStandardMaterial({ color: accentHex, roughness: 0.55 })
      );
      carryBox.position.set(0, 0.138, 0.042);
      carryBox.castShadow = true;
      g.add(carryBox);
    }

    // 真實頭身比頭部 (中心 0.228，總高約 0.258 單位)
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), skinMat);
    head.scale.set(0.96, 1.05, 0.96);
    head.position.set(0, 0.228, 0);
    head.castShadow = true;
    g.add(head);

    const hair = new THREE.Mesh(
      new THREE.SphereGeometry(0.030, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.58),
      hairMat
    );
    hair.position.set(0, 0.232, -0.002);
    hair.rotation.x = -0.22;
    hair.castShadow = true;
    g.add(hair);

    // 藥師帽／醫事帽
    if (role === "pharmacist" || role === "nurse" || role === "qc") {
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.026, 0.016, 12), coatMat);
      cap.position.set(0, 0.26, 0);
      g.add(cap);
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.01, 0.004), MAT.coral);
      cross.position.set(0, 0.26, 0.026);
      g.add(cross);
    }

    g.userData.parts = { legL, legR, armL, armR, head };
    return g;
  }

  // 海域水中生物群組與動態清單
  const marineGroup = new THREE.Group();
  marineGroup.name = "marineGroup";
  scene.add(marineGroup);
  const marineCreatures = [];

  // 依據真實世界生物體型換算微縮模型高度 (以建築樓高 0.75~0.95、成人身高 0.26 為基準)
  function getRealisticModelHeight(relPath, fallbackScale = 0.26) {
    if (relPath.startsWith("characters/")) {
      return 0.26; // 成人身高 ~170cm -> 0.26 單位 (約為 2~3 層樓建築高度的 1/3)
    }
    if (relPath.includes("SunBear")) return 0.20;      // 台灣黑熊 (~130cm)
    if (relPath.includes("Doe")) return 0.19;          // 台灣梅花鹿 (~120cm)
    if (relPath.includes("BlueSwan")) return 0.135;    // 藍天鵝 (~88cm)
    if (relPath.includes("Pelican")) return 0.145;     // 海岸鵜鶘 (~95cm)
    if (relPath.includes("SacredIbis")) return 0.125;  // 埃及聖䴉／水鳥 (~80cm)
    if (relPath.includes("Eagle")) return 0.135;       // 盤旋黑鳶 (~85cm 展翼視覺尺度)
    if (relPath.includes("Duck")) return 0.082;        // 綠頭水鴨 (~50cm)
    if (relPath.includes("Swallowtail")) return 0.048; // 台灣鳳蝶 (精緻蝴蝶比例)
    if (relPath.includes("Bee")) return 0.038;         // 採蜜野蜂 (精緻蜜蜂比例)
    if (relPath.includes("TreeHigh")) return 1.02;     // 高大喬木 (~6.5m)
    if (relPath.includes("TreeMed")) return 0.82;      // 中型喬木 (~5.2m)
    if (relPath.includes("TreeLow")) return 0.66;      // 低矮林木 (~4.2m)
    if (relPath.includes("Bush") || relPath.includes("Grass") || relPath.includes("Reed")) {
      return 0.24; // 灌木與草本植栽 (~1.5m)
    }
    return fallbackScale;
  }

  function loadAndPlaceAllGlbModels() {
    const loader = THREE.GLTFLoader ? new THREE.GLTFLoader() : null;
    const bundle = window.GLB_ASSETS_BASE64 || {};

    // 需要將原始 Z-up 幾何體轉為 Y-up 之動物模型清單
    const Z_UP_ANIMALS = new Set([
      "animals/BlueSwan.glb",
      "animals/Doe.glb",
      "animals/Duck.glb",
      "animals/Eagle.glb",
      "animals/Pelican.glb",
      "animals/SacredIbis.glb",
      "animals/SunBear.glb",
      "animals/Swallowtail.glb"
    ]);

    const glbCache = new Map(); // relPath -> { status: "loading"|"ready", meshes, height, center, minY, callbacks: [] }

    function attachInstanceFromEntry(entry, holder, worldPos, targetHeight, rotY, animKind, userData) {
      const instGroup = new THREE.Group();
      entry.meshes.forEach(({ geom, mat }) => {
        const m = new THREE.Mesh(geom, mat);
        m.castShadow = true;
        m.receiveShadow = true;
        m.frustumCulled = false;
        if (userData) {
          m.userData = userData;
          pickables.push(m);
        }
        instGroup.add(m);
      });

      const s = targetHeight / entry.height;
      instGroup.scale.setScalar(s);
      instGroup.position.set(
        -entry.center.x * s,
        -entry.minY * s,
        -entry.center.z * s
      );
      holder.add(instGroup);

      animatedEntities.push({
        holder,
        inner: instGroup,
        kind: animKind || "prop",
        basePos: worldPos.clone(),
        baseRotY: rotY,
        phase: Math.random() * Math.PI * 2,
        speed: 0.9 + Math.random() * 0.6
      });
    }

    function spawnGlb(relPath, parentGroup, worldPos, targetHeight, rotY, animKind, userData) {
      const holder = new THREE.Group();
      holder.position.copy(worldPos);
      holder.rotation.y = rotY;
      parentGroup.add(holder);

      // 以自然柔和的貼地接觸陰影取代原本過大的厚圓柱底座，讓人物與動物比例真實貼地
      if (animKind === "char" || animKind === "animal_ground") {
        const shadowRadius = Math.max(0.028, Math.min(0.085, targetHeight * 0.25));
        const contactShadow = new THREE.Mesh(
          new THREE.CircleGeometry(shadowRadius, 12),
          new THREE.MeshBasicMaterial({ color: 0x241c16, transparent: true, opacity: 0.22, depthWrite: false })
        );
        contactShadow.rotation.x = -Math.PI / 2;
        contactShadow.position.y = 0.004;
        holder.add(contactShadow);
      }

      const existing = glbCache.get(relPath);
      if (existing) {
        if (existing.status === "ready") {
          attachInstanceFromEntry(existing, holder, worldPos, targetHeight, rotY, animKind, userData);
        } else {
          existing.callbacks.push((entry) => {
            attachInstanceFromEntry(entry, holder, worldPos, targetHeight, rotY, animKind, userData);
          });
        }
        return holder;
      }

      const cacheEntry = {
        status: "loading",
        meshes: [],
        height: 1,
        center: new THREE.Vector3(),
        minY: 0,
        callbacks: [
          (entry) => {
            attachInstanceFromEntry(entry, holder, worldPos, targetHeight, rotY, animKind, userData);
          }
        ]
      };
      glbCache.set(relPath, cacheEntry);

      const onParsed = (gltf) => {
        const rawMeshes = [];
        gltf.scene.traverse((ch) => {
          if (ch.isMesh && ch.geometry) rawMeshes.push(ch);
        });
        if (!rawMeshes.length) return;

        const overallBox = new THREE.Box3();
        const isZUp = Z_UP_ANIMALS.has(relPath);

        rawMeshes.forEach((srcMesh) => {
          const geom = srcMesh.geometry.clone();
          if (geom.attributes.skinIndex) geom.deleteAttribute("skinIndex");
          if (geom.attributes.skinWeight) geom.deleteAttribute("skinWeight");

          if (isZUp) {
            geom.rotateX(-Math.PI / 2);
          }
          geom.computeVertexNormals();
          geom.computeBoundingBox();
          overallBox.union(geom.boundingBox);

          const srcMat = Array.isArray(srcMesh.material) ? srcMesh.material[0] : srcMesh.material;
          const cleanMat = new THREE.MeshStandardMaterial({
            color: srcMat && srcMat.color ? srcMat.color : new THREE.Color(0xffffff),
            map: srcMat && srcMat.map ? srcMat.map : null,
            roughness: 0.72,
            metalness: 0.05,
            side: THREE.DoubleSide
          });
          if (cleanMat.map) cleanMat.map.needsUpdate = true;
          cacheEntry.meshes.push({ geom, mat: cleanMat });
        });

        const size = new THREE.Vector3();
        overallBox.getSize(size);
        overallBox.getCenter(cacheEntry.center);
        cacheEntry.height = Math.max(0.0001, size.y);
        cacheEntry.minY = overallBox.min.y;
        cacheEntry.status = "ready";

        cacheEntry.callbacks.forEach((cb) => cb(cacheEntry));
        cacheEntry.callbacks.length = 0;
      };

      const b64Key = bundle[relPath] ? relPath : relPath.replace(/\//g, "\\");
      if (bundle[b64Key]) {
        try {
          const ab = base64ToArrayBuffer(bundle[b64Key]);
          if (loader) {
            loader.parse(ab, "", onParsed, () => {});
            return holder;
          }
        } catch (e) {}
      }
      if (loader) {
        loader.load(`./assets/models/${relPath}`, onParsed, undefined, () => {});
      }
      return holder;
    }

    // 輔助函式：若動物為小型物種 (水鴨、鳳蝶、蜜蜂)，自動以真實比例生成 3 隻自然小群落
    function spawnRealisticAnimalWithFlock(file, parentGroup, pos, rotY, animKind, userData) {
      const targetH = getRealisticModelHeight(file, 0.16);
      spawnGlb(file, parentGroup, pos, targetH, rotY, animKind, userData);

      const isSmallFlock = file.includes("Duck") || file.includes("Swallowtail") || file.includes("Bee");
      if (isSmallFlock) {
        const offsets = [
          [0.11, 0.02, 0.09, 0.88],
          [-0.09, -0.01, 0.12, 0.82]
        ];
        offsets.forEach(([ox, oy, oz, scaleMul], k) => {
          const companionPos = new THREE.Vector3(pos.x + ox, pos.y + oy, pos.z + oz);
          spawnGlb(file, parentGroup, companionPos, targetH * scaleMul, rotY + (k + 1) * 0.7, animKind, userData);
        });
      }
      return targetH;
    }

    // 1) 為每座島嶼放置專屬 GLB 藥師、主管、民眾、植物與台灣生態動物 (採用貼近真實世界的比例)
    const EXTRA_TREES = [
      "nature/TreeHigh001.glb",
      "nature/TreeHigh002.glb",
      "nature/TreeMed001.glb",
      "nature/TreeMed002.glb",
      "nature/TreeLow001.glb",
      "nature/TreeLow002.glb"
    ];
    const EXTRA_PLANTS = [
      "nature/Bush001.glb",
      "nature/Bush002.glb",
      "nature/Grass001.glb",
      "nature/Reed001.glb"
    ];
    const EXTRA_ANIMALS = [
      { file: "animals/Doe.glb", label: "台灣梅花鹿", kind: "animal_ground" },
      { file: "animals/SunBear.glb", label: "台灣黑熊", kind: "animal_ground" },
      { file: "animals/BlueSwan.glb", label: "藍天鵝", kind: "animal_ground" },
      { file: "animals/SacredIbis.glb", label: "埃及聖䴉／水鳥", kind: "animal_ground" },
      { file: "animals/Duck.glb", label: "綠頭水鴨群", kind: "animal_ground" },
      { file: "animals/Eagle.glb", label: "盤旋黑鳶", kind: "animal_fly" },
      { file: "animals/Swallowtail.glb", label: "台灣鳳蝶群", kind: "animal_fly" },
      { file: "animals/Bee.glb", label: "採蜜野蜂群", kind: "animal_fly" }
    ];

    DATA.islands.forEach((isl, idx) => {
      const c = islandCenters.get(isl.id);
      const islSeed = (idx + 1) * 97;
      const rnd = mulberry32(islSeed);

      // (A) 島嶼專屬 GLB 模型 (人物、動物、代表樹木 — 真實比例)
      // 非部務室的院區島上，只有主管這角色有名稱，並站在島上主館的前方
      let supervisorPlaced = false;
      const mainBldg = (isl.buildings && isl.buildings[0]) || { lx: 0, lz: 0, size: 0.85 };

      (isl.glbModels || []).forEach((spec, mIdx) => {
        const isAnimal = spec.file.startsWith("animals/");
        const isNature = spec.file.startsWith("nature/");
        const isChar = !isAnimal && !isNature;
        const isEagle = spec.file.includes("Eagle");
        const isInsect = spec.file.includes("Swallowtail") || spec.file.includes("Bee");
        const isFly = isEagle || isInsect;
        const animKind = isNature ? "plant" : isAnimal ? (isFly ? "animal_fly" : "animal_ground") : "char";

        const isNonHqSupervisor = isChar && isl.id !== "headquarters" && !supervisorPlaced;
        const isSecondaryNonHqChar = isChar && isl.id !== "headquarters" && supervisorPlaced;
        if (isNonHqSupervisor) supervisorPlaced = true;

        const targetH = getRealisticModelHeight(spec.file, spec.scale || 0.26);
        // 黑鳶飛翔於高空 (TOP + 0.65)，鳳蝶與野蜂翩翩飛舞於花叢／藥圃高度 (TOP + 0.22)
        const baseY = isEagle ? TOP + 0.65 : isInsect ? TOP + 0.22 : TOP + 0.04;

        // 若為各院區主管，站立於島上主館前方 (+Z 入口處)
        const pos = isNonHqSupervisor
          ? new THREE.Vector3(
              c.x + mainBldg.lx,
              TOP + 0.04,
              c.z + mainBldg.lz + (mainBldg.size || 0.85) * 0.46 + 0.22
            )
          : new THREE.Vector3(
              c.x + (spec.offset ? spec.offset[0] : 0.8),
              baseY,
              c.z + (spec.offset ? spec.offset[1] : 0.6)
            );
        const rotY = isNonHqSupervisor
          ? 0 // 面向前方廣場與來訪者
          : Math.atan2(cityCenter.x - pos.x, cityCenter.z - pos.z) + (mIdx - 1) * 0.35;

        const targetGroup = isNature ? plantsGroup : isAnimal ? animalsGroup : peopleGroup;
        const displayLabel = isNonHqSupervisor
          ? isl.supervisor
          : isSecondaryNonHqChar
          ? ""
          : isChar
          ? formatPersonNameOnly(spec.label)
          : spec.label;
        const uData = displayLabel
          ? { pickType: "glb", label: displayLabel, island: isl }
          : null;

        if (isAnimal) {
          spawnRealisticAnimalWithFlock(spec.file, targetGroup, pos, rotY, animKind, uData);
        } else {
          spawnGlb(spec.file, targetGroup, pos, targetH, rotY, animKind, uData);
        }

        // 註冊 3D 人物／動物／植物浮動名牌錨點 (非部務室僅主管有名稱)
        if (!isSecondaryNonHqChar && displayLabel) {
          ecoLabelTargets.push({
            islandId: isl.id,
            label: displayLabel,
            kind: isNature ? "plant" : isAnimal ? "animal" : "char",
            icon: isNature ? "🌿" : isAnimal ? "🐾" : "🧑‍⚕️",
            isPrimary: isNonHqSupervisor || mIdx === 0 || isAnimal,
            worldPos: pos.clone().add(new THREE.Vector3(0, targetH + 0.10, 0))
          });
        }
      });

      // (B) 每座島額外配置 2 棵 GLB 樹木與 2 叢 GLB 灌木／草本植物 -> plantsGroup
      for (let t = 0; t < 2; t++) {
        const cornerIdx = (idx + t * 3 + 1) % 6;
        const [tx, tz] = hexVertex(c.x, c.z, R * 0.76, cornerIdx);
        if (!isNearBuilding(isl, tx - c.x, tz - c.z, 0.25)) {
          const treeFile = EXTRA_TREES[(idx + t) % EXTRA_TREES.length];
          spawnGlb(
            treeFile,
            plantsGroup,
            new THREE.Vector3(tx, TOP + 0.04, tz),
            getRealisticModelHeight(treeFile, 0.85),
            idx * 0.9 + t,
            "plant",
            { pickType: "glb", label: `${isl.shortName}・本草林木`, island: isl }
          );
        }

        const [bx, bz] = hexVertex(c.x, c.z, R * 0.82, (cornerIdx + 1) % 6);
        const plantFile = EXTRA_PLANTS[(idx + t) % EXTRA_PLANTS.length];
        spawnGlb(
          plantFile,
          plantsGroup,
          new THREE.Vector3(bx, TOP + 0.04, bz),
          getRealisticModelHeight(plantFile, 0.24),
          idx * 1.3 + t,
          "plant",
          { pickType: "glb", label: `${isl.shortName}・藥用草本植栽`, island: isl }
        );
      }

      // (C) 若該島原本無 GLB 動物，補上專屬台灣動物使其每島皆有真實比例動物生態 -> animalsGroup
      const hasAnimalAlready = (isl.glbModels || []).some((m) => m.file.startsWith("animals/"));
      const extraAnimal = EXTRA_ANIMALS[idx % EXTRA_ANIMALS.length];
      if (!hasAnimalAlready) {
        const [ax, az] = hexVertex(c.x, c.z, R * 0.66, (idx + 4) % 6);
        const isEagle = extraAnimal.file.includes("Eagle");
        const isInsect = extraAnimal.file.includes("Swallowtail") || extraAnimal.file.includes("Bee");
        const ay = isEagle ? TOP + 0.65 : isInsect ? TOP + 0.22 : TOP + 0.04;
        const animalPos = new THREE.Vector3(ax, ay, az);
        const realH = spawnRealisticAnimalWithFlock(
          extraAnimal.file,
          animalsGroup,
          animalPos,
          idx * 0.8,
          extraAnimal.kind,
          { pickType: "glb", label: `${isl.shortName}・${extraAnimal.label}`, island: isl }
        );
        ecoLabelTargets.push({
          islandId: isl.id,
          label: `${isl.shortName}・${extraAnimal.label}`,
          kind: "animal",
          icon: "🐾",
          worldPos: animalPos.clone().add(new THREE.Vector3(0, realH + 0.10, 0))
        });
      }

      // (D) 政策島風格 (decor.js)：為每座島鋪設多團簇闊葉樹／松樹／花果樹、本草藥圃與花叢 -> plantsGroup
      const treeStyles = {
        north: ["round", "conifer", "blossom"],
        taoyuan: ["blossom", "round", "conifer"],
        central: ["round", "fruit", "blossom"],
        yunchia: ["conifer", "fruit", "round"],
        south: ["palm", "blossom", "round"]
      }[isl.region] || ["round", "blossom"];

      let plantedTrees = 0;
      for (let attempt = 0; attempt < 18 && plantedTrees < 5; attempt++) {
        const ang = (attempt / 18) * Math.PI * 2 + rnd() * 0.25;
        const rad = R * (0.58 + rnd() * 0.25);
        const lx = Math.cos(ang) * rad;
        const lz = Math.sin(ang) * rad;
        if (isNearBuilding(isl, lx, lz, 0.28)) continue;
        const tStyle = treeStyles[plantedTrees % treeStyles.length];
        const tMesh = createMiniatureTree(tStyle, 0.42 + rnd() * 0.14, islSeed + attempt);
        tMesh.position.set(c.x + lx, TOP + 0.04, c.z + lz);
        tMesh.traverse((ch) => {
          if (ch.isMesh) {
            ch.userData = { pickType: "glb", label: `${isl.shortName}・療癒綠蔭庭園`, island: isl };
            pickables.push(ch);
          }
        });
        plantsGroup.add(tMesh);
        animatedEntities.push({
          holder: tMesh,
          inner: tMesh,
          kind: "plant",
          basePos: tMesh.position.clone(),
          baseRotY: rnd() * Math.PI * 2,
          phase: rnd() * Math.PI * 2,
          speed: 1.1
        });
        plantedTrees++;
      }

      // 每座島設置 2 座「中藥本草百草藥圃」與六角邊緣花圃 -> plantsGroup
      for (let hb = 0; hb < 2; hb++) {
        const hAng = (hb * Math.PI) + idx * 0.5 + 0.4;
        const hlx = Math.cos(hAng) * (R * 0.52);
        const hlz = Math.sin(hAng) * (R * 0.52);
        if (!isNearBuilding(isl, hlx, hlz, 0.22)) {
          const bed = createHerbGardenBed(islSeed + hb);
          bed.position.set(c.x + hlx, TOP + 0.04, c.z + hlz);
          bed.rotation.y = hAng;
          bed.traverse((ch) => {
            if (ch.isMesh) {
              ch.userData = { pickType: "glb", label: `${isl.shortName}・道地本草藥圃`, island: isl };
              pickables.push(ch);
            }
          });
          plantsGroup.add(bed);
        }
      }

      // (E) 每座島配置 3 位沿環島步道行走之真實比例藥師／主管／領藥民眾 -> peopleGroup (名稱僅顯示名字)
      const islandRoles = ["pharmacist", "doctor", "citizen"];
      const supFirstName = isl.supervisor.split("、")[0];
      for (let pIdx = 0; pIdx < 3; pIdx++) {
        const role = islandRoles[pIdx % islandRoles.length];
        const roleTitle = role === "pharmacist"
          ? "中藥師"
          : role === "doctor"
          ? supFirstName
          : "民眾";
        const accent = [0xdb6a41, 0x3e7c8c, 0x5e9a6f][(idx + pIdx) % 3];
        const person = createChibiPerson(role, accent, islSeed + pIdx * 19);
        person.scale.setScalar(1.0);
        person.traverse((ch) => {
          if (ch.isMesh) {
            ch.userData = { pickType: "glb", label: roleTitle, island: isl };
            pickables.push(ch);
          }
        });
        peopleGroup.add(person);

        // 環繞該島六角外環步道行走
        const ringWaypoints = [];
        for (let k = 0; k < 6; k++) {
          const [vx, vz] = hexVertex(c.x, c.z, RING_R * (0.86 - pIdx * 0.05), k);
          ringWaypoints.push(new THREE.Vector3(vx, TOP + 0.042, vz));
        }
        walkingPeople.push({
          group: person,
          waypoints: ringWaypoints,
          loop: true,
          progress: (pIdx / 3 + idx * 0.13) % 1,
          speed: 0.075 + (pIdx % 2) * 0.02,
          phase: rnd() * Math.PI * 2
        });
      }
    });

    // 2) 在跨海拱橋上配置跨院協作行人 -> 嚴格沿實際跨海拱橋與島面路徑行走，不走入海裡
    DATA.flows.forEach((f, fIdx) => {
      const targetId = f.targets[0];
      const islandHopIds = findBridgePath("headquarters", targetId);
      if (islandHopIds.length < 2) return;

      const bridgeWaypoints = [];
      for (let h = 0; h < islandHopIds.length - 1; h++) {
        const posA = islandCenters.get(islandHopIds[h]);
        const posB = islandCenters.get(islandHopIds[h + 1]);
        if (!posA || !posB) continue;
        if (h === 0) {
          bridgeWaypoints.push(posA.clone().setY(TOP + 0.045));
        }
        const arcPts = getBridgeArcPoints(posA, posB);
        arcPts.forEach((p) => bridgeWaypoints.push(p));
        bridgeWaypoints.push(posB.clone().setY(TOP + 0.045));
      }
      if (bridgeWaypoints.length < 2) return;

      const colHex = parseInt(f.color.replace("#", "0x"), 16) || 0xdb6a41;
      const walker = createChibiPerson("pharmacist", colHex, 700 + fIdx * 13);
      walker.scale.setScalar(1.0);
      const hqIsl = DATA.islands.find((i) => i.id === "headquarters");
      const ownerName = formatPersonNameOnly(f.owner);
      walker.traverse((ch) => {
        if (ch.isMesh) {
          ch.userData = {
            pickType: "glb",
            label: ownerName,
            island: hqIsl
          };
          pickables.push(ch);
        }
      });
      peopleGroup.add(walker);
      walkingPeople.push({
        group: walker,
        waypoints: bridgeWaypoints,
        loop: false,
        progress: (fIdx * 0.19) % 1,
        speed: 0.045 / Math.max(1, islandHopIds.length - 1),
        phase: fIdx * 1.1
      });
    });

    // 3) 在遠景海面上空點綴 Nature Kit 立體雲朵與群島周圍自然離島元素 (使用 D:\Users\User\Desktop\3D素材\自然環境 & 鳥類素材)
    const cloudCoords = [
      [-17.5, 8.2, -16, "nature/Cloud001.glb", 0.78],
      [18.0, 8.6, -12, "nature/Cloud002.glb", 0.82],
      [-18.5, 8.0, 10, "nature/Cloud002.glb", 0.75],
      [17.5, 8.4, 14, "nature/Cloud001.glb", 0.78]
    ];
    cloudCoords.forEach(([x, y, z, file, sc]) => {
      spawnGlb(file, worldGroup, new THREE.Vector3(cityCenter.x + x, y, cityCenter.z + z), sc, 0.3, "cloud", null);
    });

    // 群島周圍 10 座特色小島與海岸礁岩 (沙洲、燈塔離島、松林礁島、鵜鶘棲息岩)
    const surroundingIslets = [
      { dx: 12.2, dz: -13.5, rad: 1.05, style: "sand",   terrain: "nature/HillSand001.glb", tH: 0.58, tree: "nature/TreeLow003.glb",  bird: "animals/Pelican.glb", label: "🐢 東北龜山意象離島" },
      { dx: -11.5, dz: -11.2, rad: 0.95, style: "sand",  terrain: "nature/HillSand002.glb", tH: 0.52, tree: "nature/Reed001.glb",     bird: "animals/Pelican.glb", label: "🏖️ 淡水河口沙洲小島" },
      { dx: 13.8, dz: -4.2,  rad: 1.15, style: "cliff",  terrain: "nature/Mountain001.glb", tH: 1.35, tree: "nature/TreeHigh003.glb", bird: null,                   label: "⛰️ 東部海岸翠峰離島" },
      { dx: -13.2, dz: -2.0, rad: 0.98, style: "grass",  terrain: "nature/Hill002.glb",     tH: 0.65, tree: "nature/TreeMed003.glb",  bird: "animals/BlueSwan.glb", label: "🌿 西海岸生態保護礁島" },
      { dx: 12.5, dz: 4.8,   rad: 1.08, style: "cliff",  terrain: "nature/Mountain002.glb", tH: 1.28, tree: "nature/TreeHigh001.glb", bird: null,                   label: "🏝️ 太平洋觀瀾山嶼" },
      { dx: -12.8, dz: 6.5,  rad: 1.02, style: "sand",   terrain: "nature/Cliff001.glb",    tH: 0.72, tree: "nature/TreeLow001.glb",  bird: "animals/Pelican.glb", label: "🪨 澎湖玄武岩意象小島" },
      { dx: 11.4, dz: 13.8,  rad: 1.10, style: "grass",  terrain: "nature/Hill003.glb",     tH: 0.70, tree: "nature/TreeMed001.glb",  bird: null,                   label: "🗼 南台灣燈塔守望小島", lighthouse: true },
      { dx: -10.8, dz: 14.5, rad: 0.92, style: "sand",   terrain: "nature/HillSand001.glb", tH: 0.50, tree: "nature/Reed001.glb",     bird: "animals/Duck.glb",    label: "🪸 小琉球珊瑚礁小島" },
      { dx: 18.2, dz: -9.5,  rad: 1.25, style: "far",    terrain: "nature/MountainFar001.glb", tH: 1.65, tree: null,                  bird: null,                   label: "🗻 遠洋山嵐礁嶼" },
      { dx: -17.8, dz: 1.5,  rad: 1.20, style: "far",    terrain: "nature/Cliff002.glb",    tH: 0.88, tree: "nature/Rock003.glb",     bird: null,                   label: "⚓ 海峽守護礁岩" }
    ];

    surroundingIslets.forEach((si, sIdx) => {
      const ix = cityCenter.x + si.dx;
      const iz = cityCenter.z + si.dz;
      const isletHolder = new THREE.Group();
      isletHolder.position.set(ix, WATER_Y, iz);
      worldGroup.add(isletHolder);

      // 淺灘環與低矮六角砂岩／草地島基座
      const reef = new THREE.Mesh(
        new THREE.CylinderGeometry(si.rad * 1.18, si.rad * 1.26, 0.06, 6),
        new THREE.MeshBasicMaterial({ color: 0xb7e4e0, transparent: true, opacity: 0.42 })
      );
      reef.position.y = 0.03;
      isletHolder.add(reef);

      const baseCol = si.style === "sand" ? 0xe7d2a8 : si.style === "cliff" ? 0xa38b74 : 0x9db882;
      const baseMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(si.rad * 0.92, si.rad * 1.04, 0.22, 6),
        new THREE.MeshStandardMaterial({ color: baseCol, roughness: 0.85, flatShading: true })
      );
      baseMesh.position.y = 0.11;
      baseMesh.receiveShadow = true;
      baseMesh.castShadow = true;
      isletHolder.add(baseMesh);

      // 放置 Nature Kit 山丘／沙丘／懸崖／礁岩 GLB (純視覺點綴，不可點擊)
      if (si.terrain) {
        spawnGlb(
          si.terrain,
          worldGroup,
          new THREE.Vector3(ix, WATER_Y + 0.16, iz),
          si.tH,
          sIdx * 0.9,
          "prop",
          null
        );
      }

      // 點綴離島海岸礁石 (Rock001/002/003)
      const rockFiles = ["nature/Rock001.glb", "nature/Rock002.glb", "nature/Rock003.glb"];
      spawnGlb(
        rockFiles[sIdx % rockFiles.length],
        worldGroup,
        new THREE.Vector3(ix + si.rad * 0.55, WATER_Y + 0.15, iz - si.rad * 0.4),
        0.26,
        sIdx * 1.4,
        "prop",
        null
      );

      // 點綴離島樹木／蘆葦 -> plantsGroup (純視覺點綴，不可點擊)
      if (si.tree) {
        spawnGlb(
          si.tree,
          plantsGroup,
          new THREE.Vector3(ix - si.rad * 0.35, WATER_Y + 0.20, iz + si.rad * 0.32),
          si.tree.includes("Reed") ? 0.28 : 0.68,
          sIdx * 0.7,
          "plant",
          null
        );
      }

      // 離島海岸水鳥 (鵜鶘／藍天鵝／水鴨) -> animalsGroup (純視覺點綴，不可點擊)
      if (si.bird) {
        spawnGlb(
          si.bird,
          animalsGroup,
          new THREE.Vector3(ix + si.rad * 0.32, WATER_Y + 0.21, iz + si.rad * 0.36),
          getRealisticModelHeight(si.bird, 0.14),
          sIdx * 1.1,
          "animal_ground",
          null
        );
      }

      // 南台灣離島燈塔小地標
      if (si.lighthouse) {
        const lh = new THREE.Group();
        lh.position.set(ix - 0.3, WATER_Y + 0.22, iz - 0.25);
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.13, 0.55, 8), MAT.cream);
        tower.position.y = 0.275;
        tower.castShadow = true;
        lh.add(tower);
        const stripe = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.105, 0.12, 8), MAT.coral);
        stripe.position.y = 0.32;
        lh.add(stripe);
        const lantern = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.10, 8), MAT.lanternGlow);
        lantern.position.y = 0.58;
        lh.add(lantern);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.12, 8), MAT.coralDark);
        cap.position.y = 0.68;
        lh.add(cap);
        worldGroup.add(lh);
      }
    });

    // 4) 在近海淺灣配置悠游於海面上的真實比例水鳥 (藍天鵝與綠頭水鴨群) -> animalsGroup
    const seaBirdSpots = [
      { islId: "keelung", file: "animals/Duck.glb", label: "基隆港灣綠頭水鴨群", dx: -3.4, dz: -2.0 },
      { islId: "linkou", file: "animals/BlueSwan.glb", label: "桃園近海悠游藍天鵝", dx: -3.7, dz: 1.3 },
      { islId: "chiayi", file: "animals/Duck.glb", label: "嘉南近海綠頭水鴨群", dx: -3.5, dz: 1.0 },
      { islId: "kaohsiung", file: "animals/BlueSwan.glb", label: "澄清湖畔延伸海域藍天鵝", dx: 3.5, dz: 1.6 }
    ];
    seaBirdSpots.forEach((spot, sIdx) => {
      const c = islandCenters.get(spot.islId);
      const isl = DATA.islands.find((i) => i.id === spot.islId);
      if (!c || !isl) return;
      const pos = new THREE.Vector3(c.x + spot.dx, WATER_Y + 0.01, c.z + spot.dz);
      spawnRealisticAnimalWithFlock(
        spot.file,
        animalsGroup,
        pos,
        sIdx * 1.4,
        "animal_ground",
        { pickType: "glb", label: spot.label, island: isl }
      );
    });
  }
  loadAndPlaceAllGlbModels();

  // =========================================================================
  // 6.5 台灣海域水中生物系統 (3D Marine Life: 鯨魚噴水、躍水海豚群、綠蠵龜、鬼蝠魟、珊瑚礁魚群)
  // =========================================================================
  function createWhaleMesh(scale = 1.22, colorHex = 0x2c4c64) {
    // 大翅鯨／抹香鯨：真實比例體長約 1.2~1.35 單位 (對應 8~9 公尺，約為成人身高 0.26 的 4.8 倍)
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45, metalness: 0.08, flatShading: true });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xdce6ec, roughness: 0.55, flatShading: true });

    // 主軀幹 (+Z 為前進方向)
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.18, 14, 12), bodyMat);
    body.scale.set(0.95, 0.78, 2.65);
    body.castShadow = true;
    g.add(body);

    // 腹摺白色胸腹
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.165, 12, 10), bellyMat);
    belly.scale.set(0.88, 0.55, 2.3);
    belly.position.set(0, -0.045, 0.05);
    g.add(belly);

    // 尾柄與寬大水平尾鰭 (Flukes)
    const tailPivot = new THREE.Group();
    tailPivot.position.set(0, 0.01, -0.42);
    g.add(tailPivot);

    const peduncle = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.36, 10), bodyMat);
    peduncle.rotation.x = -Math.PI / 2;
    peduncle.position.set(0, 0, -0.14);
    tailPivot.add(peduncle);

    const flukeL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.024, 0.13), bodyMat);
    flukeL.position.set(-0.13, 0, -0.32);
    flukeL.rotation.y = 0.28;
    tailPivot.add(flukeL);

    const flukeR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.024, 0.13), bodyMat);
    flukeR.position.set(0.13, 0, -0.32);
    flukeR.rotation.y = -0.28;
    tailPivot.add(flukeR);

    // 背鰭與修長胸鰭
    const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 7), bodyMat);
    dorsal.position.set(0, 0.15, -0.15);
    dorsal.rotation.x = -0.38;
    g.add(dorsal);

    for (const side of [-1, 1]) {
      const pec = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.022, 0.095), bellyMat);
      pec.position.set(side * 0.22, -0.04, 0.08);
      pec.rotation.z = side * -0.25;
      pec.rotation.y = side * -0.22;
      g.add(pec);
    }

    // 換氣噴水柱粒子群 (Spout Mist)
    const spoutGroup = new THREE.Group();
    spoutGroup.position.set(0, 0.15, 0.22);
    const mistMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.78, depthWrite: false });
    for (let i = 0; i < 6; i++) {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(0.028 + i * 0.012, 8, 6), mistMat);
      drop.position.set((i % 2 === 0 ? 1 : -1) * i * 0.012, i * 0.065, -i * 0.015);
      spoutGroup.add(drop);
    }
    g.add(spoutGroup);

    // 海面白色浪花環
    const ripple = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.48, 24),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false })
    );
    ripple.rotation.x = -Math.PI / 2;
    ripple.position.y = 0.02;
    g.add(ripple);

    g.scale.setScalar(scale);
    g.userData.parts = { tailPivot, spoutGroup, ripple };
    return g;
  }

  function createDolphinMesh(isPinkWhite = false, scale = 1.0) {
    // 中華白海豚／瓶鼻海豚：真實比例體長約 0.35 單位 (~2.3m)
    const g = new THREE.Group();
    const topHex = isPinkWhite ? 0xf2cfd6 : 0x4f7c96;
    const bodyMat = new THREE.MeshStandardMaterial({ color: topHex, roughness: 0.38, metalness: 0.1, flatShading: true });
    const bellyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.48, flatShading: true });

    const body = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 10), bodyMat);
    body.scale.set(0.88, 0.82, 2.75);
    body.castShadow = true;
    g.add(body);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.056, 10, 8), bellyMat);
    belly.scale.set(0.82, 0.65, 2.4);
    belly.position.set(0, -0.016, 0.01);
    g.add(belly);

    // 海豚吻突 (Rostrum)
    const beak = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.095, 8), bodyMat);
    beak.rotation.x = Math.PI / 2;
    beak.position.set(0, -0.008, 0.18);
    g.add(beak);

    // 鐮刀型背鰭
    const dorsal = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.085, 6), bodyMat);
    dorsal.position.set(0, 0.068, -0.02);
    dorsal.rotation.x = -0.35;
    g.add(dorsal);

    // 胸鰭與水平尾鰭
    for (const side of [-1, 1]) {
      const fin = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.01, 0.042), bodyMat);
      fin.position.set(side * 0.062, -0.022, 0.04);
      fin.rotation.z = side * -0.3;
      fin.rotation.y = side * -0.25;
      g.add(fin);
    }

    const tailFluke = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.012, 0.05), bodyMat);
    tailFluke.position.set(0, 0, -0.175);
    g.add(tailFluke);

    g.scale.setScalar(scale);
    g.userData.parts = { tailFluke };
    return g;
  }

  function createSeaTurtleMesh(scale = 1.0) {
    // 台灣綠蠵龜：真實比例背甲長約 0.17 單位 (~1.1m)
    const g = new THREE.Group();
    const shellMat = new THREE.MeshStandardMaterial({ color: 0x4b6e40, roughness: 0.55, flatShading: true });
    const patternMat = new THREE.MeshStandardMaterial({ color: 0x8a6236, roughness: 0.6, flatShading: true });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0x7ea16b, roughness: 0.65, flatShading: true });

    const shell = new THREE.Mesh(new THREE.SphereGeometry(0.072, 10, 8), shellMat);
    shell.scale.set(1.05, 0.42, 1.28);
    shell.castShadow = true;
    g.add(shell);

    const ridge = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.062, 0.022, 6), patternMat);
    ridge.scale.set(1.0, 1.0, 1.22);
    ridge.position.y = 0.024;
    g.add(ridge);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), skinMat);
    head.scale.set(0.9, 0.8, 1.25);
    head.position.set(0, 0.004, 0.105);
    g.add(head);

    const flipperL = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.01, 0.036), skinMat);
    flipperL.position.set(-0.075, -0.004, 0.035);
    flipperL.rotation.y = 0.25;
    g.add(flipperL);

    const flipperR = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.01, 0.036), skinMat);
    flipperR.position.set(0.075, -0.004, 0.035);
    flipperR.rotation.y = -0.25;
    g.add(flipperR);

    for (const side of [-1, 1]) {
      const backFlip = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.008, 0.024), skinMat);
      backFlip.position.set(side * 0.048, -0.006, -0.078);
      backFlip.rotation.y = side * -0.45;
      g.add(backFlip);
    }

    g.scale.setScalar(scale);
    g.userData.parts = { flipperL, flipperR };
    return g;
  }

  function createMantaRayMesh(scale = 1.0) {
    // 洋流鬼蝠魟 (Manta Ray)：真實比例翼展約 0.34 單位 (~2.2m)
    const g = new THREE.Group();
    const topMat = new THREE.MeshStandardMaterial({ color: 0x283c4f, roughness: 0.45, flatShading: true });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xeaf2f8, roughness: 0.55, flatShading: true });

    const disc = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.035, 4), topMat);
    disc.scale.set(1.3, 0.6, 1.45);
    disc.rotation.y = Math.PI / 4;
    g.add(disc);

    const wingL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.13), topMat);
    wingL.position.set(-0.09, 0, 0.01);
    wingL.rotation.y = 0.32;
    g.add(wingL);

    const wingR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.13), topMat);
    wingR.position.set(0.09, 0, 0.01);
    wingR.rotation.y = -0.32;
    g.add(wingR);

    // 頭鰭與細長尾鞭
    for (const side of [-1, 1]) {
      const horn = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.012, 0.055), whiteMat);
      horn.position.set(side * 0.036, 0.002, 0.11);
      g.add(horn);
    }
    const tail = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.002, 0.18, 6), topMat);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 0, -0.17);
    g.add(tail);

    g.scale.setScalar(scale);
    g.userData.parts = { wingL, wingR };
    return g;
  }

  function createSingleFishMesh(colorHex = 0xff7b47, size = 0.072) {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.35, metalness: 0.1, flatShading: true });
    const body = new THREE.Mesh(new THREE.OctahedronGeometry(size * 0.45, 1), mat);
    body.scale.set(0.45, 0.72, 1.85);
    g.add(body);

    const tail = new THREE.Mesh(new THREE.ConeGeometry(size * 0.32, size * 0.55, 3), mat);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 0, -size * 0.9);
    g.add(tail);
    g.userData.tail = tail;
    return g;
  }

  function buildMarineLife() {
    const registerPickable = (root, label, islId) => {
      const isl = DATA.islands.find((i) => i.id === islId) || DATA.islands[0];
      root.traverse((ch) => {
        if (ch.isMesh) {
          ch.userData = { pickType: "glb", label, island: isl };
          pickables.push(ch);
        }
      });
    };

    // (1) 🐋 外海巡游大翅鯨／抹香鯨 (3 頭，配合加寬間距配置於外圍深海航道)
    const whaleSpecs = [
      { cx: cityCenter.x + 10.2, cz: cityCenter.z - 15.0, rx: 3.4, rz: 2.2, speed: 0.22, phase: 0.2, col: 0x2b4c65, scale: 1.24, islId: "keelung", label: "🐋 台灣東北海域・大翅鯨（浮出換氣噴水）" },
      { cx: cityCenter.x + 11.2, cz: cityCenter.z + 1.8,  rx: 2.8, rz: 4.0, speed: 0.19, phase: 2.1, col: 0x345870, scale: 1.18, islId: "taichung", label: "🐋 台灣海峽洋流・巡游大翅鯨" },
      { cx: cityCenter.x - 9.8,  cz: cityCenter.z + 14.2, rx: 3.6, rz: 2.3, speed: 0.21, phase: 4.0, col: 0x264358, scale: 1.30, islId: "kaohsiung", label: "🐋 南台灣巴士海峽・大翅鯨母子領航" }
    ];
    whaleSpecs.forEach((ws) => {
      const whale = createWhaleMesh(ws.scale, ws.col);
      whale.position.set(ws.cx, WATER_Y - 0.02, ws.cz);
      marineGroup.add(whale);
      registerPickable(whale, ws.label, ws.islId);

      const labelAnchor = new THREE.Vector3(ws.cx, WATER_Y + 0.38, ws.cz);
      ecoLabelTargets.push({
        islandId: ws.islId,
        label: ws.label,
        kind: "animal",
        icon: "🐋",
        isPrimary: true,
        worldPos: labelAnchor
      });

      marineCreatures.push({
        kind: "whale",
        group: whale,
        cx: ws.cx,
        cz: ws.cz,
        rx: ws.rx,
        rz: ws.rz,
        speed: ws.speed,
        phase: ws.phase,
        labelAnchor
      });
    });

    // (2) 🐬 躍水海豚群 (5 群共 12 隻海豚：包含台灣海峽特有「中華白海豚」與「瓶鼻海豚」，會成群躍出水面並激起白色水花環)
    const dolphinPods = [
      { cx: cityCenter.x - 7.8, cz: cityCenter.z - 10.4, rx: 2.2, rz: 1.7, speed: 0.65, pink: false, count: 3, islId: "tamsui", label: "🐬 淡水河口外海・躍水瓶鼻海豚群" },
      { cx: cityCenter.x - 8.4, cz: cityCenter.z - 1.5,  rx: 2.0, rz: 2.4, speed: 0.62, pink: true,  count: 3, islId: "taoyuan", label: "🐬 桃園近海・台灣海峽中華白海豚群" },
      { cx: cityCenter.x - 8.0, cz: cityCenter.z + 6.4,  rx: 2.3, rz: 1.9, speed: 0.68, pink: true,  count: 2, islId: "yunlin", label: "🐬 雲嘉外海・珍貴中華白海豚" },
      { cx: cityCenter.x + 7.4, cz: cityCenter.z - 6.6,  rx: 2.1, rz: 2.0, speed: 0.64, pink: false, count: 2, islId: "taipei", label: "🐬 北台灣海灣・瓶鼻海豚群" },
      { cx: cityCenter.x + 6.8, cz: cityCenter.z + 11.4, rx: 2.4, rz: 1.8, speed: 0.66, pink: false, count: 2, islId: "fengshan", label: "🐬 高屏近海・躍浪海豚群" }
    ];
    dolphinPods.forEach((pod, pIdx) => {
      const podAnchor = new THREE.Vector3(pod.cx, WATER_Y + 0.35, pod.cz);
      ecoLabelTargets.push({
        islandId: pod.islId,
        label: pod.label,
        kind: "animal",
        icon: "🐬",
        isPrimary: true,
        worldPos: podAnchor
      });

      for (let m = 0; m < pod.count; m++) {
        const dolphin = createDolphinMesh(pod.pink, 1.0 - m * 0.08);
        marineGroup.add(dolphin);
        registerPickable(dolphin, pod.label, pod.islId);

        const splashRing = new THREE.Mesh(
          new THREE.RingGeometry(0.08, 0.17, 18),
          new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
        );
        splashRing.rotation.x = -Math.PI / 2;
        splashRing.position.set(pod.cx, WATER_Y + 0.012, pod.cz);
        marineGroup.add(splashRing);

        marineCreatures.push({
          kind: "dolphin",
          group: dolphin,
          splashRing,
          cx: pod.cx + (m - 1) * 0.35,
          cz: pod.cz + (m % 2) * 0.28,
          rx: pod.rx,
          rz: pod.rz,
          speed: pod.speed,
          phase: pIdx * 1.3 + m * 0.55,
          labelAnchor: m === 0 ? podAnchor : null
        });
      }
    });

    // (3) 🐢 台灣綠蠵龜 (8 隻，悠游於各島淺海珊瑚礁區，划動前肢並偶爾探頭換氣)
    const turtleIslIds = ["keelung", "tamsui", "linkou", "headquarters", "taichung", "chiayi", "tainan", "kaohsiung"];
    turtleIslIds.forEach((islId, tIdx) => {
      const c = islandCenters.get(islId);
      if (!c) return;
      const ang = (tIdx * 0.95) + 0.4;
      const tx = c.x + Math.cos(ang) * (R * 1.34);
      const tz = c.z + Math.sin(ang) * (R * 1.34);
      const turtle = createSeaTurtleMesh(0.95 + (tIdx % 2) * 0.12);
      turtle.position.set(tx, WATER_Y - 0.025, tz);
      marineGroup.add(turtle);
      const label = `🐢 ${DATA.islands.find((i) => i.id === islId)?.shortName || "近海"}・台灣綠蠵龜`;
      registerPickable(turtle, label, islId);

      const tAnchor = new THREE.Vector3(tx, WATER_Y + 0.22, tz);
      if (tIdx % 2 === 0) {
        ecoLabelTargets.push({
          islandId: islId,
          label,
          kind: "animal",
          icon: "🐢",
          isPrimary: false,
          worldPos: tAnchor
        });
      }

      marineCreatures.push({
        kind: "turtle",
        group: turtle,
        cx: tx,
        cz: tz,
        rx: 0.75,
        rz: 0.65,
        speed: 0.38 + (tIdx % 3) * 0.06,
        phase: tIdx * 1.1,
        labelAnchor: tIdx % 2 === 0 ? tAnchor : null
      });
    });

    // (4) 🦅 洋流鬼蝠魟 (5 隻，在島際海道間優雅滑翔拍翼)
    const mantaSpots = [
      { cx: cityCenter.x + 3.8, cz: cityCenter.z - 9.0, islId: "keelung", label: "🌊 北海岸洋流・鬼蝠魟" },
      { cx: cityCenter.x - 4.2, cz: cityCenter.z - 3.6, islId: "linkou", label: "🌊 桃園海道・優雅鬼蝠魟" },
      { cx: cityCenter.x + 3.6, cz: cityCenter.z + 0.8, islId: "taichung", label: "🌊 中部海域・鬼蝠魟" },
      { cx: cityCenter.x - 4.0, cz: cityCenter.z + 7.2, islId: "chiayi", label: "🌊 雲嘉海道・鬼蝠魟" },
      { cx: cityCenter.x + 3.5, cz: cityCenter.z + 11.2, islId: "kaohsiung", label: "🌊 南台灣海域・鬼蝠魟" }
    ];
    mantaSpots.forEach((ms, mIdx) => {
      const manta = createMantaRayMesh(1.0);
      manta.position.set(ms.cx, WATER_Y - 0.04, ms.cz);
      marineGroup.add(manta);
      registerPickable(manta, ms.label, ms.islId);

      marineCreatures.push({
        kind: "manta",
        group: manta,
        cx: ms.cx,
        cz: ms.cz,
        rx: 1.25,
        rz: 0.95,
        speed: 0.44,
        phase: mIdx * 1.4
      });
    });

    // (5) 🐟 環島淺灘珊瑚礁魚群／台灣飛魚群 (每座島嶼淺灘外環各配置 1 群共 13 群繽紛魚群，每群 7 尾同步迴游)
    const FISH_PALETTE = [0xff6b4a, 0xffbe3b, 0x3ec6e0, 0xf78fb3, 0xff9f43];
    DATA.islands.forEach((isl, idx) => {
      const c = islandCenters.get(isl.id);
      const schoolGroup = new THREE.Group();
      const baseAng = (idx * 1.1) % (Math.PI * 2);
      const sx = c.x + Math.cos(baseAng) * (R * 1.25);
      const sz = c.z + Math.sin(baseAng) * (R * 1.25);
      schoolGroup.position.set(sx, WATER_Y - 0.03, sz);
      marineGroup.add(schoolGroup);

      const fishList = [];
      for (let f = 0; f < 7; f++) {
        const col = FISH_PALETTE[(idx + f) % FISH_PALETTE.length];
        const fish = createSingleFishMesh(col, 0.068 + (f % 3) * 0.01);
        fish.position.set(
          Math.cos((f / 7) * Math.PI * 2) * 0.22,
          (f % 2) * 0.015,
          Math.sin((f / 7) * Math.PI * 2) * 0.22
        );
        schoolGroup.add(fish);
        fishList.push(fish);
      }
      registerPickable(schoolGroup, `🐟 ${isl.shortName}近海・珊瑚礁熱帶魚群`, isl.id);

      marineCreatures.push({
        kind: "fish_school",
        group: schoolGroup,
        fishList,
        cx: c.x,
        cz: c.z,
        orbitR: R * 1.24,
        speed: 0.28 + (idx % 3) * 0.05,
        phase: idx * 0.85
      });
    });
  }
  buildMarineLife();

  // =========================================================================
  // 7. 八大跨院業務分工協作線 (3D Collaboration Flow Arcs & Animated Pulses)
  // =========================================================================
  const flowsGroup = new THREE.Group();
  scene.add(flowsGroup);
  const flowVisuals = new Map();
  const flowPulses = [];

  function buildCollaborationFlows() {
    const hqCenter = islandCenters.get("headquarters");
    DATA.flows.forEach((f, fIdx) => {
      const fGroup = new THREE.Group();
      flowsGroup.add(fGroup);
      const col = new THREE.Color(f.color);
      const lineMat = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.68 });
      const pulseMat = new THREE.MeshBasicMaterial({ color: col });

      f.targets.forEach((targetId, tIdx) => {
        const dest = islandCenters.get(targetId);
        if (!dest) return;
        const start = hqCenter.clone().add(new THREE.Vector3(0, 0.55, 0));
        const end = dest.clone().add(new THREE.Vector3(0, 0.45, 0));
        const mid = start.clone().add(end).multiplyScalar(0.5);
        const dist = start.distanceTo(end);
        mid.y += Math.min(4.2, 1.1 + dist * 0.22 + (fIdx % 3) * 0.25);

        const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
        const pts = curve.getPoints(36);
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geo, lineMat);
        fGroup.add(line);

        // 沿協作線飛行的發光能量球 (降低移動速度，呈現從容穩健的跨院傳遞節奏)
        const orb = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), pulseMat);
        fGroup.add(orb);
        flowPulses.push({
          mesh: orb,
          curve,
          speed: 0.055 + (tIdx % 3) * 0.015,
          offset: (fIdx * 0.17 + tIdx * 0.29) % 1,
          flowId: f.id
        });
      });

      flowVisuals.set(f.id, { group: fGroup, flow: f, lineMat });
    });
  }
  buildCollaborationFlows();

  // =========================================================================
  // 8. 浮動 3D HTML 標籤系統 (#labels: 13 座島嶼名牌 + 54 座建築編號)
  // =========================================================================
  const islandLabelEls = new Map();
  const bldgLabelEls = new Map();
  const ecoLabelEls = [];
  let showNames = true;
  let showPins = true;
  let selectedIslandId = null;
  let selectedBuildingId = null;
  let activeFlowId = null;
  let activeStaffId = null;
  let activeRegion = "all";

  function initFloatingLabels() {
    labelsContainer.innerHTML = "";
    DATA.islands.forEach((isl) => {
      const btn = document.createElement("button");
      btn.className = "island-label" + (isl.id === "headquarters" ? " is-hq" : "");
      btn.innerHTML = `<strong>${isl.index}</strong><span>${isl.shortName}</span><span class="county-chip">${isl.county}</span>`;
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        AudioFX.click(820);
        selectIsland(isl.id, true);
      });
      labelsContainer.appendChild(btn);
      islandLabelEls.set(isl.id, btn);

      isl.buildings.forEach((b) => {
        const pinBtn = document.createElement("button");
        pinBtn.className = "bldg-pin-label";
        pinBtn.innerHTML = `<b>${b.pin}</b><span>${b.name}</span>`;
        pinBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          AudioFX.click(920);
          selectBuilding(isl.id, b.id, true);
        });
        labelsContainer.appendChild(pinBtn);
        bldgLabelEls.set(b.id, { el: pinBtn, islandId: isl.id, building: b });
      });
    });

    // 建立每座島嶼之 3D 人物、動物、植物與海域水中生物浮動小名牌
    ecoLabelTargets.forEach((target) => {
      const ecoBtn = document.createElement("button");
      ecoBtn.className = `eco-pin-label is-${target.kind}`;
      const cleanLabel = String(target.label || "").replace(/^(🐋|🐬|🐢|🌊|🐟|🐾|🌿|🧑‍⚕️)\s*/u, "");
      ecoBtn.innerHTML = `<span>${target.icon}</span><span>${cleanLabel}</span>`;
      ecoBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        AudioFX.click(860);
        selectIsland(target.islandId, false);
        flyTo(
          target.worldPos.clone(),
          target.worldPos.clone().add(new THREE.Vector3(1.8, 2.1, 2.7)),
          700
        );
      });
      labelsContainer.appendChild(ecoBtn);
      ecoLabelEls.push({ el: ecoBtn, target });
    });
  }
  initFloatingLabels();

  function updateFloatingLabels() {
    const w = stage.clientWidth;
    const h = stage.clientHeight;
    const v = new THREE.Vector3();

    DATA.islands.forEach((isl) => {
      const el = islandLabelEls.get(isl.id);
      if (!el) return;
      if (!showNames) {
        el.style.display = "none";
        return;
      }
      const c = islandCenters.get(isl.id);
      v.set(c.x, TOP + (isl.id === "headquarters" ? 1.55 : 1.25), c.z);
      v.project(camera);
      if (v.z > 1) {
        el.style.display = "none";
        return;
      }
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      el.style.display = "inline-flex";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.zIndex = String(Math.round((1 - v.z) * 200));
    });

    const camDist = camera.position.distanceTo(controls.target);
    bldgLabelEls.forEach(({ el, islandId }, bId) => {
      const showThis = showPins && (selectedIslandId === islandId || camDist < 17.5);
      if (!showThis) {
        el.style.display = "none";
        return;
      }
      const bInfo = buildingGroups.get(bId);
      if (!bInfo) return;
      v.copy(bInfo.worldPos);
      v.project(camera);
      if (v.z > 1) {
        el.style.display = "none";
        return;
      }
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      el.style.display = "inline-flex";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.classList.toggle("selected", selectedBuildingId === bId);
    });

    // 更新 3D 人物、動物、植物與海域水中生物浮動名牌 (依人物/動物/植物三類圖層開關獨立控制)
    ecoLabelEls.forEach(({ el, target }) => {
      const groupVisible =
        target.kind === "char"
          ? peopleGroup.visible
          : target.kind === "animal"
          ? animalsGroup.visible
          : plantsGroup.visible;
      const isSelectedIsl = selectedIslandId === target.islandId;
      const isMarineHighlight = target.icon === "🐋" || target.icon === "🐬";
      const showEco = groupVisible && (isSelectedIsl || camDist < 22.0 || (showNames && isMarineHighlight));
      if (!showEco) {
        el.style.display = "none";
        return;
      }
      v.copy(target.worldPos);
      v.project(camera);
      if (v.z > 1) {
        el.style.display = "none";
        return;
      }
      const x = (v.x * 0.5 + 0.5) * w;
      const y = (-v.y * 0.5 + 0.5) * h;
      el.style.display = "inline-flex";
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    });
  }

  // =========================================================================
  // 9. 平滑電影感鏡頭導航 (Camera Glide)
  // =========================================================================
  let camAnim = null;
  function flyTo(targetPos, camPos, duration = 900) {
    camAnim = {
      startPos: camera.position.clone(),
      startTarget: controls.target.clone(),
      endPos: camPos.clone(),
      endTarget: targetPos.clone(),
      startTime: performance.now(),
      duration
    };
  }

  function resetOverview(birdView = false) {
    selectedIslandId = null;
    selectedBuildingId = null;
    updateSelectionHighlights();
    $("#card").hidden = true;
    if (birdView) {
      flyTo(
        cityCenter.clone(),
        cityCenter.clone().add(new THREE.Vector3(0.01, 36.0, 3.5)),
        900
      );
    } else {
      flyTo(OVERVIEW_TARGET, OVERVIEW_POS, 900);
    }
  }

  // =========================================================================
  // 10. UI 互動：右側索引樹 (#tree)、底部 Dock、詳情卡片 (#card) 與篩選
  // =========================================================================
  let currentSidebarTab = "islands";

  function renderDock() {
    const dock = $("#dock");
    dock.innerHTML = DATA.islands.map((isl) => `
      <button class="dock-btn" data-dock-isl="${isl.id}" title="${isl.index} ${isl.name}（${isl.county}｜主管：${isl.supervisor}）">
        <span class="dock-no">${isl.index}</span>
        <span class="dock-nm">${isl.shortName}</span>
      </button>
    `).join("");
    dock.querySelectorAll(".dock-btn").forEach((b) => {
      b.addEventListener("click", () => {
        AudioFX.click(800);
        selectIsland(b.dataset.dockIsl, true);
      });
    });
  }
  renderDock();

  function renderStaffFilterChips() {
    const box = $("#staff-filter-chips");
    box.innerHTML = `
      <button class="filter-chip active" data-staff="all">👥 部務室全體 (5人)</button>
      ${DATA.hqStaff.map((s) => `
        <button class="filter-chip" data-staff="${s.id}">
          <i style="background:${s.badgeColor}"></i>
          <span>${s.name}（${s.role.split("・")[0]}）</span>
        </button>
      `).join("")}
    `;
    box.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        AudioFX.click(780);
        box.querySelectorAll(".filter-chip").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        const stId = btn.dataset.staff;
        if (stId === "all") {
          activeStaffId = null;
          activeFlowId = null;
          updateFlowVisibility();
          updateSelectionHighlights();
        } else {
          selectStaffMember(stId);
        }
      });
    });
  }
  renderStaffFilterChips();

  function renderSidebarTree(query = "") {
    const tree = $("#tree");
    const q = query.trim().toLowerCase();

    if (currentSidebarTab === "islands") {
      tree.innerHTML = DATA.islands
        .filter((isl) => {
          if (!q) return true;
          const hay = [
            isl.name, isl.county, isl.supervisor, isl.division, isl.summary,
            ...isl.buildings.map((b) => b.name + " " + b.owner + " " + b.desc)
          ].join(" ").toLowerCase();
          return hay.includes(q);
        })
        .map((isl) => `
          <details data-isl="${isl.id}" ${selectedIslandId === isl.id || q ? "open" : ""}>
            <summary>
              <span class="index">${isl.index}</span>
              <span class="item-name">${isl.shortName}</span>
              <span class="sup-badge">${isl.county}・${isl.supervisor.split("、")[0]}${isl.supervisor.includes("、") ? "等" : ""}</span>
              <span class="count">${isl.buildings.length} ↗</span>
            </summary>
            <div class="children">
              <button type="button" class="island-open" data-open-isl="${isl.id}">
                🏝️ 飛往【${isl.name}】完整大綱 ↗
              </button>
              ${isl.buildings.map((b) => `
                <button type="button" data-open-bldg="${b.id}" data-bldg-isl="${isl.id}">
                  <b class="pin-no">${b.pin}</b>
                  <span>${b.name}</span>
                </button>
              `).join("")}
            </div>
          </details>
        `).join("");

      tree.querySelectorAll("[data-open-isl]").forEach((btn) => {
        btn.addEventListener("click", () => {
          AudioFX.click(820);
          selectIsland(btn.dataset.openIsl, true);
        });
      });
      tree.querySelectorAll("[data-open-bldg]").forEach((btn) => {
        btn.addEventListener("click", () => {
          AudioFX.click(900);
          selectBuilding(btn.dataset.bldgIsl, btn.dataset.openBldg, true);
        });
      });
    } else if (currentSidebarTab === "staff") {
      tree.innerHTML = DATA.hqStaff
        .filter((s) => !q || (s.name + s.role + s.duties.join(" ")).toLowerCase().includes(q))
        .map((s) => `
          <button type="button" class="flow-item-card ${activeStaffId === s.id ? "active" : ""}" data-staff-card="${s.id}">
            <div class="flow-item-head">
              <span>👤 <strong>${s.name}</strong>（簡報 P.${s.slideNo}）</span>
              <span class="flow-code-pill" style="background:${s.badgeColor}">${s.categories.join(" / ")}</span>
            </div>
            <div style="font-size:12px;font-weight:700;color:var(--ink);">${s.role}</div>
            <div class="flow-item-desc">${s.summary}</div>
          </button>
        `).join("");

      tree.querySelectorAll("[data-staff-card]").forEach((btn) => {
        btn.addEventListener("click", () => {
          AudioFX.click(840);
          selectStaffMember(btn.dataset.staffCard);
        });
      });
    } else if (currentSidebarTab === "flows") {
      tree.innerHTML = DATA.flows
        .filter((f) => !q || (f.title + f.owner + f.desc).toLowerCase().includes(q))
        .map((f) => `
          <button type="button" class="flow-item-card ${activeFlowId === f.id ? "active" : ""}" data-flow-card="${f.id}">
            <div class="flow-item-head">
              <span>${f.category}</span>
              <span class="flow-code-pill" style="background:${f.color}">${f.code}</span>
            </div>
            <div style="font-size:12px;font-weight:800;">負責人員：${f.owner}</div>
            <div class="flow-item-desc">${f.desc}</div>
          </button>
        `).join("");

      tree.querySelectorAll("[data-flow-card]").forEach((btn) => {
        btn.addEventListener("click", () => {
          AudioFX.click(860);
          selectFlow(btn.dataset.flowCard);
        });
      });
    }
  }
  renderSidebarTree();

  // 選取島嶼並展開詳情卡
  function selectIsland(islandId, moveCamera = true) {
    const isl = DATA.islands.find((i) => i.id === islandId);
    if (!isl) return;
    selectedIslandId = isl.id;
    selectedBuildingId = null;
    activeFlowId = null;
    activeStaffId = null;
    updateFlowVisibility();
    updateSelectionHighlights();

    if (moveCamera) {
      const c = islandCenters.get(isl.id);
      flyTo(
        c.clone().add(new THREE.Vector3(0, 0.35, 0)),
        c.clone().add(new THREE.Vector3(3.8, 5.2, 6.2)),
        850
      );
    }

    const idx = DATA.islands.findIndex((i) => i.id === isl.id);
    const prevIsl = DATA.islands[(idx - 1 + DATA.islands.length) % DATA.islands.length];
    const nextIsl = DATA.islands[(idx + 1) % DATA.islands.length];

    const card = $("#card");
    const content = $("#card-content");
    card.hidden = false;

    content.innerHTML = `
      <div class="card-eyebrow">
        <span class="badge-pill coral">ISLAND ${isl.index}</span>
        <span class="badge-pill">${isl.county}</span>
        <span class="badge-pill teal">${isl.division}</span>
      </div>
      <h2 class="card-title">${isl.icon} ${isl.name}</h2>
      <div class="card-supervisor-box">
        <div class="sup-avatar">🧑‍⚕️</div>
        <div>
          <div class="sup-label">${isl.supervisorTitle}</div>
          <div class="sup-name">${isl.supervisor}</div>
        </div>
      </div>
      <p class="card-summary">${isl.summary}</p>

      <div class="card-section-title">📋 院區介紹大綱（依 PPTX 簡報內容制定）</div>
      ${isl.outline.map((sec) => `
        <div class="outline-box">
          <h4>${sec.title}</h4>
          <ul>
            ${sec.points.map((p) => `<li>${p}</li>`).join("")}
          </ul>
        </div>
      `).join("")}

      <div class="card-section-title">🏛️ 島上微縮業務據點（點擊聚焦 3D 建築）</div>
      <div class="bldg-grid-list">
        ${isl.buildings.map((b) => `
          <button type="button" class="bldg-card-btn" data-card-bldg="${b.id}">
            <div class="b-top">
              <span style="color:var(--coral)">${b.pin}</span>
              <span>${b.name}</span>
            </div>
            <div class="b-owner">負責／對接：${b.owner}</div>
            <div class="b-desc">${b.desc}</div>
          </button>
        `).join("")}
      </div>

      <div class="inline-quiz-card">
        <div class="inline-quiz-q">🎯 本島隨堂小測驗：${isl.quiz.q}</div>
        <div class="inline-quiz-opts">
          ${isl.quiz.options.map((opt, oIdx) => `
            <button type="button" data-qopt="${oIdx}">${String.fromCharCode(65 + oIdx)}. ${opt}</button>
          `).join("")}
        </div>
        <div class="inline-quiz-exp" id="inline-quiz-exp" hidden></div>
      </div>

      <div class="card-nav-row">
        <button type="button" id="card-prev-isl">← ${prevIsl.index} ${prevIsl.shortName}</button>
        <button type="button" id="card-next-isl">${nextIsl.index} ${nextIsl.shortName} →</button>
      </div>
    `;

    content.querySelectorAll("[data-card-bldg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        AudioFX.click(900);
        selectBuilding(isl.id, btn.dataset.cardBldg, true);
      });
    });

    content.querySelectorAll("[data-qopt]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const chosen = Number(btn.dataset.qopt);
        const isCorrect = chosen === isl.quiz.answer;
        AudioFX.chime(isCorrect);
        content.querySelectorAll("[data-qopt]").forEach((b, i) => {
          b.classList.toggle("correct", i === isl.quiz.answer);
          if (i === chosen && !isCorrect) b.classList.add("wrong");
        });
        const exp = $("#inline-quiz-exp");
        exp.hidden = false;
        exp.textContent = (isCorrect ? "✅ 答對了！" : "💡 解析：") + isl.quiz.explanation;
      });
    });

    $("#card-prev-isl").onclick = () => { AudioFX.click(780); selectIsland(prevIsl.id, true); };
    $("#card-next-isl").onclick = () => { AudioFX.click(780); selectIsland(nextIsl.id, true); };
  }

  // 選取島上特定微縮建築
  function selectBuilding(islandId, buildingId, moveCamera = true) {
    const isl = DATA.islands.find((i) => i.id === islandId);
    const bInfo = buildingGroups.get(buildingId);
    if (!isl || !bInfo) return;

    if (selectedIslandId !== islandId || $("#card").hidden) {
      selectIsland(islandId, false);
    }
    selectedBuildingId = buildingId;
    updateSelectionHighlights();

    $$("#card-content .bldg-card-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.cardBldg === buildingId);
      if (btn.dataset.cardBldg === buildingId) {
        btn.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });

    if (moveCamera) {
      const target = bInfo.worldPos.clone();
      flyTo(
        target,
        target.clone().add(new THREE.Vector3(2.1, 2.4, 3.1)),
        720
      );
    }
  }

  // 選取部務室五位人員之一
  function selectStaffMember(staffId) {
    const staff = DATA.hqStaff.find((s) => s.id === staffId);
    if (!staff) return;
    activeStaffId = staffId;
    selectedIslandId = "headquarters";
    const c = islandCenters.get("headquarters");
    flyTo(
      c.clone().add(new THREE.Vector3(0, 0.5, 0)),
      c.clone().add(new THREE.Vector3(4.2, 6.2, 7.2)),
      850
    );

    const relatedFlows = DATA.flows.filter((f) => f.owner.includes(staff.name));
    const relatedIds = new Set(relatedFlows.map((f) => f.id));
    flowVisuals.forEach((v, fId) => {
      v.group.visible = relatedIds.has(fId);
    });

    const card = $("#card");
    const content = $("#card-content");
    card.hidden = false;
    content.innerHTML = `
      <div class="card-eyebrow">
        <span class="badge-pill coral">部務室核心人員</span>
        <span class="badge-pill">位於桃園 (06 部務室中樞島)</span>
        <span class="badge-pill teal">簡報第 ${staff.slideNo} 頁</span>
      </div>
      <h2 class="card-title">👤 ${staff.name}</h2>
      <div class="card-supervisor-box">
        <div class="sup-avatar">⭐</div>
        <div>
          <div class="sup-label">業務分工類別：${staff.categories.join(" ‧ ")}</div>
          <div class="sup-name">${staff.role}</div>
        </div>
      </div>
      <p class="card-summary">${staff.summary}</p>
      <div class="card-section-title">📌 負責業務明細（完整對照簡報第 ${staff.slideNo} 頁）</div>
      <div class="outline-box">
        <ul>
          ${staff.duties.map((d) => `<li>${d}</li>`).join("")}
        </ul>
      </div>
      <div class="card-section-title">🌈 主導與協同之跨院協作線 (${relatedFlows.length} 條)</div>
      <div class="bldg-grid-list">
        ${relatedFlows.map((f) => `
          <button type="button" class="bldg-card-btn" data-staff-flow="${f.id}">
            <div class="b-top"><span style="color:${f.color}">${f.code}</span> <span>${f.category}</span></div>
            <div class="b-owner">負責人員：${f.owner}</div>
            <div class="b-desc">${f.desc}</div>
          </button>
        `).join("")}
      </div>
      <div class="card-nav-row">
        <button type="button" id="staff-back-hq">🏝️ 查看部務室中樞島全景</button>
      </div>
    `;
    content.querySelectorAll("[data-staff-flow]").forEach((btn) => {
      btn.addEventListener("click", () => {
        AudioFX.click(860);
        selectFlow(btn.dataset.staffFlow);
      });
    });
    $("#staff-back-hq").onclick = () => selectIsland("headquarters", true);
    updateSelectionHighlights();
  }

  // 選取八大業務分工協作線之一
  function selectFlow(flowId) {
    const f = DATA.flows.find((x) => x.id === flowId);
    if (!f) return;
    activeFlowId = flowId;
    activeStaffId = null;
    updateFlowVisibility();
    updateSelectionHighlights();

    flyTo(OVERVIEW_TARGET, OVERVIEW_POS, 850);

    const card = $("#card");
    const content = $("#card-content");
    card.hidden = false;
    content.innerHTML = `
      <div class="card-eyebrow">
        <span class="badge-pill" style="background:${f.color}">${f.code} 業務分工線</span>
        <span class="badge-pill">簡報第 8 頁「業務分工總覽」</span>
      </div>
      <h2 class="card-title">🌈 ${f.category}</h2>
      <div class="card-supervisor-box">
        <div class="sup-avatar">🤝</div>
        <div>
          <div class="sup-label">部務室負責人員</div>
          <div class="sup-name">${f.owner}</div>
        </div>
      </div>
      <p class="card-summary">${f.desc}</p>
      <div class="card-section-title">🏥 串聯協作示範院區島嶼</div>
      <div class="bldg-grid-list">
        ${["headquarters", ...f.targets].map((id) => {
          const isl = DATA.islands.find((i) => i.id === id);
          if (!isl) return "";
          return `
            <button type="button" class="bldg-card-btn" data-flow-isl="${isl.id}">
              <div class="b-top"><span style="color:var(--coral)">${isl.index}</span> <span>${isl.name}（${isl.county}）</span></div>
              <div class="b-owner">主管／人員：${isl.supervisor}</div>
            </button>
          `;
        }).join("")}
      </div>
    `;
    content.querySelectorAll("[data-flow-isl]").forEach((btn) => {
      btn.addEventListener("click", () => {
        AudioFX.click(820);
        selectIsland(btn.dataset.flowIsl, true);
      });
    });
  }

  function updateFlowVisibility() {
    const toggleOn = $(`[data-toggle="flows"]`).classList.contains("active");
    flowsGroup.visible = toggleOn;
    flowVisuals.forEach((v, id) => {
      v.group.visible = !activeFlowId || activeFlowId === id;
    });
  }

  function updateSelectionHighlights() {
    const highlightedSet = new Set();
    if (activeFlowId) {
      const f = DATA.flows.find((x) => x.id === activeFlowId);
      if (f) {
        highlightedSet.add("headquarters");
        f.targets.forEach((t) => highlightedSet.add(t));
      }
    } else if (activeRegion !== "all") {
      DATA.islands.forEach((isl) => {
        if (isl.region === activeRegion) highlightedSet.add(isl.id);
      });
    }

    islandLabelEls.forEach((el, id) => {
      el.classList.toggle("selected", selectedIslandId === id);
      const dimmed = highlightedSet.size > 0 && !highlightedSet.has(id);
      el.classList.toggle("dim", dimmed);
    });

    $$("#dock .dock-btn").forEach((b) => {
      b.classList.toggle("active", b.dataset.dockIsl === selectedIslandId);
    });
  }

  // =========================================================================
  // 11. 24 小時日夜光影系統 (Day/Night Atmospheric Keyframes)
  // =========================================================================
  let currentMinutes = 600; // 預設 10:00 白天
  let isDayPlaying = false;

  const DAY_KEYS = [
    { min: 0,    top: 0x1e2c58, hor: 0x3f4f80, sun: 0xb4c2ff, sunI: 0.45, hemiI: 0.45, night: 1.0, water: 0x4f7ca6, label: "🌙 深夜靜謐" },
    { min: 360,  top: 0x7f8fc4, hor: 0xf6c3a6, sun: 0xffb48a, sunI: 0.95, hemiI: 0.75, night: 0.45, water: 0x8fb7c4, label: "🌅 清晨備藥" },
    { min: 600,  top: 0x9fd0ec, hor: 0xf4eee3, sun: 0xfff1de, sunI: 1.38, hemiI: 0.95, night: 0.0, water: 0xa4d4da, label: "☀️ 白天門診尖峰" },
    { min: 960,  top: 0xa6cfe6, hor: 0xf8e7d2, sun: 0xffe3c0, sunI: 1.25, hemiI: 0.9,  night: 0.05, water: 0x9fcbd2, label: "🌤️ 午後調撥稽核" },
    { min: 1080, top: 0x7a7eb8, hor: 0xf5ad84, sun: 0xff945c, sunI: 0.88, hemiI: 0.72, night: 0.55, water: 0x7f98b0, label: "🌇 黃昏夜診開啟" },
    { min: 1260, top: 0x22325f, hor: 0x445488, sun: 0xc0ccff, sunI: 0.5,  hemiI: 0.48, night: 0.95, water: 0x527ea8, label: "🌙 夜間燈火守護" },
    { min: 1440, top: 0x1e2c58, hor: 0x3f4f80, sun: 0xb4c2ff, sunI: 0.45, hemiI: 0.45, night: 1.0, water: 0x4f7ca6, label: "🌙 深夜靜謐" }
  ];

  function updateDayNight(mins) {
    currentMinutes = ((mins % 1440) + 1440) % 1440;
    let k0 = DAY_KEYS[0], k1 = DAY_KEYS[DAY_KEYS.length - 1];
    for (let i = 0; i < DAY_KEYS.length - 1; i++) {
      if (currentMinutes >= DAY_KEYS[i].min && currentMinutes < DAY_KEYS[i + 1].min) {
        k0 = DAY_KEYS[i];
        k1 = DAY_KEYS[i + 1];
        break;
      }
    }
    const span = Math.max(1, k1.min - k0.min);
    const t = (currentMinutes - k0.min) / span;

    skyUniforms.uTop.value.setHex(k0.top).lerp(new THREE.Color(k1.top), t);
    skyUniforms.uHorizon.value.setHex(k0.hor).lerp(new THREE.Color(k1.hor), t);
    skyUniforms.uSun.value.setHex(k0.sun).lerp(new THREE.Color(k1.sun), t);
    const night = k0.night + (k1.night - k0.night) * t;
    skyUniforms.uNight.value = night;
    waterUniforms.uNight.value = night;
    waterUniforms.uColor.value.setHex(k0.water).lerp(new THREE.Color(k1.water), t);
    scene.fog.color.copy(skyUniforms.uHorizon.value);

    sunLight.color.copy(skyUniforms.uSun.value);
    sunLight.intensity = k0.sunI + (k1.sunI - k0.sunI) * t;
    hemiLight.intensity = k0.hemiI + (k1.hemiI - k0.hemiI) * t;

    const sunAngle = ((currentMinutes - 360) / 720) * Math.PI;
    const sx = Math.cos(sunAngle) * 26;
    const sy = Math.max(6, Math.sin(sunAngle) * 28);
    sunLight.position.set(cityCenter.x + sx, sy, cityCenter.z + 14);
    skyUniforms.uSunDir.value.set(sx, sy, 14).normalize();

    // 夜晚窗戶與燈籠自發光增強
    MAT.windowGlow.emissiveIntensity = 0.18 + night * 0.95;
    MAT.lanternGlow.emissiveIntensity = 0.3 + night * 1.1;

    const hh = String(Math.floor(currentMinutes / 60)).padStart(2, "0");
    const mm = String(Math.floor(currentMinutes % 60)).padStart(2, "0");
    $("#clock").textContent = `${hh}:${mm}`;
    $("#day-slider").value = String(Math.round(currentMinutes));
    $("#period-badge").textContent = k0.label;
  }
  updateDayNight(600);

  // =========================================================================
  // 12. 城市運作日誌 (#log)、業務總覽表彈窗與全體系隨堂測驗彈窗
  // =========================================================================
  function populateLiveLog() {
    const logs = [
      { time: "08:30", isl: "headquarters", text: "【部務室・陳立偉】召開北院區中藥局晨間業務綜理連線。" },
      { time: "09:10", isl: "keelung", text: "【基隆＋情人湖・藍煒皓主管】完成雨都防潮藥庫溫濕度巡檢與門診開櫃。" },
      { time: "09:40", isl: "taipei", text: "【台北院區・謝建欣主管】高速智慧條碼調劑台啟動尖峰門診覆核。" },
      { time: "10:15", isl: "headquarters", text: "【部務室・邱秀麗】執行中藥濃縮製劑馬兜鈴酸抽驗與對抗品評估作業。" },
      { time: "11:00", isl: "taoyuan", text: "【桃園院區・董維軒主管 × 林昀珊】由桃園總倉完成北中雲嘉院區藥品調撥出車。" },
      { time: "13:20", isl: "linkou", text: "【林口院區・周佳玉主管 × 黃馨瑀】進行院區新藥申請開檔審核與中藥藥事小組提案。" },
      { time: "14:10", isl: "tucheng", text: "【土城院區・劉賢德主管】執行中藥範本條碼藥品資料同步與材料滯存盤點。" },
      { time: "15:00", isl: "dali", text: "【大里仁愛・王仕雯主管】完成合作聯盟工作規範修訂整合與醫令系統對接。" },
      { time: "15:45", isl: "yunlin", text: "【雲林院區・蔡盈億主管 × 嘉義院區・戴俊典主管】啟動雲嘉雙星藥事教育訓練聯防。" },
      { time: "16:30", isl: "kaohsiung", text: "【高雄＋鳳山＋大同・郭姮均、王麗綺主管】統籌南區三院區科中品管與 P 認證進階初審。" },
      { time: "17:20", isl: "headquarters", text: "【部務室・陳貴福 × 黃馨瑀】彙整全體系醫令系統績效、自費品項績效與部務工作報告。" }
    ];
    const ol = $("#log-list");
    ol.innerHTML = logs.map((l) => `
      <li data-log-isl="${l.isl}"><strong>${l.time}</strong> ${l.text}</li>
    `).join("");
    ol.querySelectorAll("li").forEach((li) => {
      li.addEventListener("click", () => {
        AudioFX.click(820);
        selectIsland(li.dataset.logIsl, true);
      });
    });
  }
  populateLiveLog();

  function renderMatrixModal() {
    const body = $("#matrix-modal-body");
    body.innerHTML = `
      <h3 style="margin-bottom:8px;color:var(--coral);">一、各院區中藥科主管與台灣縣市島嶼對照表（簡報 P.1–2）</h3>
      <table class="matrix-table">
        <thead>
          <tr>
            <th>北南序號</th>
            <th>島嶼名稱</th>
            <th>所在縣市</th>
            <th>隸屬科別</th>
            <th>主管／負責人員</th>
            <th>微縮地標與核心業務重點</th>
          </tr>
        </thead>
        <tbody>
          ${DATA.islands.map((isl) => `
            <tr>
              <td><strong>${isl.index}</strong></td>
              <td><a href="#${isl.id}" data-modal-isl="${isl.id}" style="font-weight:800;color:var(--coral);">${isl.name}</a></td>
              <td>${isl.county}</td>
              <td>${isl.division}</td>
              <td><strong>${isl.supervisor}</strong></td>
              <td>${isl.landmark}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <h3 style="margin:18px 0 8px;color:var(--coral);">二、部務室（位於桃園）五位人員專責業務總覽（簡報 P.3–7）</h3>
      <table class="matrix-table">
        <thead>
          <tr>
            <th style="width:95px;">人員</th>
            <th style="width:180px;">核心定位</th>
            <th>負責業務細項（完整對照 PPTX 簡報）</th>
          </tr>
        </thead>
        <tbody>
          ${DATA.hqStaff.map((s) => `
            <tr>
              <td><strong>${s.name}</strong><br><small style="color:var(--muted);">簡報 P.${s.slideNo}</small></td>
              <td><strong>${s.role}</strong></td>
              <td>
                <ul style="margin:0;padding-left:18px;">
                  ${s.duties.map((d) => `<li>${d}</li>`).join("")}
                </ul>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <h3 style="margin:18px 0 8px;color:var(--coral);">三、八大業務分工總覽表（簡報 P.8）</h3>
      <table class="matrix-table">
        <thead>
          <tr>
            <th style="width:90px;">協作線代碼</th>
            <th style="width:160px;">業務類別</th>
            <th style="width:240px;">負責人員</th>
            <th>跨院協作說明</th>
          </tr>
        </thead>
        <tbody>
          ${DATA.flows.map((f) => `
            <tr>
              <td><span class="flow-code-pill" style="background:${f.color}">${f.code}</span></td>
              <td><strong>${f.category}</strong></td>
              <td><strong>${f.owner}</strong></td>
              <td>${f.desc}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    body.querySelectorAll("[data-modal-isl]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        $("#matrix-modal").hidden = true;
        selectIsland(a.dataset.modalIsl, true);
      });
    });
  }
  renderMatrixModal();

  // 隨堂測驗彈窗
  let quizIdx = 0;
  let quizScore = 0;
  function openQuizModal() {
    quizIdx = 0;
    quizScore = 0;
    $("#quiz-modal").hidden = false;
    renderQuizStep();
  }

  function renderQuizStep() {
    const body = $("#quiz-modal-body");
    const questions = DATA.islands.map((isl) => ({
      islandName: isl.name,
      ...isl.quiz
    }));

    if (quizIdx >= questions.length) {
      body.innerHTML = `
        <div style="text-align:center;padding:20px 10px;">
          <div style="font-size:46px;margin-bottom:8px;">🏆</div>
          <h3 style="font-size:22px;margin-bottom:8px;">恭喜完成「長庚中藥群島」全體系隨堂測驗！</h3>
          <p style="font-size:15px;color:var(--muted);margin-bottom:18px;">
            您的得分：<strong style="color:var(--coral);font-size:20px;">${quizScore} / ${questions.length}</strong>
          </p>
          <button type="button" id="quiz-restart-btn" class="active" style="padding:10px 22px;font-weight:800;">🔄 重新挑戰一次</button>
        </div>
      `;
      $("#quiz-restart-btn").onclick = openQuizModal;
      return;
    }

    const cur = questions[quizIdx];
    body.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <span class="badge-pill coral">第 ${quizIdx + 1} / ${questions.length} 題 ‧ ${cur.islandName}</span>
        <span style="font-size:12px;font-weight:800;color:var(--muted);">目前得分：${quizScore}</span>
      </div>
      <h3 style="font-size:16px;line-height:1.5;margin-bottom:14px;">${cur.q}</h3>
      <div class="inline-quiz-opts" id="modal-q-opts">
        ${cur.options.map((opt, i) => `
          <button type="button" data-mq="${i}" style="font-size:13px;padding:9px 12px;">
            <strong>${String.fromCharCode(65 + i)}.</strong> ${opt}
          </button>
        `).join("")}
      </div>
      <div class="inline-quiz-exp" id="modal-q-exp" hidden style="margin-top:12px;font-size:12px;"></div>
      <div style="margin-top:16px;display:flex;justify-content:flex-end;">
        <button type="button" id="modal-q-next" class="active" hidden>下一題 →</button>
      </div>
    `;

    let answered = false;
    body.querySelectorAll("[data-mq]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (answered) return;
        answered = true;
        const chosen = Number(btn.dataset.mq);
        const ok = chosen === cur.answer;
        if (ok) quizScore++;
        AudioFX.chime(ok);
        body.querySelectorAll("[data-mq]").forEach((b, i) => {
          b.classList.toggle("correct", i === cur.answer);
          if (i === chosen && !ok) b.classList.add("wrong");
        });
        const exp = $("#modal-q-exp");
        exp.hidden = false;
        exp.textContent = (ok ? "✅ 正確！" : "💡 解析：") + cur.explanation;
        $("#modal-q-next").hidden = false;
      });
    });

    $("#modal-q-next").onclick = () => {
      quizIdx++;
      renderQuizStep();
    };
  }

  // =========================================================================
  // 13. Raycaster 3D 滑鼠懸浮與點擊互動 + 自動巡島導覽
  // =========================================================================
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDownPos = { x: 0, y: 0 };

  renderer.domElement.addEventListener("pointerdown", (e) => {
    pointerDownPos = { x: e.clientX, y: e.clientY };
  });

  renderer.domElement.addEventListener("pointermove", (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    if (hits.length > 0) {
      const ud = hits[0].object.userData;
      renderer.domElement.style.cursor = "pointer";
      tooltip.style.display = "block";
      tooltip.style.left = `${e.clientX}px`;
      tooltip.style.top = `${e.clientY}px`;
      if (ud.pickType === "building") {
        tooltip.innerHTML = `${ud.building.pin} <strong>${ud.building.name}</strong><br><small style="color:#fcea8b">${ud.island.shortName}｜${ud.building.owner}</small>`;
      } else if (ud.pickType === "glb") {
        tooltip.innerHTML = `🧑‍⚕️ <strong>${ud.label}</strong><br><small style="color:#fcea8b">${ud.island.name}</small>`;
      } else if (ud.pickType === "island") {
        tooltip.innerHTML = `<strong>${ud.island.index} ${ud.island.name}</strong>（${ud.island.county}）<br><small style="color:#fcea8b">主管／人員：${ud.island.supervisor}</small>`;
      }
    } else {
      renderer.domElement.style.cursor = "grab";
      tooltip.style.display = "none";
    }
  });

  renderer.domElement.addEventListener("pointerup", (e) => {
    if (Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y) > 6) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(pickables, false);
    if (hits.length > 0) {
      const ud = hits[0].object.userData;
      AudioFX.click(860);
      if (ud.pickType === "building") {
        selectBuilding(ud.island.id, ud.building.id, true);
      } else if (ud.island) {
        selectIsland(ud.island.id, true);
      }
    }
  });

  // 自動巡島導覽 (由北而南 01 -> 13)
  let tourTimer = null;
  let tourStep = 0;
  function toggleTour() {
    const btn = $("#btn-tour");
    if (tourTimer) {
      clearInterval(tourTimer);
      tourTimer = null;
      btn.classList.remove("active");
      btn.textContent = "🎬 北南巡島";
      return;
    }
    btn.classList.add("active");
    tourStep = 0;
    const stepFn = () => {
      const isl = DATA.islands[tourStep % DATA.islands.length];
      btn.textContent = `⏸ 巡島中 (${isl.index}/${DATA.islands.length})`;
      selectIsland(isl.id, true);
      tourStep++;
    };
    stepFn();
    tourTimer = setInterval(stepFn, 4200);
  }

  // =========================================================================
  // 14. 綁定工具列、HUD 與面板事件
  // =========================================================================
  $("#brand-home").onclick = (e) => { e.preventDefault(); AudioFX.click(740); resetOverview(false); };
  $("#btn-home").onclick = () => { AudioFX.click(740); resetOverview(false); };
  $("#btn-tour").onclick = () => { AudioFX.click(800); toggleTour(); };
  $("#btn-matrix").onclick = () => { AudioFX.click(820); $("#matrix-modal").hidden = false; };
  $("#matrix-close").onclick = () => { $("#matrix-modal").hidden = true; };
  $("#btn-quiz-modal").onclick = () => { AudioFX.click(840); openQuizModal(); };
  $("#sidebar-quiz-trigger").onclick = () => { AudioFX.click(840); openQuizModal(); };
  $("#quiz-modal-close").onclick = () => { $("#quiz-modal").hidden = true; };

  $("#btn-audio").onclick = () => {
    const on = AudioFX.toggle();
    $("#btn-audio").textContent = on ? "🔊 音效" : "🔇 靜音";
  };

  $("#sidebar-toggle").onclick = () => {
    AudioFX.click(720);
    document.body.classList.toggle("sidebar-collapsed");
    onResize();
  };

  $("#card-close").onclick = () => {
    $("#card").hidden = true;
    selectedBuildingId = null;
  };

  // 右側三個分頁切換
  const tabMap = {
    "tab-islands": "islands",
    "tab-staff": "staff",
    "tab-flows": "flows"
  };
  Object.entries(tabMap).forEach(([btnId, tabName]) => {
    $(`#${btnId}`).onclick = () => {
      AudioFX.click(780);
      currentSidebarTab = tabName;
      Object.keys(tabMap).forEach((id) => $(`#${id}`).classList.toggle("active", id === btnId));
      renderSidebarTree($("#search").value);
    };
  });

  $("#search").addEventListener("input", (e) => {
    renderSidebarTree(e.target.value);
  });

  // 時段按鈕切換
  $$("[data-time]").forEach((btn) => {
    btn.addEventListener("click", () => {
      AudioFX.click(760);
      $$("[data-time]").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateDayNight(Number(btn.dataset.time));
    });
  });

  // 圖層開關切換
  $$("[data-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      AudioFX.click(760);
      const kind = btn.dataset.toggle;
      const active = !btn.classList.contains("active");
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));

      if (kind === "names") showNames = active;
      if (kind === "pins") showPins = active;
      if (kind === "flows") updateFlowVisibility();
      if (kind === "people") peopleGroup.visible = active;
      if (kind === "animals") {
        animalsGroup.visible = active;
        marineGroup.visible = active;
      }
      if (kind === "plants") plantsGroup.visible = active;
      if (kind === "bird") resetOverview(active);
      if (kind === "log") $("#log").hidden = !active;
    });
  });

  $("#log-close").onclick = () => {
    $("#log").hidden = true;
    const logBtn = $(`[data-toggle="log"]`);
    logBtn.classList.remove("active");
    logBtn.setAttribute("aria-pressed", "false");
  };

  // 左下角三組控制面板切換
  $$(".control-tabs button[role='tab']").forEach((btn) => {
    btn.addEventListener("click", () => {
      AudioFX.click(750);
      const targetPanel = btn.dataset.panel;
      $$(".control-tabs button[role='tab']").forEach((b) => {
        const isSel = b === btn;
        b.classList.toggle("active", isSel);
        b.setAttribute("aria-selected", String(isSel));
      });
      $$(".controls .panel").forEach((p) => {
        p.classList.toggle("active", p.id === `panel-${targetPanel}`);
      });
    });
  });

  $("#day-slider").addEventListener("input", (e) => {
    updateDayNight(Number(e.target.value));
  });

  $("#day-play").onclick = () => {
    isDayPlaying = !isDayPlaying;
    $("#day-play").textContent = isDayPlaying ? "⏸" : "▶";
  };

  $$("#region-filter-chips .filter-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      AudioFX.click(780);
      $$("#region-filter-chips .filter-chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeRegion = btn.dataset.region;
      activeFlowId = null;
      updateSelectionHighlights();
      if (activeRegion !== "all") {
        const firstIsl = DATA.islands.find((i) => i.region === activeRegion);
        if (firstIsl) selectIsland(firstIsl.id, true);
      } else {
        resetOverview(false);
      }
    });
  });

  // 記錄視窗與右側選單寬度偏移，確保收合右側選單時 3D 畫布 100% 滿版無空白且視角平滑置中
  let currentViewOffsetX = window.innerWidth > 900 ? 174 : 0;

  function applyCameraViewOffset(w, h) {
    camera.aspect = w / Math.max(1, h);
    if (Math.abs(currentViewOffsetX) > 0.5 && w > 900) {
      camera.setViewOffset(w, h, Math.round(currentViewOffsetX), 0, w, h);
    } else {
      camera.clearViewOffset();
    }
    camera.updateProjectionMatrix();
  }

  function onResize() {
    const w = window.innerWidth || stage.clientWidth;
    const h = window.innerHeight || stage.clientHeight;
    renderer.setSize(w, h);
    applyCameraViewOffset(w, h);
  }
  window.addEventListener("resize", onResize);
  onResize();

  // =========================================================================
  // 15. 主動畫渲染迴圈 (Animation Loop)
  // =========================================================================
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const dt = Math.min(0.05, clock.getDelta());
    const elapsed = clock.getElapsedTime();

    // 確保畫布隨時 100% 貼合視窗，並平滑過渡右側選單展開／收合時的鏡頭中心偏移
    const w = window.innerWidth || stage.clientWidth;
    const h = window.innerHeight || stage.clientHeight;
    const isCollapsed = document.body.classList.contains("sidebar-collapsed") || w <= 900;
    const targetOffsetX = isCollapsed ? 0 : 174;
    if (Math.abs(currentViewOffsetX - targetOffsetX) > 0.25) {
      currentViewOffsetX += (targetOffsetX - currentViewOffsetX) * Math.min(1, dt * 11);
      applyCameraViewOffset(w, h);
    }

    waterUniforms.uTime.value = elapsed;

    // 播放日夜時間軸
    if (isDayPlaying) {
      updateDayNight(currentMinutes + dt * 45);
    }

    // 更新 GLB 3D 角色、台灣生態動物與林木植栽之動態效果
    for (let i = 0; i < mixers.length; i++) {
      mixers[i].update(dt);
    }

    for (let i = 0; i < animatedEntities.length; i++) {
      const ent = animatedEntities[i];
      const t = elapsed * ent.speed + ent.phase;
      if (ent.kind === "char") {
        // 藥師、主管與民眾：原地輕微呼吸律動與轉身巡視 (配合真實比例微調振幅)
        ent.holder.position.y = ent.basePos.y + Math.abs(Math.sin(t * 2.4)) * 0.012;
        ent.holder.rotation.y = ent.baseRotY + Math.sin(t * 0.9) * 0.32;
      } else if (ent.kind === "animal_fly") {
        // 飛行生態動物 (黑鳶、鳳蝶、蜜蜂)：在島嶼上空或花圃上方盤旋飛翔
        const rOrbit = 0.24;
        ent.holder.position.x = ent.basePos.x + Math.cos(t * 1.3) * rOrbit;
        ent.holder.position.z = ent.basePos.z + Math.sin(t * 1.3) * rOrbit;
        ent.holder.position.y = ent.basePos.y + Math.sin(t * 2.8) * 0.045;
        ent.holder.rotation.y = -t * 1.3 + Math.PI;
      } else if (ent.kind === "animal_ground") {
        // 地面與水岸動物 (梅花鹿、台灣黑熊、天鵝、聖䴉、水鴨)：漫步與點頭
        ent.holder.position.x = ent.basePos.x + Math.cos(t * 0.8) * 0.08;
        ent.holder.position.z = ent.basePos.z + Math.sin(t * 0.8) * 0.08;
        ent.holder.position.y = ent.basePos.y + Math.abs(Math.sin(t * 2.2)) * 0.012;
        ent.holder.rotation.y = ent.baseRotY + Math.sin(t * 0.8) * 0.55;
      } else if (ent.kind === "plant") {
        // 樹木與本草植物：微風輕拂搖曳
        ent.holder.rotation.z = Math.sin(t * 1.5) * 0.028;
        ent.holder.rotation.x = Math.cos(t * 1.2) * 0.02;
      } else if (ent.kind === "cloud") {
        ent.holder.position.x = ent.basePos.x + Math.sin(t * 0.25) * 0.45;
      }
    }

    // 更新海域水中生物 (鯨魚噴水、躍水海豚、台灣綠蠵龜、鬼蝠魟、珊瑚礁魚群)
    for (let i = 0; i < marineCreatures.length; i++) {
      const mc = marineCreatures[i];
      const u = elapsed * mc.speed + mc.phase;

      if (mc.kind === "whale") {
        const x = mc.cx + Math.cos(u) * mc.rx;
        const z = mc.cz + Math.sin(u) * mc.rz;
        const dx = -Math.sin(u) * mc.rx;
        const dz = Math.cos(u) * mc.rz;
        const bob = Math.sin(u * 2.2);
        mc.group.position.set(x, WATER_Y - 0.03 + bob * 0.055, z);
        mc.group.rotation.y = Math.atan2(dx, dz);
        mc.group.rotation.x = Math.cos(u * 2.2) * 0.09;

        const parts = mc.group.userData.parts;
        if (parts) {
          parts.tailPivot.rotation.x = Math.sin(elapsed * 2.8 + mc.phase) * 0.24;
          // 當鯨魚背部浮出水面 (bob > 0.15) 時噴出白色換氣水柱
          const spoutActive = Math.max(0, (bob - 0.1) / 0.9);
          parts.spoutGroup.visible = spoutActive > 0.04;
          parts.spoutGroup.scale.set(
            0.7 + spoutActive * 0.6,
            0.3 + spoutActive * 1.35,
            0.7 + spoutActive * 0.6
          );
          const pulse = (elapsed * 0.8 + mc.phase) % 1;
          parts.ripple.scale.setScalar(0.85 + pulse * 0.75);
        }
        if (mc.labelAnchor) {
          mc.labelAnchor.set(x, WATER_Y + 0.42, z);
        }
      } else if (mc.kind === "dolphin") {
        const x = mc.cx + Math.cos(u) * mc.rx;
        const z = mc.cz + Math.sin(u) * mc.rz;
        const dx = -Math.sin(u) * mc.rx;
        const dz = Math.cos(u) * mc.rz;
        // 週期性拋物線躍出水面
        const leapWave = Math.sin(u * 2.4);
        const isLeaping = leapWave > 0;
        const yOffset = isLeaping ? leapWave * 0.34 : leapWave * 0.04;
        mc.group.position.set(x, WATER_Y - 0.01 + yOffset, z);
        mc.group.rotation.y = Math.atan2(dx, dz);
        mc.group.rotation.x = isLeaping ? -Math.cos(u * 2.4) * 0.58 : 0.05;

        const parts = mc.group.userData.parts;
        if (parts && parts.tailFluke) {
          parts.tailFluke.rotation.x = Math.sin(elapsed * 7.5 + mc.phase) * 0.35;
        }
        if (mc.splashRing) {
          mc.splashRing.position.set(x, WATER_Y + 0.012, z);
          const ringScale = isLeaping ? 0.6 + (1 - leapWave) * 1.4 : 0.4;
          mc.splashRing.scale.setScalar(ringScale);
          mc.splashRing.visible = Math.abs(leapWave) < 0.45;
        }
        if (mc.labelAnchor) {
          mc.labelAnchor.set(x, WATER_Y + 0.38, z);
        }
      } else if (mc.kind === "turtle") {
        const x = mc.cx + Math.cos(u) * mc.rx;
        const z = mc.cz + Math.sin(u) * mc.rz;
        const dx = -Math.sin(u) * mc.rx;
        const dz = Math.cos(u) * mc.rz;
        mc.group.position.set(x, WATER_Y - 0.02 + Math.sin(u * 1.8) * 0.022, z);
        mc.group.rotation.y = Math.atan2(dx, dz);
        const parts = mc.group.userData.parts;
        if (parts) {
          const flap = Math.sin(elapsed * 3.6 + mc.phase) * 0.32;
          parts.flipperL.rotation.z = flap;
          parts.flipperR.rotation.z = -flap;
        }
        if (mc.labelAnchor) {
          mc.labelAnchor.set(x, WATER_Y + 0.22, z);
        }
      } else if (mc.kind === "manta") {
        const x = mc.cx + Math.cos(u) * mc.rx;
        const z = mc.cz + Math.sin(u) * mc.rz;
        const dx = -Math.sin(u) * mc.rx;
        const dz = Math.cos(u) * mc.rz;
        mc.group.position.set(x, WATER_Y - 0.032 + Math.sin(u * 1.5) * 0.018, z);
        mc.group.rotation.y = Math.atan2(dx, dz);
        const parts = mc.group.userData.parts;
        if (parts) {
          const wingFlap = Math.sin(elapsed * 3.2 + mc.phase) * 0.28;
          parts.wingL.rotation.z = wingFlap;
          parts.wingR.rotation.z = -wingFlap;
        }
      } else if (mc.kind === "fish_school") {
        const x = mc.cx + Math.cos(u) * mc.orbitR;
        const z = mc.cz + Math.sin(u) * mc.orbitR;
        const dx = -Math.sin(u) * mc.orbitR;
        const dz = Math.cos(u) * mc.orbitR;
        mc.group.position.set(x, WATER_Y - 0.024 + Math.sin(u * 3.0) * 0.018, z);
        mc.group.rotation.y = Math.atan2(dx, dz);
        for (let f = 0; f < mc.fishList.length; f++) {
          const fish = mc.fishList[f];
          fish.rotation.y = Math.sin(elapsed * 8.0 + f) * 0.22;
        }
      }
    }

    // 更新環島步道與跨海拱橋上行走的真實比例藥師／主管／民眾
    for (let i = 0; i < walkingPeople.length; i++) {
      const wp = walkingPeople[i];
      wp.progress = (wp.progress + dt * wp.speed) % 1;
      const pts = wp.waypoints;
      if (pts.length >= 2) {
        let p0, p1, segU;
        if (wp.loop) {
          const total = pts.length;
          const exact = wp.progress * total;
          const idx0 = Math.floor(exact) % total;
          const idx1 = (idx0 + 1) % total;
          segU = exact - Math.floor(exact);
          p0 = pts[idx0];
          p1 = pts[idx1];
        } else {
          // 沿多段拱橋折線折返行走，確保全程走在島面與拱橋橋面上
          const pingPong = wp.progress < 0.5 ? wp.progress * 2 : (1 - wp.progress) * 2;
          const exact = pingPong * (pts.length - 1);
          const idx0 = Math.min(pts.length - 2, Math.floor(exact));
          const idx1 = idx0 + 1;
          segU = exact - idx0;
          p0 = pts[idx0];
          p1 = pts[idx1];
        }
        wp.group.position.lerpVectors(p0, p1, segU);
        const stepPhase = elapsed * 9.0 + wp.phase;
        wp.group.position.y += Math.abs(Math.sin(stepPhase)) * 0.012;
        const dx = p1.x - p0.x;
        const dz = p1.z - p0.z;
        if (Math.hypot(dx, dz) > 0.001) {
          wp.group.rotation.y = Math.atan2(dx, dz);
        }
        const parts = wp.group.userData.parts;
        if (parts) {
          const swing = Math.sin(stepPhase) * 0.42;
          parts.legL.rotation.x = swing;
          parts.legR.rotation.x = -swing;
          parts.armL.rotation.x = -swing * 0.65;
          parts.armR.rotation.x = swing * 0.65;
        }
      }
    }

    // 更新協作線脈衝光球
    flowPulses.forEach((p) => {
      const u = (elapsed * p.speed + p.offset) % 1;
      p.curve.getPoint(u, p.mesh.position);
    });

    // 更新部務室星環核心浮動動畫
    animatedProps.forEach((item) => {
      if (item.type === "spin_bob") {
        item.mesh.rotation.y = elapsed * 1.4;
        item.mesh.position.y = item.baseY + Math.sin(elapsed * 2.5) * 0.06;
      }
    });

    // 平滑鏡頭過渡 (easeInOutCubic)
    if (camAnim) {
      const u = Math.min(1, (performance.now() - camAnim.startTime) / camAnim.duration);
      const ease = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      camera.position.lerpVectors(camAnim.startPos, camAnim.endPos, ease);
      controls.target.lerpVectors(camAnim.startTarget, camAnim.endTarget, ease);
      if (u >= 1) camAnim = null;
    }

    controls.update();
    renderer.render(scene, camera);
    updateFloatingLabels();
  }
  animate();
})();
