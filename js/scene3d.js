/**
 * Scene3D — Kaydırmaya Bağlı 3D Arazi Maketi (Three.js)
 * ======================================================
 *
 * FİKİR:
 * Sayfanın arkasında küçük bir arazi maketi durur: kiremit çatılı ev ve çatı
 * panelleri, güneşi takip eden panel dizisi, elektrikli çit, ahır + güvenlik
 * kameraları, karavan ve 3D printer'lı atölye. Sayfa aşağı kaydırıldıkça
 * kamera maket üzerinde gezinir ve gün ilerler (şafak → öğle → gün batımı → gece).
 * Gündüz paneller güneşi takip eder, gece kameraların tarama ışınları yanar.
 *
 * HIZ KURALI (önemli):
 * - Sayfa 3D'yi BEKLEMEZ. Bu dosya küçük bir modüldür; Three.js kütüphanesi
 *   sayfa tamamen yüklendikten sonra, tarayıcı boşta iken indirilir.
 * - Hiç 3D model / doku dosyası indirilmez; her şey kodla çizilir.
 * - Telefonda ve zayıf cihazlarda hafif mod (gölgesiz, düşük çözünürlük, 30 fps).
 * - "Azaltılmış hareket", veri tasarrufu modu, 2G bağlantı veya WebGL yoksa
 *   3D hiç yüklenmez; site normal (düz) tasarımıyla görünür.
 *
 * NASIL BAĞLANIR:
 * - HTML: <body data-scene="home"> ve sayfanın sonunda
 *   <script src="js/scene3d.js" defer></script>
 *   (type="module" KULLANMAYIN — dosyaya çift tıklayıp açınca (file://) çalışmaz.
 *    Three.js dosyanın içinde dinamik import() ile yüklenir.)
 * - CSS: css/scene3d.css (sadece 3D çalışınca devreye giren stiller)
 *
 * DEĞİŞTİRMEK İÇİN:
 * - Kamera açıları: SHOTS (pos = kamera konumu, look = bakılan nokta)
 * - Hangi bölümde hangi açı / saat: PAGES (sıra, <main> içindeki <section> sırasıdır)
 *   Saat: 0 = şafak, 0.3 = öğle, 0.72 = gün batımı, 1 = gece
 * - Gökyüzü renkleri: SKY
 */
(function () {
'use strict';

/* Three.js ve eklentileri aynı kaynaktan (+esm) — eklentiler aynı Three.js kopyasını kullanır */
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';
const THREE_URL = CDN + '+esm';
const ADDON = function (path) { return CDN + 'examples/jsm/' + path + '/+esm'; };

/* ---- Kamera açıları ---- */
const SHOTS = {
  overview: { pos: [14, 15, 32],    look: [-1, 0, 0] },
  solar:    { pos: [-1, 7, 13],     look: [-10, 1, -3] },
  panels:   { pos: [-3.5, 3.4, 1.5], look: [-11, 1.4, -7] },
  house:    { pos: [-1, 4.5, 15],   look: [-9, 2, 4] },
  barn:     { pos: [17, 7, 10],     look: [8, 2, -3] },
  poleCam:  { pos: [10.5, 5.4, 6],  look: [4.6, 3.2, -1] },
  caravan:  { pos: [18.5, 3.5, 11], look: [12.5, 1, 2.5] },
  workshop: { pos: [9, 5, 20],      look: [5, 1.5, 8] },
  printer:  { pos: [2.9, 2.5, 11.6], look: [2.75, 1.45, 7] },   /* sol oda: 3D modelleme + printer */
  web:      { pos: [7.6, 2.3, 11.4], look: [7.3, 1.6, 6.8] },   /* sağ oda: web geliştirme */
  houseLit: { pos: [-4.5, 3.4, 13.5], look: [-8.6, 1.7, 5.4] },
  aerial:   { pos: [-20, 17, 24],   look: [2, 0, -2] },
  low:      { pos: [-22, 7, 23],    look: [0, 0.5, -1] },
  sunset:   { pos: [19, 8, 29],     look: [-4, 2, -4] }
};

/* Kaydırırken kameranın hedefe yetişme hızı — küçük = daha ağır, sinematik (eski değer 3) */
const SCROLL_FOLLOW = 1.1;

/* ---- Sayfa senaryoları: [açı, saat] — <main> içindeki her <section> için bir satır, null = atla ---- */
const PAGES = {
  home:        [['overview', 0.04], null, ['solar', 0.28], ['workshop', 0.45], ['overview', 0.52], ['aerial', 0.6], ['barn', 0.84], ['sunset', 0.9], ['low', 0.96]],
  solar:       [['houseLit', 0.12], ['panels', 0.28], ['solar', 0.42], ['overview', 0.6], ['aerial', 0.67], ['sunset', 0.74]],
  camera:      [['poleCam', 0.9], ['barn', 0.9], ['caravan', 0.95], ['overview', 0.97], ['aerial', 0.98], ['low', 1]],
  engineering: [['printer', 0.6], ['web', 0.62], ['workshop', 0.66], ['overview', 0.7], ['aerial', 0.74], ['workshop', 0.76], ['sunset', 0.78]],
  about:       [['overview', 0.1], ['solar', 0.3], ['workshop', 0.5], ['barn', 0.82], ['sunset', 0.9], ['low', 0.95]],
  contact:     [['sunset', 0.72], ['overview', 0.76], ['aerial', 0.8]]
};

/* Açılış turu yapılan sayfalar
   - flow:  Güneş Enerjisi — akım panellerden inverter'a, oradan eve gider, ışıklar yanar
   - path:  rota boyunca kamera turu (TOURS)
       Mühendislik: web geliştirme odası → ara kapı → 3D modelleme/printer odası
       Güvenlik:    elektrikli çit → güvenlik kamerası → kameranın canlı görüntüsünün aktığı ekran */
const INTRO = { solar: 'flow', engineering: 'path', camera: 'path' };

/* Turlar: [saniye, kamera konumu, bakılan nokta] */
const TOURS = {};

/* Güvenlik turu — çit arazinin çevresinde (ön kenar z = 12.5), direk kamerası (5, 4.1, 0), izleme ekranı ahırın önünde
   Tüm duraklar aşağı doğru bakar — gökyüzü kadrajı doldurmasın */
TOURS.camera = [
  [0.0,  [-12, 3.2, 18.2],  [-9.5, 0.6, 12.5]],   /* çitin genel görünümü */
  [2.2,  [-6.8, 1.6, 15.2], [-8.5, 0.5, 12.5]],   /* tellere yakın — atımlar */
  [4.0,  [-2.4, 1.8, 15.4], [-3.6, 0.6, 12.5]],   /* uyarı levhası + çit enerjileyicisi */
  [5.6,  [-1, 6.5, 8],      [5, 3.6, 0]],         /* yükselip kameraya doğru (atölyenin solundan) */
  [7.2,  [7.6, 5.6, 3.2],   [5, 4.1, -0.1]],      /* direk kamerası */
  [9.0,  [8.8, 4.4, 2.2],   [3, 1, 5]],           /* kameranın baktığı yön */
  [10.8, [10.2, 2.0, 1.6],  [10.4, 1.7, -2.7]],   /* izleme ekranı: canlı görüntü */
  [12.4, [10.3, 2.0, 1.5],  [10.4, 1.7, -2.7]],   /* ekranda biraz bekle */
  [14.2, [10.5, 5.4, 6],    [4.6, 3.2, -1]]       /* hero görünümüne çekil */
];

/* Mühendislik turu — kulübe dünyada x 0.5…9.5, ara kapı x = 5 */
const ROOM_TOUR = TOURS.engineering = [
  [0.0,  [7.9, 2.3, 12.6], [7.25, 1.7, 6.4]],   /* dışarıdan web odasına bakış */
  [1.8,  [7.5, 1.6, 9.6],  [7.25, 1.75, 6.4]],  /* içeride: duvar ekranında site tasarlanıyor */
  [3.6,  [7.0, 1.5, 9.3],  [8.3, 1.25, 7.1]],   /* masadaki kod monitörü */
  [5.0,  [6.2, 1.45, 8.85], [4.0, 1.3, 8.7]],   /* ara kapıya dönüş */
  [6.4,  [4.6, 1.45, 8.7], [2.6, 1.3, 7.9]],    /* kapıdan geçiş */
  [8.0,  [3.7, 1.7, 9.6],  [2.2, 1.25, 7.2]],   /* 3D printer yakından */
  [10.0, [2.9, 2.5, 11.6], [2.75, 1.45, 7]]     /* hero görünümüne çekil */
];

/* Hero yazısı solda olan sayfalar — maket sağa kaydırılarak çerçevelenir */
const LEFT_HERO = { home: 1, solar: 1, camera: 1, engineering: 1 };

/* ---- Günün saatine göre gökyüzü ve ışık ---- */
const SKY = [
  { t: 0.00, top: '#13264a', hor: '#f2a65a', light: '#ffc08a', li: 2.4, hi: 0.75 },
  { t: 0.30, top: '#2f6db5', hor: '#b4d8ee', light: '#fff4e0', li: 2.8, hi: 0.85 },
  { t: 0.55, top: '#3a6aa8', hor: '#e8c58a', light: '#ffe0b0', li: 2.3, hi: 0.7 },
  { t: 0.72, top: '#1b2752', hor: '#f07a3c', light: '#ff8a4c', li: 1.4, hi: 0.42 },
  { t: 0.86, top: '#0a1230', hor: '#3d3566', light: '#7086d8', li: 0.45, hi: 0.2 },
  { t: 1.00, top: '#040814', hor: '#12203f', light: '#8aa4ff', li: 0.4, hi: 0.15 }
];

/* ============================================
   BAŞLATMA — ilk açılışı yavaşlatmayacak şekilde
   ============================================ */
const pageKey = document.body && document.body.dataset.scene;
const conn = navigator.connection || {};
const isSmall = window.matchMedia('(max-width: 767px)').matches;
const LOW = isSmall || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) < 4;
/* ?hq=1 → otomatik kalite düşürmeyi kapatır (test/önizleme için) */
const FORCE_HQ = /[?&]hq=1\b/.test(location.search);

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) {
    return false;
  }
}

function shouldSkip() {
  if (!pageKey || !PAGES[pageKey]) return true;
  /* Otomasyonla yönetilen tarayıcı (Playwright vb.): paralel testlerde WebGL işlemciyi kilitler.
     3D'yi testte açmak için adrese ?3d=1 ekleyin. Gerçek ziyaretçiler etkilenmez. */
  if (navigator.webdriver && !/[?&]3d=1\b/.test(location.search)) return true;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  if (conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '')) return true;
  if ((navigator.deviceMemory || 8) < 2) return true;
  return !webglAvailable();
}

/* Sayfa yüklendikten sonra, tarayıcı boşta iken çalıştır */
function whenIdle() {
  return new Promise(function (resolve) {
    const go = function () {
      if ('requestIdleCallback' in window) window.requestIdleCallback(resolve, { timeout: 2500 });
      else setTimeout(resolve, 300);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
  });
}

async function start() {
  if (shouldSkip()) return;
  await whenIdle();
  let THREE;
  try {
    THREE = await import(THREE_URL);
  } catch (e) {
    console.warn('[scene3d] Three.js yüklenemedi, düz tasarım kullanılıyor.', e);
    return;
  }
  /* Kalite eklentileri: ortam yansıması (her cihaz) + parlama/kenar yumuşatma (sadece masaüstü).
     Yüklenemezlerse sahne sade kalitede çalışmaya devam eder. */
  const A = {};
  try {
    const mods = await Promise.all([
      import(ADDON('environments/RoomEnvironment.js')),
      LOW ? null : import(ADDON('postprocessing/EffectComposer.js')),
      LOW ? null : import(ADDON('postprocessing/RenderPass.js')),
      LOW ? null : import(ADDON('postprocessing/UnrealBloomPass.js')),
      LOW ? null : import(ADDON('postprocessing/OutputPass.js'))
    ]);
    A.RoomEnvironment = mods[0].RoomEnvironment;
    if (mods[1]) {
      A.EffectComposer = mods[1].EffectComposer;
      A.RenderPass = mods[2].RenderPass;
      A.UnrealBloomPass = mods[3].UnrealBloomPass;
      A.OutputPass = mods[4].OutputPass;
    }
  } catch (e) {
    console.warn('[scene3d] Efekt eklentileri yüklenemedi, sade kalite kullanılıyor.', e);
  }
  try {
    boot(THREE, A);
  } catch (e) {
    console.warn('[scene3d] 3D sahne başlatılamadı, düz tasarım kullanılıyor.', e);
    document.documentElement.classList.remove('has-3d');
    const c = document.getElementById('scene3d');
    if (c) c.remove();
  }
}

start();

/* ============================================
   SAHNE
   ============================================ */
function boot(THREE, A) {
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const clamp01 = (x) => Math.min(1, Math.max(0, x));
  const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };

  /* ---- Renderer ---- */
  const canvas = document.createElement('canvas');
  canvas.id = 'scene3d';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: !LOW,
    powerPreference: LOW ? 'low-power' : 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, LOW ? 1 : 1.6));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.localClippingEnabled = true;
  renderer.shadowMap.enabled = !LOW;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(LOW ? 52 : 42, 1, 0.1, 500);

  /* Atmosfer: uzaklaştıkça hafif pus (renk günün saatine göre applyTime'da ayarlanır) */
  scene.fog = new THREE.Fog('#8899aa', 45, 150);

  /* Ortam yansıması: paneller, metal ve cam yüzeyler çevreyi yansıtır (bir kez hesaplanır) */
  if (A.RoomEnvironment) {
    try {
      const pm = new THREE.PMREMGenerator(renderer);
      scene.environment = pm.fromScene(new A.RoomEnvironment(renderer), 0.04).texture;
      pm.dispose();
    } catch (e) { /* yansımasız devam */ }
  }

  /* Parlama (bloom) + kenar yumuşatma (MSAA) — sadece masaüstü */
  let composer = null, bloomPass = null;
  if (A.EffectComposer) {
    try {
      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
      composer = new A.EffectComposer(renderer, rt);
      composer.addPass(new A.RenderPass(scene, camera));
      /* eşik yüksek: sadece gerçekten ışık saçan şeyler (pencere, kıvılcım, güneş, ekran) parlar */
      bloomPass = new A.UnrealBloomPass(new THREE.Vector2(256, 256), 0.42, 0.5, 0.97);
      composer.addPass(bloomPass);
      composer.addPass(new A.OutputPass());
    } catch (e) { composer = null; }
  }
  function draw() {
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  /* ---- Malzeme ve şekil yardımcıları ---- */
  const mat = (color, o) => new THREE.MeshStandardMaterial(Object.assign({ color: color, roughness: 0.85 }, o || {}));

  /* addBox: y = nesnenin TABANI (üstü değil) */
  function addBox(parent, size, at, material) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
    m.position.set(at[0], at[1] + size[1] / 2, at[2]);
    parent.add(m);
    return m;
  }

  function addCyl(parent, r, h, at, material, seg) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg || 10), material);
    m.position.set(at[0], at[1] + h / 2, at[2]);
    parent.add(m);
    return m;
  }

  /* Beşik çatı — mahya X ekseni boyunca */
  function gableRoof(parent, len, depth, h, ov, at, material) {
    const half = depth / 2 + ov;
    const s = new THREE.Shape();
    s.moveTo(-half, 0); s.lineTo(0, h); s.lineTo(half, 0); s.lineTo(-half, 0);
    const g = new THREE.ExtrudeGeometry(s, { depth: len + ov * 2, bevelEnabled: false });
    g.translate(0, 0, -(len + ov * 2) / 2);
    const m = new THREE.Mesh(g, material);
    m.rotation.y = Math.PI / 2;
    m.position.set(at[0], at[1], at[2]);
    parent.add(m);
    return { mesh: m, slope: Math.atan2(h, half), half: half };
  }

  /* Güneş paneli hücre dokusu (küçük canvas — dosya indirilmez) */
  function panelTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d');
    g.fillStyle = '#132c63';
    g.fillRect(0, 0, 128, 128);
    g.strokeStyle = 'rgba(186, 206, 255, 0.55)';
    g.lineWidth = 2;
    for (let i = 0; i <= 4; i++) {
      g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, 128); g.stroke();
      g.beginPath(); g.moveTo(0, i * 32); g.lineTo(128, i * 32); g.stroke();
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  function glowTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 32;
    const g = c.getContext('2d');
    const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
    r.addColorStop(0, 'rgba(255,255,255,1)');
    r.addColorStop(0.4, 'rgba(255,255,255,0.5)');
    r.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = r;
    g.fillRect(0, 0, 32, 32);
    return new THREE.CanvasTexture(c);
  }

  /* Zemin dokuları — küçük canvas'larda üretilir (dosya indirilmez) */
  function noiseTexture(base, colors, n, rMin, rMax, alpha, flat, rx, ry, strata) {
    const w = 512, h = 256;
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    let seed = 1234567;
    const rnd = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < n; i++) {
      const r = rMin + rnd() * (rMax - rMin);
      g.globalAlpha = alpha * (0.35 + rnd() * 0.65);
      g.fillStyle = colors[Math.floor(rnd() * colors.length)];
      g.beginPath(); g.ellipse(rnd() * w, rnd() * h, r, r * flat, 0, 0, 6.29); g.fill();
    }
    g.globalAlpha = 1;
    (strata || []).forEach(function (s) { g.fillStyle = s[1]; g.fillRect(0, s[0] * h, w, 3 + rnd() * 3); });
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx, ry);
    t.anisotropy = 8;
    return t;
  }

  const M = {
    grass: mat('#ffffff', { map: noiseTexture('#84874a', ['#929452', '#777b41', '#9c9a5a', '#6f793c', '#a69f63'], 5000, 1, 4, 0.4, 0.7, 12, 8) }),
    soil: mat('#ffffff', { map: noiseTexture('#6b4b33', ['#5c3f2a', '#7a573c', '#4f3524'], 600, 3, 16, 0.5, 0.3, 8, 1,
      [[0.22, '#58402c'], [0.5, '#7d5a3e'], [0.78, '#4d3423']]) }),
    rock: mat('#ffffff', { map: noiseTexture('#4a3c32', ['#3f332b', '#5a4a3c', '#625549'], 700, 2, 12, 0.6, 0.6, 8, 1) }),
    path: mat('#ffffff', { map: noiseTexture('#c9b48a', ['#b8a277', '#d8c69e', '#a99268'], 1200, 1, 4, 0.6, 1, 8, 1) }),
    wall: mat('#ece4d4'),
    tile: mat('#9a4430', { roughness: 0.7 }),
    wood: mat('#7a5236'),
    darkWood: mat('#4a3020'),
    metal: mat('#b9c2cc', { metalness: 0.6, roughness: 0.4 }),
    steel: mat('#6f7680', { metalness: 0.4, roughness: 0.6 }),
    dark: mat('#23272e', { roughness: 0.5 }),
    white: mat('#eef1f4', { roughness: 0.4 }),
    concrete: mat('#d6d3cc'),
    leaf: mat('#5d7a3a', { flatShading: true }),
    leaf2: mat('#6e8b3d', { flatShading: true }),
    panel: new THREE.MeshStandardMaterial({ map: panelTexture(), metalness: 0.5, roughness: 0.28 }),
    purple: mat('#8b5cf6', { roughness: 0.45, metalness: 0.2 }),
    gear: mat('#7c3aed', { metalness: 0.7, roughness: 0.35 }),
    glass: mat('#1d2633', { metalness: 0.3, roughness: 0.15 }),
    window: mat('#2a3a4a', { emissive: new THREE.Color('#ffb357'), emissiveIntensity: 0 }),
    houseWindow: mat('#2a3a4a', { emissive: new THREE.Color('#ffc46b'), emissiveIntensity: 0 }),
    lamp: mat('#fff3d6', { emissive: new THREE.Color('#ffd27a'), emissiveIntensity: 0 }),
    fenceWire: mat('#9aa3ab', { metalness: 0.6, roughness: 0.4, emissive: new THREE.Color('#5fe3ff'), emissiveIntensity: 0 }),
    cable: mat('#1f2328', { roughness: 0.6 }),
    screenFrame: mat('#16181d', { roughness: 0.35, metalness: 0.3 }),
    led: new THREE.MeshBasicMaterial({ color: '#ff3b30' }),
    ledGreen: new THREE.MeshBasicMaterial({ color: '#34d399' }),
    ir: mat('#2a0f0f', { emissive: new THREE.Color('#ff4d4d'), emissiveIntensity: 0 })
  };

  const world = new THREE.Group();
  scene.add(world);

  /* ---- Maket zemini: çim + toprak + kaya katmanları ---- */
  const ground = addBox(world, [36, 0.5, 26], [0, -0.5, 0], M.grass);
  addBox(world, [36, 1.6, 26], [0, -2.1, 0], M.soil);
  addBox(world, [36, 1.2, 26], [0, -3.3, 0], M.rock);
  addBox(world, [24, 0.03, 1.4], [-1, 0, 1], M.path);
  addBox(world, [1.4, 0.03, 5.4], [5, 0, 4.4], M.path);

  /* ---- Panel birimi ---- */
  function panel(parent, w, h) {
    addBox(parent, [w + 0.06, h + 0.06, 0.05], [0, -(h + 0.06) / 2, 0], M.metal);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.panel);
    face.position.z = 0.03;
    parent.add(face);
  }

  /* ---- GÜNEŞ: güneşi takip eden panel dizisi ---- */
  const trackers = [];
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const x = -14 + c * 2.1, z = -8.5 + r * 3.2;
      addCyl(world, 0.06, 1.2, [x, 0, z], M.steel, 8);
      const pivot = new THREE.Group();
      pivot.position.set(x, 1.25, z);
      panel(pivot, 1.7, 1.05);
      world.add(pivot);
      trackers.push(pivot);
    }
  }

  /* ---- Ev + çatı panelleri ---- */
  const house = new THREE.Group();
  house.position.set(-9, 0, 4);
  world.add(house);
  addBox(house, [5, 2.8, 4], [0, 0, 0], M.wall);
  const roof = gableRoof(house, 5, 4, 1.5, 0.3, [0, 2.8, 0], M.tile);
  addBox(house, [0.8, 1.5, 0.06], [0.6, 0, 2.02], M.darkWood);
  addBox(house, [0.9, 0.75, 0.06], [-1.4, 1.2, 2.02], M.houseWindow);
  addBox(house, [0.9, 0.75, 0.06], [1.8, 1.2, 2.02], M.houseWindow);
  addBox(house, [0.06, 0.75, 0.9], [-2.52, 1.2, 0], M.houseWindow);
  addBox(house, [0.06, 0.75, 0.9], [2.52, 1.2, -0.6], M.houseWindow);
  /* Kapı üstü lamba + önündeki ışık havuzu */
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), M.lamp);
  lamp.position.set(0.6, 1.75, 2.14);
  house.add(lamp);
  const porchLight = new THREE.PointLight('#ffcf80', 0, 6, 1.6);
  porchLight.position.set(0.6, 1.7, 2.6);
  house.add(porchLight);
  addBox(house, [0.5, 1.2, 0.5], [1.6, 3.3, -0.6], M.wall); /* baca */
  const roofPanels = new THREE.Group();
  const slopeMid = roof.half / 2;
  roofPanels.position.set(0, 2.8 + 1.5 / 2 + 0.06, slopeMid + 0.03);
  roofPanels.rotation.x = roof.slope - Math.PI / 2;
  for (let i = 0; i < 3; i++) {
    const p = new THREE.Group();
    p.position.set(-1.45 + i * 1.45, 0, 0);
    panel(p, 1.35, 1.5);
    roofPanels.add(p);
  }
  house.add(roofPanels);

  /* İnverter / akü dolabı — ekranı akım geldikçe parlar */
  addBox(world, [0.8, 1.2, 0.5], [-5.6, 0, 5.4], mat('#d5dade', { roughness: 0.55 }));
  const cabinetLed = addBox(world, [0.5, 0.06, 0.02], [-5.6, 0.95, 5.66], M.ledGreen);
  /* İnverter ekranı: anlık üretim (kW), akü doluluğu ve üretim grafiği — canlı */
  const invCanvas = document.createElement('canvas');
  invCanvas.width = 320; invCanvas.height = 200;
  const invG = invCanvas.getContext('2d');
  const invTex = new THREE.CanvasTexture(invCanvas);
  invTex.colorSpace = THREE.SRGBColorSpace;
  invTex.anisotropy = 4;
  addBox(world, [0.62, 0.4, 0.02], [-5.6, 0.42, 5.65], M.screenFrame);
  const invScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.58, 0.36), new THREE.MeshBasicMaterial({ map: invTex, toneMapped: false }));
  invScreen.position.set(-5.6, 0.62, 5.665);
  world.add(invScreen);
  const invHistory = [];
  function drawInverter(kw, battery, night, t) {
    const g = invG;
    g.fillStyle = '#05130e'; g.fillRect(0, 0, 320, 200);
    g.fillStyle = '#0c2a1f'; g.fillRect(0, 0, 320, 30);
    g.font = '600 15px Inter, Arial, sans-serif'; g.fillStyle = '#a7f3d0'; g.fillText('İNVERTER', 12, 21);
    g.fillStyle = (Math.sin(t * 3) > -0.3) ? '#34d399' : '#065f46';
    g.beginPath(); g.arc(300, 15, 6, 0, 6.29); g.fill();
    /* Anlık güç */
    g.fillStyle = '#94a3b8'; g.font = '13px Inter, Arial, sans-serif';
    g.fillText(night ? 'AKÜ → EV' : 'GÜNEŞ ÜRETİMİ', 12, 54);
    g.fillStyle = night ? '#93c5fd' : '#fbbf24'; g.font = 'bold 40px Inter, Arial, sans-serif';
    const num = kw.toFixed(1);
    g.fillText(num, 12, 96);
    const numW = g.measureText(num).width;
    g.font = '600 18px Inter, Arial, sans-serif'; g.fillText('kW', 12 + numW + 6, 96);
    /* Akü */
    g.fillStyle = '#94a3b8'; g.font = '13px Inter, Arial, sans-serif'; g.fillText('AKÜ', 196, 54);
    g.strokeStyle = '#a7f3d0'; g.lineWidth = 2; g.strokeRect(196, 64, 100, 30); g.fillRect(297, 72, 5, 14);
    g.fillStyle = battery > 30 ? '#34d399' : '#f87171'; g.fillRect(199, 67, 94 * battery / 100, 24);
    g.fillStyle = '#05130e'; g.font = 'bold 14px Inter, Arial, sans-serif'; g.fillText(Math.round(battery) + '%', 226, 84);
    /* Üretim grafiği */
    g.strokeStyle = '#1f3d32'; g.lineWidth = 1;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(12, 118 + i * 22); g.lineTo(308, 118 + i * 22); g.stroke(); }
    if (invHistory.length > 1) {
      g.beginPath();
      invHistory.forEach(function (v, i) {
        const x = 12 + (i / 59) * 296, y = 184 - (v / 4) * 66;
        if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
      });
      g.strokeStyle = '#fbbf24'; g.lineWidth = 3; g.stroke();
      g.lineTo(12 + ((invHistory.length - 1) / 59) * 296, 184); g.lineTo(12, 184); g.closePath();
      g.fillStyle = 'rgba(251,191,36,0.15)'; g.fill();
    }
    invTex.needsUpdate = true;
  }
  drawInverter(2.8, 70, 0, 0);
  const invSpot = new THREE.Vector3(-5.6, 0.62, 5.7);
  let invTimer = 0;

  /* Elektrikli çit — tüm arazinin çevresi, atımlı enerji */
  const FX = 17.5, FZ = 12.5;                 /* çit dikdörtgeninin yarı ölçüleri (zemin 36 × 26) */
  const fencePosts = [];                      /* [x, z] */
  (function () {
    const nx = Math.round((FX * 2) / 1.5), nz = Math.round((FZ * 2) / 1.5);
    for (let i = 0; i <= nx; i++) {
      const x = -FX + (i / nx) * FX * 2;
      fencePosts.push([x, FZ], [x, -FZ]);
    }
    for (let i = 1; i < nz; i++) {
      const z = -FZ + (i / nz) * FZ * 2;
      fencePosts.push([FX, z], [-FX, z]);
    }
    /* Direkler tek InstancedMesh — 80+ ayrı mesh yerine tek çizim çağrısı */
    const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 6), M.wood, fencePosts.length);
    const m4 = new THREE.Matrix4();
    fencePosts.forEach(function (p, i) { m4.makeTranslation(p[0], 0.45, p[1]); posts.setMatrixAt(i, m4); });
    world.add(posts);
    [0.45, 0.75].forEach(function (y) {
      addBox(world, [FX * 2, 0.04, 0.04], [0, y, FZ], M.fenceWire);
      addBox(world, [FX * 2, 0.04, 0.04], [0, y, -FZ], M.fenceWire);
      addBox(world, [0.04, 0.04, FZ * 2], [FX, y, 0], M.fenceWire);
      addBox(world, [0.04, 0.04, FZ * 2], [-FX, y, 0], M.fenceWire);
    });
  })();
  addBox(world, [0.4, 0.35, 0.25], [-2.6, 0.5, FZ - 0.25], M.white);
  const fenceLed = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), M.led);
  fenceLed.position.set(-2.6, 0.75, FZ - 0.11);
  world.add(fenceLed);

  /* Uyarı levhası — "DİKKAT ELEKTRİKLİ ÇİT" */
  (function () {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 160;
    const g = c.getContext('2d');
    g.fillStyle = '#facc15'; g.fillRect(0, 0, 256, 160);
    g.strokeStyle = '#111827'; g.lineWidth = 8; g.strokeRect(6, 6, 244, 148);
    g.fillStyle = '#111827';
    g.beginPath(); g.moveTo(128, 18); g.lineTo(162, 76); g.lineTo(94, 76); g.closePath(); g.fill();
    g.fillStyle = '#facc15'; g.font = 'bold 40px Arial, sans-serif'; g.textAlign = 'center'; g.fillText('!', 128, 70);
    g.fillStyle = '#111827'; g.font = 'bold 26px Arial, sans-serif';
    g.fillText('DİKKAT', 128, 108);
    g.font = 'bold 19px Arial, sans-serif'; g.fillText('ELEKTRİKLİ ÇİT', 128, 136);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39),
      new THREE.MeshStandardMaterial({ map: tex, emissive: new THREE.Color('#ffffff'), emissiveMap: tex, emissiveIntensity: 0.35, roughness: 0.6 }));
    plate.position.set(-4.5, 0.62, FZ + 0.06);
    world.add(plate);
  })();
  const fenceSolar = new THREE.Group();
  fenceSolar.position.set(-2.6, 1.05, FZ - 0.25);
  fenceSolar.rotation.x = -0.6;
  panel(fenceSolar, 0.5, 0.35);
  world.add(fenceSolar);

  /* ---- KAMERA: ahır, direk kamera, karavan ---- */
  const barn = new THREE.Group();
  barn.position.set(9, 0, -5);
  world.add(barn);
  addBox(barn, [6, 3.2, 4.5], [0, 0, 0], M.wood);
  gableRoof(barn, 6, 4.5, 1.8, 0.3, [0, 3.2, 0], M.steel);
  addBox(barn, [2.2, 2.4, 0.06], [0, 0, 2.27], M.darkWood);
  addBox(barn, [0.8, 0.6, 0.06], [-2.1, 1.9, 2.27], M.window);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M.glass);
  dome.rotation.x = Math.PI;
  dome.position.set(2.8, 3.1, 2.4);
  barn.add(dome);

  /* Direk kamerası (bullet) */
  function bulletCam(parent, at) {
    const head = new THREE.Group();
    head.position.set(at[0], at[1], at[2]);
    head.rotation.order = 'YXZ';
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.75, 16), M.white);
    body.rotation.x = Math.PI / 2;
    head.add(body);
    addBox(head, [0.42, 0.05, 0.85], [0, 0.18, -0.02], M.white);
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 16), M.glass);
    lens.rotation.x = Math.PI / 2;
    lens.position.z = 0.38;
    head.add(lens);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.02, 6, 20), M.ir);
    ring.position.z = 0.39;
    head.add(ring);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), M.led);
    led.position.set(0.1, 0.1, 0.3);
    head.add(led);

    const coneLen = 7.5;
    const cg = new THREE.ConeGeometry(2.3, coneLen, 28, 1, true);
    cg.translate(0, -coneLen / 2, 0);
    cg.rotateX(-Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({
      color: '#8fbfff', transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending, side: THREE.DoubleSide
    });
    const cone = new THREE.Mesh(cg, coneMat);
    cone.position.z = 0.4;
    head.add(cone);
    parent.add(head);
    return { head: head, cone: coneMat, coneMesh: cone, led: led };
  }

  addCyl(world, 0.08, 4.2, [5, 0, -0.5], M.steel, 10);
  addBox(world, [0.08, 0.08, 0.4], [5, 3.95, -0.35], M.steel);
  const poleCam = bulletCam(world, [5, 4.1, -0.1]);
  const poleYaw = Math.atan2(-3.5, 4.5);

  /* ---- İzleme ekranı: direk kamerasının CANLI görüntüsü (ahırın ön duvarında) ----
     Kameranın kafasına küçük bir sanal kamera takılı; gördüğü ekrana basılır.
     Gece görüşü efekti: gri-yeşil, aydınlatılmış, tarama çizgili. */
  const FEED_W = LOW ? 192 : 320, FEED_H = Math.round(FEED_W * 0.6);
  const feedRT = new THREE.WebGLRenderTarget(FEED_W, FEED_H);
  const feedCam = new THREE.PerspectiveCamera(60, FEED_W / FEED_H, 0.1, 120);
  feedCam.position.set(0, 0, 0.45);
  feedCam.rotation.y = Math.PI;   /* sanal kamera kafanın baktığı yöne (+z) bakar */
  poleCam.head.add(feedCam);
  const feedMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: feedRT.texture }, time: { value: 0 }, night: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'uniform sampler2D map; uniform float time; uniform float night; varying vec2 vUv;',
      'void main(){',
      '  vec3 c = texture2D(map, vUv).rgb;',
      '  float l = dot(c, vec3(0.299, 0.587, 0.114));',
      '  vec3 nv = vec3(0.8, 0.95, 0.82) * pow(clamp(l * 3.2, 0.0, 1.0), 0.7);',
      '  vec3 day = pow(clamp(c * 1.6, 0.0, 1.0), vec3(0.8));',
      '  float scan = 0.9 + 0.1 * sin(vUv.y * 380.0 + time * 6.0);',
      '  float vig = smoothstep(0.9, 0.3, length(vUv - 0.5));',
      '  gl_FragColor = vec4(mix(day, nv, night) * scan * (0.55 + 0.45 * vig), 1.0);',
      '}'
    ].join('\n')
  });
  addBox(barn, [1.82, 1.12, 0.08], [2.05, 1.2, 2.27], M.screenFrame);
  const feedScreen = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.02), feedMat);
  feedScreen.position.set(2.05, 1.76, 2.32);
  barn.add(feedScreen);

  /* Ekran üstü yazılar: ● REC  KAM-1  CANLI + saat */
  const osd = document.createElement('canvas');
  osd.width = 330; osd.height = 200;
  const osdG = osd.getContext('2d');
  const osdTex = new THREE.CanvasTexture(osd);
  const osdPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 1.02), new THREE.MeshBasicMaterial({ map: osdTex, transparent: true, toneMapped: false, depthWrite: false }));
  osdPlane.position.set(2.05, 1.76, 2.33);
  barn.add(osdPlane);
  function drawOsd(t) {
    osdG.clearRect(0, 0, 330, 200);
    osdG.font = 'bold 15px Consolas, monospace';
    if (Math.sin(t * 4) > -0.2) { osdG.fillStyle = '#ef4444'; osdG.beginPath(); osdG.arc(18, 19, 6, 0, 6.29); osdG.fill(); }
    osdG.fillStyle = '#ffffff'; osdG.fillText('REC', 30, 24);
    osdG.fillText('KAM-1  CANLI', 200, 24);
    const d = new Date();
    const pad = function (n) { return String(n).padStart(2, '0'); };
    osdG.fillText(pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()), 12, 188);
    osdTex.needsUpdate = true;
  }
  drawOsd(0);
  const feedSpot = new THREE.Vector3(11.05, 1.76, -2.7);

  /* Karavan */
  const caravan = new THREE.Group();
  caravan.position.set(13, 0, 3);
  caravan.rotation.y = -0.45;
  world.add(caravan);
  addBox(caravan, [3.6, 1.6, 1.9], [0, 0.45, 0], M.white);
  addBox(caravan, [3.62, 0.18, 1.92], [0, 1.0, 0], mat('#2563eb'));
  addBox(caravan, [0.9, 0.5, 0.04], [-0.6, 1.3, 0.96], M.window);
  addBox(caravan, [0.5, 1.1, 0.04], [0.9, 0.55, 0.96], M.darkWood);
  [-1.1, 1.1].forEach(function (x) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.2, 14), M.dark);
    w.rotation.x = Math.PI / 2;
    w.position.set(x, 0.32, 0.95);
    caravan.add(w);
    const w2 = w.clone();
    w2.position.z = -0.95;
    caravan.add(w2);
  });
  /* Karavan çatısında güneş panelleri (taşınabilir solar sistem) */
  addBox(caravan, [2.9, 0.05, 0.08], [0, 2.05, -0.55], M.steel);
  addBox(caravan, [2.9, 0.05, 0.08], [0, 2.05, 0.55], M.steel);
  const vanSolar = new THREE.Group();
  vanSolar.position.set(0, 2.17, 0);
  vanSolar.rotation.x = -Math.PI / 2 + 0.12;   /* yüzü yukarı, hafif eğimli */
  [-0.72, 0.72].forEach(function (x) {
    const p = new THREE.Group();
    p.position.x = x;
    panel(p, 1.3, 1.25);
    vanSolar.add(p);
  });
  caravan.add(vanSolar);

  /* ---- MÜHENDİSLİK: iki odalı kulübe ----
     Sol oda (x < 0): 3D modelleme + 3D printer   |   Sağ oda (x > 0): web geliştirme */
  const shop = new THREE.Group();
  shop.position.set(5, 0, 8);
  world.add(shop);
  const webWall = mat('#dfe6ee');
  addBox(shop, [9, 0.15, 3.6], [0, 0, 0], M.concrete);
  addBox(shop, [4.5, 2.6, 0.15], [-2.25, 0, -1.72], M.concrete);
  addBox(shop, [4.5, 2.6, 0.15], [2.25, 0, -1.72], webWall);
  addBox(shop, [0.15, 2.6, 3.6], [-4.45, 0, 0], M.concrete);
  addBox(shop, [0.15, 2.6, 3.6], [4.45, 0, 0], webWall);
  /* Ara duvar — ortasında kapı boşluğu */
  addBox(shop, [0.12, 2.6, 2.0], [0, 0, -0.8], M.concrete);
  addBox(shop, [0.12, 2.6, 0.7], [0, 0, 1.45], M.concrete);
  addBox(shop, [0.12, 0.55, 0.9], [0, 2.05, 0.65], M.concrete);
  const shopRoof = addBox(shop, [9.5, 0.15, 4.1], [0, 2.6, 0], M.steel);
  shopRoof.rotation.x = -0.05;

  /* Oda tabelaları (çatının ön kenarında) */
  function sign(text, accent, x) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 72;
    const g = c.getContext('2d');
    g.fillStyle = '#111827'; g.fillRect(0, 0, 512, 72);
    g.fillStyle = accent; g.fillRect(0, 0, 10, 72);
    g.fillStyle = '#ffffff'; g.font = '600 34px Inter, Arial, sans-serif';
    g.textBaseline = 'middle'; g.fillText(text, 30, 38);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 0.34), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
    m.position.set(x, 3.0, 2.0);   /* çatının ön kenarının üstünde durur — iç görüşü kapatmaz */
    shop.add(m);
  }
  sign('3D Modelleme & Baskı', '#8b5cf6', -2.25);
  sign('Web Geliştirme', '#14b8a6', 2.25);

  /* Sol oda: tezgâh */
  addBox(shop, [3.2, 0.08, 1.1], [-2.25, 0.85, -0.8], mat('#a87b4f'));
  [[-3.75, -1.25], [-0.75, -1.25], [-3.75, -0.35], [-0.75, -0.35]].forEach(function (p) {
    addBox(shop, [0.08, 0.85, 0.08], [p[0], 0, p[1]], M.dark);
  });

  /* 3D printer */
  const printer = new THREE.Group();
  printer.position.set(-2.9, 0.93, -0.8);
  shop.add(printer);
  addBox(printer, [0.9, 0.06, 0.9], [0, 0, 0], M.dark);
  addBox(printer, [0.7, 0.03, 0.7], [0, 0.08, 0], mat('#3a3f47', { metalness: 0.5 }));
  addBox(printer, [0.05, 1.05, 0.05], [-0.42, 0, -0.4], M.dark);
  addBox(printer, [0.05, 1.05, 0.05], [0.42, 0, -0.4], M.dark);
  addBox(printer, [0.9, 0.05, 0.05], [0, 1.05, -0.4], M.dark);
  const gantry = addBox(printer, [0.88, 0.04, 0.04], [0, 0.5, -0.4], M.purple);
  const nozzle = new THREE.Group();
  addBox(nozzle, [0.12, 0.12, 0.12], [0, 0.03, 0], M.dark);
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.06, 8), M.metal);
  tip.rotation.x = Math.PI;
  nozzle.add(tip);
  printer.add(nozzle);
  const arm = addBox(printer, [0.03, 0.03, 0.4], [0, 0.5, -0.2], M.dark);

  /* Basılan vazo — kesme düzlemi ile kat kat "basılır" */
  const BED_TOP = 0.11, VASE_H = 0.55;
  const vaseR = (y) => 0.1 + 0.06 * Math.sin((y / VASE_H) * Math.PI) + 0.025 * Math.sin((y / VASE_H) * Math.PI * 3);
  const prof = [];
  for (let i = 0; i <= 16; i++) { const y = (i / 16) * VASE_H; prof.push(new THREE.Vector2(vaseR(y), y)); }
  const vaseGeo = new THREE.LatheGeometry(prof, 36);
  const clip = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
  const vaseMat = mat('#8b5cf6', { roughness: 0.5, side: THREE.DoubleSide, clippingPlanes: [clip] });
  const vase = new THREE.Mesh(vaseGeo, vaseMat);
  vase.position.y = BED_TOP;
  printer.add(vase);

  /* Hologram — CAD modeli (aynı vazo, tel kafes) */
  const holo = new THREE.Mesh(vaseGeo, new THREE.MeshBasicMaterial({
    color: '#a78bfa', wireframe: true, transparent: true, opacity: 0.6
  }));
  holo.position.set(-1.45, 1.05, -0.75);
  holo.scale.setScalar(1.3);
  shop.add(holo);

  /* Dişliler (arka duvarda) */
  function gearGeo(teeth, r) {
    const s = new THREE.Shape();
    const steps = teeth * 4;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const rr = (i % 4 < 2) ? r : r * 0.8;
      if (i === 0) s.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
      else s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    const hole = new THREE.Path();
    hole.absarc(0, 0, r * 0.25, 0, Math.PI * 2, true);
    s.holes.push(hole);
    return new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: false });
  }
  const gearA = new THREE.Mesh(gearGeo(12, 0.45), M.gear);
  gearA.position.set(-1.35, 1.95, -1.62);
  const gearB = new THREE.Mesh(gearGeo(8, 0.3), M.gear);
  gearB.position.set(-0.7, 1.62, -1.62);
  shop.add(gearA, gearB);

  /* ---- WEB TASARIM: duvarda büyük ekran (site blok blok tasarlanır) + tezgâhta kod monitörü ---- */
  function screenCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return { c: c, g: c.getContext('2d'), tex: tex };
  }
  const siteScr = screenCanvas(512, 304);
  const codeScr = screenCanvas(384, 232);

  /* Sağ oda (web geliştirme): duvarda büyük ekran — site blok blok tasarlanır */
  const siteMat = new THREE.MeshBasicMaterial({ map: siteScr.tex, toneMapped: false });
  addBox(shop, [2.3, 1.36, 0.06], [2.25, 1.16, -1.62], M.screenFrame);
  const siteFace = new THREE.Mesh(new THREE.PlaneGeometry(2.18, 1.26), siteMat);
  siteFace.position.set(2.25, 1.84, -1.585);
  shop.add(siteFace);

  /* Çalışma masası + sandalye */
  addBox(shop, [3.0, 0.06, 0.95], [2.3, 0.75, -0.75], mat('#e5e7eb', { roughness: 0.5 }));
  [[0.95, -1.15], [3.65, -1.15], [0.95, -0.35], [3.65, -0.35]].forEach(function (p) {
    addBox(shop, [0.06, 0.75, 0.06], [p[0], 0, p[1]], M.dark);
  });
  addBox(shop, [0.55, 0.08, 0.5], [2.6, 0.48, 0.25], M.dark);
  addBox(shop, [0.55, 0.6, 0.06], [2.6, 0.56, 0.5], M.dark);
  addCyl(shop, 0.04, 0.48, [2.6, 0, 0.25], M.steel, 8);

  /* Laptop — sitenin önizlemesi */
  addBox(shop, [0.62, 0.025, 0.42], [1.55, 0.81, -0.6], M.steel);
  const laptopLid = new THREE.Group();
  laptopLid.position.set(1.55, 0.835, -0.81);
  laptopLid.rotation.x = -0.25;
  addBox(laptopLid, [0.62, 0.4, 0.02], [0, 0, 0], M.steel);
  const lapFace = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.33), siteMat);
  lapFace.position.set(0, 0.2, 0.012);
  laptopLid.add(lapFace);
  shop.add(laptopLid);

  /* Masa monitörü (kod) */
  addBox(shop, [0.24, 0.02, 0.16], [3.3, 0.81, -0.9], M.screenFrame);
  addBox(shop, [0.05, 0.26, 0.05], [3.3, 0.83, -0.95], M.screenFrame);
  const codeMon = new THREE.Group();
  codeMon.position.set(3.3, 1.32, -0.92);
  codeMon.rotation.y = -0.4;
  addBox(codeMon, [0.8, 0.5, 0.04], [0, -0.25, 0], M.screenFrame);
  const codeFace = new THREE.Mesh(new THREE.PlaneGeometry(0.74, 0.44), new THREE.MeshBasicMaterial({ map: codeScr.tex, toneMapped: false }));
  codeFace.position.z = 0.025;
  codeMon.add(codeFace);
  shop.add(codeMon);

  /* Duvar ekranı içeriği: KCK sitesinin taslağı — her parça önce çerçeve, sonra dolu çizilir */
  const SITE_PARTS = [
    { a: 0.04, x: 0, y: 22, w: 512, h: 30, draw: function (g) {
      g.fillStyle = '#0f2440'; g.fillRect(0, 22, 512, 30);
      g.fillStyle = '#ffffff'; g.font = 'bold 13px Inter, Arial, sans-serif'; g.fillText('KÜÇÜKLER', 14, 42);
      g.fillStyle = 'rgba(255,255,255,0.55)';
      for (let i = 0; i < 4; i++) g.fillRect(190 + i * 56, 34, 40, 6);
      g.fillStyle = '#f59e0b'; g.fillRect(440, 30, 58, 15);
    } },
    { a: 0.2, x: 0, y: 52, w: 512, h: 104, draw: function (g) {
      const gr = g.createLinearGradient(0, 52, 512, 156);
      gr.addColorStop(0, '#0f2440'); gr.addColorStop(1, '#0d5f58');
      g.fillStyle = gr; g.fillRect(0, 52, 512, 104);
      g.fillStyle = '#ffffff'; g.font = 'bold 22px Inter, Arial, sans-serif'; g.fillText('Profesyonel', 24, 92);
      g.fillStyle = '#f59e0b'; g.fillText('Teknoloji', 24, 118);
      g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(24, 128, 200, 5);
    } },
    { a: 0.36, x: 24, y: 138, w: 84, h: 12, draw: function (g) { g.fillStyle = '#f59e0b'; g.fillRect(24, 138, 84, 12); } },
    { a: 0.5, x: 20, y: 170, w: 148, h: 112, draw: card('#f59e0b') },
    { a: 0.62, x: 182, y: 170, w: 148, h: 112, draw: card('#3b82f6') },
    { a: 0.74, x: 344, y: 170, w: 148, h: 112, draw: card('#8b5cf6') }
  ];
  function card(color) {
    return function (g, p) {
      g.fillStyle = '#ffffff'; g.fillRect(p.x, p.y, p.w, p.h);
      g.fillStyle = color; g.fillRect(p.x, p.y, p.w, 52);
      g.fillStyle = '#0f2440'; g.fillRect(p.x + 10, p.y + 64, p.w - 50, 7);
      g.fillStyle = '#cbd5e1'; g.fillRect(p.x + 10, p.y + 80, p.w - 20, 4); g.fillRect(p.x + 10, p.y + 90, p.w - 36, 4);
      g.fillStyle = color; g.fillRect(p.x + 10, p.y + 100, 44, 5);
    };
  }
  function drawSite(prog, t) {
    const g = siteScr.g;
    g.fillStyle = '#f1f5f9'; g.fillRect(0, 0, 512, 304);
    g.fillStyle = '#e2e8f0'; g.fillRect(0, 0, 512, 22);
    ['#f87171', '#fbbf24', '#34d399'].forEach(function (c, i) { g.fillStyle = c; g.beginPath(); g.arc(12 + i * 14, 11, 4, 0, 6.29); g.fill(); });
    g.fillStyle = '#ffffff'; g.fillRect(70, 5, 260, 12);
    g.fillStyle = '#64748b'; g.font = '9px Arial, sans-serif'; g.fillText('kucuklermuhendislik.com', 78, 14);
    let active = null;
    for (let i = 0; i < SITE_PARTS.length; i++) {
      const p = SITE_PARTS[i];
      if (prog < p.a) break;
      active = p;
      if (prog < p.a + 0.07) {
        g.setLineDash([5, 4]); g.strokeStyle = '#8b5cf6'; g.lineWidth = 2;
        g.strokeRect(p.x + 1, p.y + 1, p.w - 2, p.h - 2); g.setLineDash([]);
      } else {
        p.draw(g, p);
      }
    }
    if (active && prog < 0.9) {
      /* seçim kutusu + imleç */
      g.strokeStyle = '#8b5cf6'; g.lineWidth = 2; g.strokeRect(active.x + 1, active.y + 1, active.w - 2, active.h - 2);
      const cx = active.x + active.w * 0.7 + Math.sin(t * 3) * 6, cy = active.y + active.h * 0.6;
      g.fillStyle = '#111827';
      g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + 16); g.lineTo(cx + 4, cy + 12); g.lineTo(cx + 8, cy + 19); g.lineTo(cx + 10, cy + 18); g.lineTo(cx + 7, cy + 11); g.lineTo(cx + 12, cy + 11); g.closePath(); g.fill();
    }
    siteScr.tex.needsUpdate = true;
  }

  /* Kod monitörü: HTML/CSS satırları harf harf yazılır */
  const CODE = [
    [['<section ', '#f472b6'], ['class=', '#93c5fd'], ['"hero"', '#fbbf24'], ['>', '#f472b6']],
    [['  <h1>', '#f472b6'], ['Profesyonel Teknoloji', '#e2e8f0'], ['</h1>', '#f472b6']],
    [['  <a ', '#f472b6'], ['class=', '#93c5fd'], ['"btn"', '#fbbf24'], ['>Teklif Al</a>', '#f472b6']],
    [['</section>', '#f472b6']],
    [['', '#e2e8f0']],
    [['.hero ', '#a78bfa'], ['{', '#e2e8f0']],
    [['  background: ', '#93c5fd'], ['#0f2440', '#fbbf24'], [';', '#e2e8f0']],
    [['  padding: ', '#93c5fd'], ['5rem 0', '#fbbf24'], [';', '#e2e8f0']],
    [['}', '#e2e8f0']],
    [['.btn ', '#a78bfa'], ['{ ', '#e2e8f0'], ['color: ', '#93c5fd'], ['#f59e0b', '#fbbf24'], [' }', '#e2e8f0']],
    [['@media ', '#a78bfa'], ['(min-width: 768px)', '#fbbf24'], [' {', '#e2e8f0']],
    [['  .grid ', '#a78bfa'], ['{ ', '#e2e8f0'], ['columns: ', '#93c5fd'], ['3', '#fbbf24'], [' }', '#e2e8f0']],
    [['}', '#e2e8f0']]
  ];
  const CODE_LEN = CODE.reduce(function (s, l) { return s + l.reduce(function (a, seg) { return a + seg[0].length; }, 0) + 1; }, 0);
  function drawCode(prog, t) {
    const g = codeScr.g;
    g.fillStyle = '#0f172a'; g.fillRect(0, 0, 384, 232);
    g.fillStyle = '#1e293b'; g.fillRect(0, 0, 384, 18);
    g.fillStyle = '#94a3b8'; g.font = '10px Consolas, monospace'; g.fillText('index.html  —  style.css', 8, 13);
    g.font = '12px Consolas, monospace';
    let left = Math.floor(prog * CODE_LEN), lineH = 16, firstLine = 0;
    const typedLines = []; let budget = left;
    for (let i = 0; i < CODE.length && budget > 0; i++) {
      const n = CODE[i].reduce(function (a, seg) { return a + seg[0].length; }, 0) + 1;
      typedLines.push(Math.min(budget, n)); budget -= n;
    }
    if (typedLines.length > 12) firstLine = typedLines.length - 12;
    let cx = 0, cy = 0;
    for (let li = firstLine; li < typedLines.length; li++) {
      const y = 34 + (li - firstLine) * lineH;
      g.fillStyle = '#475569'; g.fillText(String(li + 1).padStart(2, ' '), 6, y);
      let x = 30, chars = typedLines[li];
      for (let s = 0; s < CODE[li].length && chars > 0; s++) {
        const txt = CODE[li][s][0].slice(0, chars);
        g.fillStyle = CODE[li][s][1]; g.fillText(txt, x, y);
        x += g.measureText(txt).width; chars -= CODE[li][s][0].length;
      }
      cx = x; cy = y;
    }
    if (Math.sin(t * 8) > 0) { g.fillStyle = '#e2e8f0'; g.fillRect(cx + 1, cy - 10, 7, 13); }
    codeScr.tex.needsUpdate = true;
  }
  drawSite(1, 0);
  drawCode(1, 0);
  const shopCenter = new THREE.Vector3(5, 1.5, 8);

  const shopLight = new THREE.PointLight('#ffd7a1', 0, 7, 1.6);
  shopLight.position.set(-2.25, 2.3, 0);
  shop.add(shopLight);
  const webLight = new THREE.PointLight('#e0f2fe', 0, 7, 1.6);
  webLight.position.set(2.25, 2.3, 0);
  shop.add(webLight);

  /* ---- Ağaçlar: arka kenarda kavaklar, aralarda yuvarlak ağaçlar ---- */
  [-16.5, -13.5, -10.5, -7.5, -4.5, -1.5, 14.5, 16.5].forEach(function (x, i) {
    const z = -11.8 + (i % 2) * 0.6;
    addCyl(world, 0.12, 0.8, [x, 0, z], M.wood, 6);
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.75, 4.6 + (i % 3) * 0.6, 7), M.leaf);
    cone.position.set(x, 0.8 + 2.3 + (i % 3) * 0.3, z);
    world.add(cone);
  });
  [[-16, 7], [-15.5, -1.5], [15.5, 9], [0.5, -9.5], [16, -5]].forEach(function (p, i) {
    addCyl(world, 0.12, 0.9, [p[0], 0, p[1]], M.wood, 6);
    const top = new THREE.Mesh(new THREE.IcosahedronGeometry(1 + (i % 2) * 0.3, 0), M.leaf2);
    top.position.set(p[0], 1.9, p[1]);
    world.add(top);
  });

  /* ---- Koyunlar: çitin içinde otlayan küçük sürü ---- */
  const woolMat = mat('#f1ede4', { roughness: 0.95, flatShading: true });
  const faceMat = mat('#2b2420', { roughness: 0.8 });
  const woolGeo = new THREE.IcosahedronGeometry(0.42, 1);
  const legGeo = new THREE.BoxGeometry(0.08, 0.32, 0.08);
  const sheep = [];
  [[-13, 9.4, 0.0], [-10.4, 8.7, 2.1], [-14.8, 10.6, 4.0], [14.4, -9, 1.3]].forEach(function (p, i) {
    const g = new THREE.Group();
    const s = 0.85 + (i % 3) * 0.1;
    g.scale.setScalar(s);
    const body = new THREE.Mesh(woolGeo, woolMat);
    body.scale.set(1, 0.8, 1.3);
    body.position.y = 0.62;
    g.add(body);
    [[-0.17, -0.26], [0.17, -0.26], [-0.17, 0.26], [0.17, 0.26]].forEach(function (l) {
      const leg = new THREE.Mesh(legGeo, faceMat);
      leg.position.set(l[0], 0.16, l[1]);
      g.add(leg);
    });
    const head = new THREE.Group();          /* boyun pivotu: otlarken öne eğilir */
    head.position.set(0, 0.72, 0.48);
    const face = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.3), faceMat);
    face.position.set(0, 0, 0.16);
    head.add(face);
    const tuft = new THREE.Mesh(woolGeo, woolMat);
    tuft.scale.setScalar(0.3);
    tuft.position.set(0, 0.12, 0.08);
    head.add(tuft);
    [-1, 1].forEach(function (side) {
      const ear = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.04, 0.07), faceMat);
      ear.position.set(side * 0.14, 0.06, 0.06);
      ear.rotation.z = side * -0.4;
      head.add(ear);
    });
    g.add(head);
    g.position.set(p[0], 0, p[1]);
    world.add(g);
    sheep.push({ g: g, head: head, cx: p[0], cz: p[1], r: 1.1, phase: p[2], speed: 0.07 + i * 0.012 });
  });

  /* Gölge ayarları — tüm katı nesneler */
  world.traverse(function (o) {
    if (o.isMesh && o.material && o.material.isMeshStandardMaterial) {
      o.castShadow = true;
      o.receiveShadow = true;
    }
  });
  ground.castShadow = false;

  /* Ortam yansıması alan malzemeler — şiddeti günün saatine göre ayarlanır */
  const envMats = [];
  world.traverse(function (o) {
    if (o.isMesh && o.material && o.material.isMeshStandardMaterial && envMats.indexOf(o.material) < 0) envMats.push(o.material);
  });
  let lastEnv = -1;

  /* ---- Enerji akışı: A) paneller → inverter, B) inverter → ev ---- */
  const glow = glowTexture();
  function flowLine(points, n, speed, color, size) {
    const curve = new THREE.CatmullRomCurve3(points.map(V));
    const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 64, 0.035, 6, false), M.cable);
    world.add(tube);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    const material = new THREE.PointsMaterial({
      map: glow, color: color, size: size, transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending
    });
    const pts = new THREE.Points(geo, material);
    pts.frustumCulled = false;
    world.add(pts);
    return { curve: curve, geo: geo, mat: material, n: n, speed: speed, fill: 1 };
  }
  const flowA = flowLine([
    [-9.8, 0.75, -5.6], [-9.4, 0.06, -4.2], [-8, 0.06, -1], [-6.2, 0.06, 2.6], [-5.6, 0.06, 4.9], [-5.6, 0.7, 5.15]
  ], LOW ? 22 : 40, 0.16, '#ffcf5a', 0.42);
  const flowB = flowLine([
    [-5.6, 1.12, 5.4], [-5.75, 1.5, 5.2], [-6.15, 1.6, 4.9], [-6.48, 1.55, 4.6]
  ], LOW ? 10 : 16, 0.42, '#ffe08a', 0.36);
  const tmpV = new THREE.Vector3();

  function updateFlow(f, opacity, elapsed) {
    f.mat.opacity = opacity;
    const pos = f.geo.attributes.position.array;
    for (let i = 0; i < f.n; i++) {
      const u = (i / f.n + elapsed * f.speed) % 1;
      if (u > f.fill || opacity < 0.01) { pos[i * 3 + 1] = -50; continue; }
      f.curve.getPointAt(u, tmpV);
      pos[i * 3] = tmpV.x; pos[i * 3 + 1] = tmpV.y + 0.08; pos[i * 3 + 2] = tmpV.z;
    }
    f.geo.attributes.position.needsUpdate = true;
  }

  /* Çit kıvılcımları (direklerin izolatörlerinde) */
  const sparkPos = new Float32Array(fencePosts.length * 2 * 3);
  fencePosts.forEach(function (p, i) {
    sparkPos.set([p[0], 0.45, p[1], p[0], 0.75, p[1]], i * 6);
  });
  const sparkGeo = new THREE.BufferGeometry();
  sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
  const sparkMat = new THREE.PointsMaterial({
    map: glow, color: '#a5f3fc', size: 0.5, transparent: true, opacity: 0,
    depthWrite: false, blending: THREE.AdditiveBlending
  });
  world.add(new THREE.Points(sparkGeo, sparkMat));

  /* ---- Gökyüzü ve yıldızlar ---- */
  const skyUniforms = {
    top: { value: new THREE.Color() },
    horizon: { value: new THREE.Color() },
    bottom: { value: new THREE.Color() },
    sunDir: { value: new THREE.Vector3(0, 1, 0) },
    sunColor: { value: new THREE.Color('#ffd9a0') },
    sunVis: { value: 1 },
    moonDir: { value: new THREE.Vector3(-0.55, 0.32, -0.77).normalize() },
    moonVis: { value: 0 }
  };
  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(220, 32, 16),
    new THREE.ShaderMaterial({
      uniforms: skyUniforms,
      side: THREE.BackSide,
      depthWrite: false,
      vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: [
        'uniform vec3 top; uniform vec3 horizon; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; uniform float sunVis;',
        'uniform vec3 moonDir; uniform float moonVis;',
        'varying vec3 vDir;',
        'void main(){',
        '  vec3 d = normalize(vDir); float h = d.y;',
        '  vec3 col = h > 0.0 ? mix(horizon, top, pow(h, 0.5)) : mix(horizon, bottom, pow(-h, 0.35));',
        '  float s = max(dot(d, normalize(sunDir)), 0.0);',
        '  col += sunColor * pow(s, 14.0) * 0.35 * sunVis;',
        '  float disc = smoothstep(0.9990, 0.9995, s) * sunVis;',
        '  col = mix(col, vec3(1.0, 0.93, 0.78), disc);',
        '  float m = max(dot(d, normalize(moonDir)), 0.0);',
        '  col += vec3(0.55, 0.62, 0.8) * pow(m, 60.0) * 0.25 * moonVis;',
        '  col = mix(col, vec3(0.86, 0.9, 1.0), smoothstep(0.99955, 0.9998, m) * moonVis);',
        '  gl_FragColor = vec4(col, 1.0);',
        '  #include <colorspace_fragment>',
        '}'
      ].join('\n')
    })
  );
  scene.add(sky);

  const STAR_N = LOW ? 250 : 600;
  const starPos = new Float32Array(STAR_N * 3);
  for (let i = 0; i < STAR_N; i++) {
    const u = Math.random() * Math.PI * 2, v = 0.08 + Math.random() * 0.9;
    const r = 200, c = Math.sqrt(1 - v * v);
    starPos[i * 3] = Math.cos(u) * c * r;
    starPos[i * 3 + 1] = v * r;
    starPos[i * 3 + 2] = Math.sin(u) * c * r;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  const starMat = new THREE.PointsMaterial({ color: '#dbe6ff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  scene.add(new THREE.Points(starGeo, starMat));

  /* Bulutlar — yumuşak sprite'lar, gökyüzünde yavaşça süzülür */
  const cloudTex = (function () {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const g = c.getContext('2d');
    [[70, 76, 42], [120, 62, 52], [170, 74, 44], [100, 84, 36], [150, 86, 38], [205, 82, 30], [45, 86, 26]].forEach(function (b) {
      const r = g.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
      r.addColorStop(0, 'rgba(255,255,255,0.9)');
      r.addColorStop(0.6, 'rgba(255,255,255,0.35)');
      r.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = r; g.fillRect(0, 0, 256, 128);
    });
    return new THREE.CanvasTexture(c);
  })();
  const cloudMat = new THREE.SpriteMaterial({ map: cloudTex, transparent: true, depthWrite: false, fog: false, opacity: 0.8 });
  const clouds = new THREE.Group();
  scene.add(clouds);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + (i % 3) * 0.3;
    const r = 120 + (i % 4) * 14;
    const sp = new THREE.Sprite(cloudMat);
    sp.position.set(Math.cos(a) * r, 34 + (i % 3) * 10, Math.sin(a) * r);
    sp.scale.set(46 + (i % 3) * 14, 18 + (i % 2) * 6, 1);
    clouds.add(sp);
  }
  const WHITE = new THREE.Color('#ffffff');

  /* ---- Işıklar ---- */
  const hemi = new THREE.HemisphereLight('#bcd6ff', '#5a4a36', 0.5);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight('#ffffff', 2);
  sun.castShadow = !LOW;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -24, right: 24, top: 20, bottom: -20, near: 1, far: 140 });
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);

  /* ---- Saat → gökyüzü / ışık ---- */
  const skyKeys = SKY.map(function (k) {
    return { t: k.t, top: new THREE.Color(k.top), hor: new THREE.Color(k.hor), light: new THREE.Color(k.light), li: k.li, hi: k.hi };
  });
  const nightBottom = new THREE.Color('#05080f');
  const moonDir = new THREE.Vector3(-0.3, 0.85, 0.45).normalize();
  const sunDir = new THREE.Vector3();
  const lightDir = new THREE.Vector3();
  const trackDir = new THREE.Vector3();
  const UP = new THREE.Vector3(0, 1, 0);

  function sunDirAt(t, out) {
    const a = Math.PI * Math.min(t / 0.76, 1);
    return out.set(Math.cos(a), Math.sin(a) * 1.05 - 0.04, -0.75).normalize();
  }

  function applyTime(t) {
    let i = 0;
    while (i < skyKeys.length - 2 && t > skyKeys[i + 1].t) i++;
    const a = skyKeys[i], b = skyKeys[i + 1];
    const f = clamp01((t - a.t) / (b.t - a.t));
    skyUniforms.top.value.lerpColors(a.top, b.top, f);
    skyUniforms.horizon.value.lerpColors(a.hor, b.hor, f);
    skyUniforms.bottom.value.copy(skyUniforms.horizon.value).lerp(nightBottom, 0.75);
    sun.color.lerpColors(a.light, b.light, f);
    sun.intensity = a.li + (b.li - a.li) * f;
    hemi.intensity = a.hi + (b.hi - a.hi) * f;
    hemi.color.copy(skyUniforms.top.value).lerp(UP_COLOR, 0.5);

    sunDirAt(t, sunDir);
    const toMoon = smooth(0.7, 0.82, t);
    lightDir.copy(sunDir).lerp(moonDir, toMoon).normalize();
    sun.position.copy(lightDir).multiplyScalar(60);
    skyUniforms.sunDir.value.copy(sunDir);
    skyUniforms.sunVis.value = 1 - toMoon;

    const night = smooth(0.72, 0.88, t);
    const day = smooth(0, 0.1, t) * (1 - smooth(0.66, 0.8, t));
    starMat.opacity = night * 0.9;
    skyUniforms.moonVis.value = night;
    scene.fog.color.copy(skyUniforms.horizon.value).lerp(skyUniforms.top.value, 0.35);
    cloudMat.color.copy(skyUniforms.horizon.value).lerp(WHITE, 0.2 + day * 0.65);
    cloudMat.opacity = 0.3 + day * 0.5;
    /* Yansıma: sadece panel/metal/cam belirgin; mat yüzeylerde çok hafif (aksi halde sahne beyazlaşır) */
    const envI = 0.06 + 0.22 * day;
    if (Math.abs(envI - lastEnv) > 0.005) {
      lastEnv = envI;
      envMats.forEach(function (m) { m.envMapIntensity = (m === M.panel || m === M.metal || m === M.glass || m === M.steel ? 3.2 : 1) * envI; });
    }
    M.window.emissiveIntensity = night * 1.8;
    M.ir.emissiveIntensity = night * 1.2;
    poleCam.cone.opacity = night * 0.14;
    poleCam.cone.visible = night > 0.01;
    shopLight.intensity = 3 + night * 9;
    webLight.intensity = 3 + night * 9;

    trackDir.copy(sunDir);
    trackDir.y = Math.max(trackDir.y, 0.3);
    trackDir.normalize().lerp(UP, night).normalize();
    return { night: night, day: day };
  }
  const UP_COLOR = new THREE.Color('#dbe8ff');

  /* ============================================
     KAYDIRMA → KAMERA
     ============================================ */
  const sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  const steps = [];
  PAGES[pageKey].forEach(function (s, i) {
    if (s && sections[i] && SHOTS[s[0]]) {
      steps.push({ el: sections[i], pos: V(SHOTS[s[0]].pos), look: V(SHOTS[s[0]].look), time: s[1] });
    }
  });
  if (!steps.length) throw new Error('no steps');
  const hero = sections[0];
  const leftHero = !!LEFT_HERO[pageKey];

  const tgtPos = new THREE.Vector3(), tgtLook = new THREE.Vector3();
  let tgtTime = 0;

  function computeTarget() {
    const mid = window.innerHeight * 0.5;
    const anchors = steps.map(function (s) { const r = s.el.getBoundingClientRect(); return r.top + r.height * 0.5; });
    let i = 0, f = 0;
    if (mid <= anchors[0]) { i = 0; f = 0; }
    else if (mid >= anchors[anchors.length - 1]) { i = anchors.length - 1; f = 0; }
    else {
      while (i < anchors.length - 1 && mid > anchors[i + 1]) i++;
      f = (mid - anchors[i]) / Math.max(1, anchors[i + 1] - anchors[i]);
      f = f * f * (3 - 2 * f);
    }
    const A = steps[i], B = steps[Math.min(i + 1, steps.length - 1)];
    tgtPos.lerpVectors(A.pos, B.pos, f);
    tgtPos.y += Math.sin(Math.PI * f) * A.pos.distanceTo(B.pos) * 0.22; /* geçişlerde hafif kavis */
    tgtLook.lerpVectors(A.look, B.look, f);
    tgtTime = A.time + (B.time - A.time) * f;
  }

  /* Fare: hafif paralaks + güvenlik kameraları farenin gösterdiği noktaya döner (sadece masaüstü) */
  const pointer = { x: 0, y: 0, sx: 0, sy: 0, moved: -1e9 };
  const finePointer = !isSmall && window.matchMedia('(pointer: fine)').matches;
  if (finePointer) {
    window.addEventListener('pointermove', function (e) {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
      pointer.moved = performance.now();
    }, { passive: true });
  }
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const aimPoint = new THREE.Vector3();
  const aimLocal = new THREE.Vector3();

  function lerpAngle(a, b, k) {
    let d = (b - a) % (Math.PI * 2);
    if (d > Math.PI) d -= Math.PI * 2;
    if (d < -Math.PI) d += Math.PI * 2;
    return a + d * k;
  }

  /* Kamerayı dünya koordinatındaki bir noktaya çevir */
  function aimAt(cam, parent, point, k) {
    aimLocal.copy(point);
    if (parent) parent.worldToLocal(aimLocal);
    const dx = aimLocal.x - cam.head.position.x;
    const dy = aimLocal.y - cam.head.position.y;
    const dz = aimLocal.z - cam.head.position.z;
    const yaw = Math.atan2(dx, dz);
    const pitch = Math.min(1.1, Math.max(0.05, Math.atan2(-dy, Math.hypot(dx, dz))));
    cam.head.rotation.y = lerpAngle(cam.head.rotation.y, yaw, k);
    cam.head.rotation.x += (pitch - cam.head.rotation.x) * k;
  }

  /* ---- Açılış turu (Güneş Enerjisi sayfası) ---- */
  const intro = {
    active: !!INTRO[pageKey] && window.scrollY < 40,
    t: 0,
    housePower: 0
  };
  const introOffA = new THREE.Vector3(3.6, 2.4, 4.6);
  const introOffB = new THREE.Vector3(2.6, 1.3, 3.4);
  const houseLitPos = V(SHOTS.houseLit.pos), houseLitLook = V(SHOTS.houseLit.look);
  function stopIntro() { intro.active = false; }
  const introType = INTRO[pageKey];
  if (intro.active) {
    if (introType === 'flow') { flowA.fill = 0; flowB.fill = 0; }
    ['wheel', 'touchmove', 'keydown'].forEach(function (ev) { window.addEventListener(ev, stopIntro, { once: true, passive: true }); });
  }

  /* Rota turu: anahtar karelerden yumuşak eğri; her durakta yavaşlar */
  const TOUR = TOURS[pageKey] || ROOM_TOUR;
  const tourPos = new THREE.CatmullRomCurve3(TOUR.map(function (k) { return V(k[1]); }));
  const tourLook = new THREE.CatmullRomCurve3(TOUR.map(function (k) { return V(k[2]); }));
  function pathTarget(t) {
    const n = TOUR.length - 1;
    let i = 0;
    while (i < n - 1 && t > TOUR[i + 1][0]) i++;
    const local = smooth(TOUR[i][0], TOUR[i + 1][0], t);
    const u = Math.min(1, (i + local) / n);
    tourPos.getPoint(u, tgtPos);
    tourLook.getPoint(u, tgtLook);
    tgtTime = steps[0].time;
    if (t > TOUR[n][0] + 0.3 || window.scrollY > 40) intro.active = false;
  }

  /* Tur akışı (saniye): 0.6–3.2 akım panellerden inverter'a, 3.2–4.4 inverter'dan eve, 4.4–5.4 ışıklar yanar, 7.5 biter */
  function introTarget(dt) {
    intro.t += dt;
    const t = intro.t;
    if (introType === 'path') { pathTarget(t); return; }
    flowA.fill = smooth(0.6, 3.2, t);
    flowB.fill = smooth(3.4, 4.4, t);
    intro.housePower = smooth(4.3, 5.2, t);
    if (t < 3.4) {
      flowA.curve.getPointAt(Math.max(0.02, Math.min(0.98, flowA.fill)), tgtLook);
      tgtPos.copy(tgtLook).add(introOffA);
    } else if (t < 4.6) {
      flowB.curve.getPointAt(Math.max(0.05, flowB.fill), tgtLook);
      tgtPos.copy(tgtLook).add(introOffB);
    } else {
      tgtPos.copy(houseLitPos);
      tgtLook.copy(houseLitLook);
    }
    tgtTime = steps[0].time;
    if (t > 7.5 || window.scrollY > 40) intro.active = false;
  }

  /* ---- Boyutlandırma ---- */
  let vw = 0, vh = 0, frameShift = -1;
  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    renderer.setSize(vw, vh, false);
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(vw, vh); }
    camera.aspect = vw / vh;
    frameShift = -1;
    camera.updateProjectionMatrix();
  }
  let resizeRaf = 0;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(resize);
  });
  resize();

  /* WebGL bağlamı kaybolursa düz tasarıma dön */
  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    document.documentElement.classList.remove('has-3d');
    canvas.style.display = 'none';
  });

  /* ---- Başlangıç: kamera hedefin biraz gerisinden süzülerek gelir ---- */
  computeTarget();
  const curPos = tgtPos.clone().add(new THREE.Vector3(5, 4, 9));
  const curLook = tgtLook.clone();
  if (intro.active && introType === 'path') {
    curPos.copy(V(TOUR[0][1]));
    curLook.copy(V(TOUR[0][2]));
  }
  let curTime = tgtTime;
  let drift = 1;   /* paralaks/salınım: oda turunda kapan çarpmasın diye 0'a iner */
  let heroP = -1, shift = leftHero ? 1 : 0;
  let elapsed = 0, last = performance.now();
  const minFrame = LOW ? 1000 / 30 : 0;
  const isDesktop = window.matchMedia('(min-width: 992px)');

  const lookV = new THREE.Vector3();
  const MIN_PITCH = Math.tan(10 * Math.PI / 180);

  function update(dt) {
    elapsed += dt;
    if (intro.active) introTarget(dt);
    else computeTarget();
    const k = 1 - Math.exp(-dt * 3);
    const inRooms = intro.active && introType === 'path';
    /* oda turunda kamera rotayı sıkı izler (duvar kesmesin); kaydırmada ağır ağır süzülür */
    const kf = inRooms ? 1 - Math.exp(-dt * 7) : intro.active ? k : 1 - Math.exp(-dt * SCROLL_FOLLOW);
    curPos.lerp(tgtPos, kf);
    curLook.lerp(tgtLook, kf);
    curTime += (tgtTime - curTime) * (1 - Math.exp(-dt * (intro.active ? 2.5 : SCROLL_FOLLOW * 0.8)));

    drift += ((inRooms ? 0 : 1) - drift) * k;
    pointer.sx += (pointer.x - pointer.sx) * k;
    pointer.sy += (pointer.y - pointer.sy) * k;
    camera.position.copy(curPos);
    camera.position.x += (pointer.sx * 0.9 + Math.sin(elapsed * 0.15) * 0.35) * drift;
    camera.position.y += -pointer.sy * 0.45 * drift;
    /* Göğe bakma koruması: dış çekimlerde bakış en az ~10° aşağı eğik kalır */
    lookV.copy(curLook);
    if (!inRooms) {
      const hd = Math.hypot(lookV.x - camera.position.x, lookV.z - camera.position.z);
      lookV.y = Math.min(lookV.y, camera.position.y - hd * MIN_PITCH);
    }
    camera.lookAt(lookV);

    /* Hero kaydırma ilerlemesi → CSS (--hero-p) ve maket çerçevesi */
    if (hero) {
      const r = hero.getBoundingClientRect();
      const p = clamp01(-r.top / Math.max(1, r.height));
      if (Math.abs(p - heroP) > 0.002) {
        heroP = p;
        hero.style.setProperty('--hero-p', p.toFixed(3));
      }
    }
    const wantShift = (leftHero && isDesktop.matches) ? 1 - smooth(0, 0.9, heroP) : 0;
    shift += (wantShift - shift) * k;
    if (Math.abs(shift - frameShift) > 0.001) {
      frameShift = shift;
      if (shift > 0.001) camera.setViewOffset(vw, vh, -vw * 0.17 * shift, 0, vw, vh);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
    }

    const state = applyTime(curTime);

    /* Paneller güneşi takip eder (gece yatay konuma geçer) */
    for (let i = 0; i < trackers.length; i++) {
      const p = trackers[i];
      tmpV.copy(p.position).add(trackDir);
      p.lookAt(tmpV);
    }

    /* Ev ışıkları: Güneş sayfasında akım eve ulaşınca yanar; diğer sayfalarda gece yanar */
    if (!intro.active) {
      if (introType === 'flow') intro.housePower += (1 - intro.housePower) * k;
      flowA.fill += (1 - flowA.fill) * k;
      flowB.fill += (1 - flowB.fill) * k;
    }
    const power = Math.max(intro.housePower, state.night);
    M.houseWindow.emissiveIntensity = power * 2.4;
    M.lamp.emissiveIntensity = power * (0.8 + 2.2 * state.night);
    porchLight.intensity = power * (1.2 + 3 * state.night);

    /* Enerji akışı: gündüz panellerden; gece aküden eve */
    updateFlow(flowA, state.day * 0.95, elapsed);
    updateFlow(flowB, Math.max(state.day, state.night * 0.8) * 0.95, elapsed);
    const act = flowA.fill * state.day;
    /* İnverter ekranı — sadece kamera yakındayken, saniyede ~5 kez çizilir */
    invTimer += dt;
    if (invTimer > 0.2 && camera.position.distanceTo(invSpot) < 14) {
      invTimer = 0;
      const nightMode = state.night > 0.5;
      const kw = nightMode ? 0.4 + 0.08 * Math.sin(elapsed * 1.3)
        : act * (3.4 + 0.25 * Math.sin(elapsed * 0.9) + 0.1 * Math.sin(elapsed * 3.7));
      invHistory.push(Math.max(0, nightMode ? 0 : kw));
      if (invHistory.length > 60) invHistory.shift();
      const battery = Math.min(98, 35 + 60 * Math.min(curTime / 0.65, 1) - 22 * smooth(0.75, 1, curTime));
      drawInverter(Math.max(0, kw), battery, nightMode, elapsed);
    }

    /* Elektrikli çit: ~1.3 sn'de bir kısa enerji atımı (yanar–söner) */
    const fp = elapsed % 1.3;
    const zap = fp < 0.16 ? 0.6 + 0.4 * Math.random() : 0;
    M.fenceWire.emissiveIntensity = zap * 3.2;
    sparkMat.opacity = zap;
    fenceLed.visible = fp < 0.3;

    /* Koyunlar: kendi alanlarında ağır ağır dolaşır, arada başını eğip otlar */
    sheep.forEach(function (s) {
      const t = elapsed * s.speed + s.phase;
      const x = s.cx + Math.cos(t) * s.r, z = s.cz + Math.sin(t * 0.7) * s.r * 0.6;
      const dx = x - s.g.position.x, dz = z - s.g.position.z;
      if (dx * dx + dz * dz > 1e-8) s.g.rotation.y = lerpAngle(s.g.rotation.y, Math.atan2(dx, dz), 0.1);
      s.g.position.x = x; s.g.position.z = z;
      const graze = Math.max(0, Math.sin(elapsed * 0.5 + s.phase * 3));
      s.head.rotation.x = graze * 0.9;
    });

    /* Güvenlik kameraları: masaüstünde fareyi takip eder, aksi halde otomatik tarar */
    const kc = 1 - Math.exp(-dt * 5);
    if (finePointer && performance.now() - pointer.moved < 4000) {
      camera.updateMatrixWorld();
      ndc.set(pointer.x, -pointer.y);
      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(groundPlane, aimPoint)) raycaster.ray.at(40, aimPoint);
      aimAt(poleCam, null, aimPoint, kc);
    } else {
      poleCam.head.rotation.y = lerpAngle(poleCam.head.rotation.y, poleYaw + Math.sin(elapsed * 0.5) * 0.75, kc);
      poleCam.head.rotation.x += (0.42 + Math.sin(elapsed * 0.31) * 0.1 - poleCam.head.rotation.x) * kc;
    }
    const blink = (Math.sin(elapsed * 4) > 0.6) ? 1 : 0;
    poleCam.led.visible = blink === 1;
    cabinetLed.material.color.setRGB(0.2, 0.55 + 0.3 * state.day, 0.45);

    /* 3D printer: 10 sn bas, 2 sn bekle, baştan */
    const cyc = elapsed % 12;
    const pr = Math.min(cyc / 10, 1);
    const layerY = BED_TOP + pr * VASE_H;
    clip.constant = printerWorldY + layerY; /* kesme düzlemi dünya koordinatında çalışır */
    const ang = elapsed * 7;
    const rad = cyc < 10 ? vaseR(pr * VASE_H) : 0;
    nozzle.position.set(Math.cos(ang) * rad, layerY + 0.07, Math.sin(ang) * rad);
    gantry.position.y = layerY + 0.12;
    arm.position.set(nozzle.position.x, layerY + 0.12, (nozzle.position.z - 0.4) / 2);
    arm.scale.z = Math.max(0.1, (nozzle.position.z + 0.4) / 0.4);
    holo.rotation.y = elapsed * 0.6;
    clouds.rotation.y = elapsed * 0.004;
    gearA.rotation.z = elapsed * 0.8;
    gearB.rotation.z = -elapsed * 0.8 * (12 / 8) + 0.13;

    /* İzleme ekranı efektleri + saat */
    feedMat.uniforms.time.value = elapsed;
    feedMat.uniforms.night.value = state.night;
    osdTimer += dt;
    if (osdTimer > 0.5 && camera.position.distanceTo(feedSpot) < 70) { osdTimer = 0; drawOsd(elapsed); }

    /* Web tasarım ekranları — sadece kamera atölyeye yakınken güncellenir (performans) */
    screenTimer += dt;
    if (screenTimer > 0.08 && camera.position.distanceTo(shopCenter) < 22) {
      screenTimer = 0;
      drawSite(Math.min((elapsed % 11) / 9, 1), elapsed);
      drawCode(Math.min((elapsed % 14) / 11, 1), elapsed);
    }
  }
  let screenTimer = 0, osdTimer = 0;

  /* Printer'ın dünya yüksekliği (kesme düzlemi dünya koordinatında çalışır) */
  world.updateMatrixWorld(true);
  const printerWorldY = new THREE.Vector3().setFromMatrixPosition(printer.matrixWorld).y;

  function frame(now) {
    requestAnimationFrame(frame);
    if (minFrame && now - last < minFrame - 1) return;
    const realDt = (now - last) / 1000;
    const dt = Math.min(realDt, 0.1);
    last = now;
    update(dt);
    /* İzleme monitörü canlı görüntüsü — yakındayken iki karede bir, uzaktan görünürken ~5 fps */
    const feedDist = camera.position.distanceTo(feedSpot);
    feedTick++;
    if ((feedDist < 16 && feedTick % 2 === 0) || (feedDist < 70 && feedTick % 12 === 0)) renderFeed();
    draw();
    checkPerf(realDt);
  }

  /* Otomatik kalite: ilk saniyelerde kare hızı düşükse parlama, gölge ve çözünürlük düşürülür.
     Böylece zayıf bilgisayarlarda site akıcı kalır. (?hq=1 ile kapatılabilir) */
  let perfFrames = 0, perfTime = 0, perfDone = FORCE_HQ || LOW;
  function checkPerf(realDt) {
    if (perfDone || elapsed < 1.5 || document.hidden) return;
    perfFrames++;
    perfTime += realDt;
    if (perfTime < 3) return;
    perfDone = true;
    if (perfFrames / perfTime < 40) {
      composer = null;
      sun.castShadow = false;
      renderer.setPixelRatio(1);
      resize();
      console.info('[scene3d] Kare hızı düşük — sade kaliteye geçildi.');
    }
  }
  let feedTick = 0;
  function renderFeed() {
    const c1 = poleCam.cone.visible;
    poleCam.cone.visible = false;   /* tarama ışını kendi görüntüsünü kapatmasın */
    const au = renderer.shadowMap.autoUpdate;
    renderer.shadowMap.autoUpdate = false;
    renderer.setRenderTarget(feedRT);
    renderer.render(scene, feedCam);
    renderer.setRenderTarget(null);
    renderer.shadowMap.autoUpdate = au;
    poleCam.cone.visible = c1;
  }

  /* İlk kare çizildikten sonra 3D stillerini aç ve sahneyi yumuşakça göster */
  update(0.016);
  renderFeed();   /* monitör ilk anda da boş görünmesin */
  draw();
  document.documentElement.classList.add('has-3d');
  requestAnimationFrame(function () {
    canvas.classList.add('is-ready');
    last = performance.now();
    requestAnimationFrame(frame);
  });
}
})();
