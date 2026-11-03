const PARTNERS = {
  metaltyrannomon: {
    name: "MetalTyrannomon",
    stage: "stage 5 · 完全体",
    status: "它正在村落里巡视领地，精神饱满。",
    evoText: "本阶段进化槽 · 2,630.1 万 / 6,250.0 万 token",
    evoPct: 64,
    stats: { satiety: 78, mood: 92, energy: 84, hygiene: 96, bond: 88 },
    frames: [
      "assets/sprites/metaltyrannomon/0.png",
      "assets/sprites/metaltyrannomon/1.png",
      "assets/sprites/metaltyrannomon/5.png"
    ]
  },
  agumon: {
    name: "Agumon",
    stage: "stage 3 · 成长期",
    status: "它正盯着刚入账的请求，跃跃欲试。",
    evoText: "本阶段进化槽 · 1,420.0 万 / 2,000.0 万 token",
    evoPct: 71,
    stats: { satiety: 85, mood: 95, energy: 90, hygiene: 92, bond: 82 },
    frames: [
      "assets/sprites/agumon/0.png",
      "assets/sprites/agumon/1.png",
      "assets/sprites/agumon/5.png"
    ]
  },
  gatomon: {
    name: "Gatomon",
    stage: "stage 4 · 成熟期",
    status: "它安静地蹲在栖息地里，轻轻晃着尾巴。",
    evoText: "本阶段进化槽 · 2,950.0 万 / 3,750.0 万 token",
    evoPct: 79,
    stats: { satiety: 82, mood: 90, energy: 76, hygiene: 99, bond: 94 },
    frames: [
      "assets/sprites/gatomon/0.png",
      "assets/sprites/gatomon/1.png",
      "assets/sprites/gatomon/5.png"
    ]
  },
  wargreymon: {
    name: "WarGreymon",
    stage: "stage 6 · 究极体",
    status: "历经相克试炼的究极搭档，气场全开。",
    evoText: "本阶段进化槽 · 8,800.0 万 / 10,000.0 万 token",
    evoPct: 88,
    stats: { satiety: 91, mood: 98, energy: 89, hygiene: 97, bond: 100 },
    frames: [
      "assets/sprites/wargreymon/0.png",
      "assets/sprites/wargreymon/1.png",
      "assets/sprites/wargreymon/5.png"
    ]
  }
};

const SCENES = {
  village: { label: "阳光村落", bg: "assets/scenes/village.webp" },
  night: { label: "月见之丘", bg: "assets/scenes/night.webp" },
  sakura: { label: "樱之神社", bg: "assets/scenes/sakura.webp" },
  castle: { label: "丑皇暗堡", bg: "assets/scenes/castle.webp" }
};

let currentPartnerKey = "metaltyrannomon";
let currentSceneKey = "village";
let frameIndex = 0;
let jumpOffset = 0;
let happyTicks = 0;
const hearts = [];
const imageCache = new Map();

const canvas = document.getElementById("preview-canvas");
const ctx = canvas ? canvas.getContext("2d") : null;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function loadSprite(src) {
  if (imageCache.has(src)) return imageCache.get(src);
  const img = new Image();
  img.onload = () => renderCanvas();
  img.src = src;
  imageCache.set(src, img);
  return img;
}

Object.values(PARTNERS).forEach((p) => p.frames.forEach(loadSprite));

function updateHud() {
  const partner = PARTNERS[currentPartnerKey];
  const scene = SCENES[currentSceneKey];
  document.getElementById("stage-pet-name").textContent = partner.name;
  document.getElementById("stage-pet-meta").textContent = `${partner.stage} · ${scene.label}`;
  document.getElementById("hud-name").textContent = partner.name;
  document.getElementById("hud-status").textContent = partner.status;
  document.getElementById("evo-label").textContent = partner.evoText;
  document.getElementById("evo-pct").textContent = `${partner.evoPct}%`;
  document.getElementById("evo-bar").style.width = `${partner.evoPct}%`;

  for (const [stat, val] of Object.entries(partner.stats)) {
    const bar = document.getElementById(`bar-${stat}`);
    const num = document.getElementById(`val-${stat}`);
    if (bar) bar.style.width = `${val}%`;
    if (num) num.textContent = String(val);
  }
}

function setScene(sceneKey) {
  if (!SCENES[sceneKey]) return;
  currentSceneKey = sceneKey;
  const viewport = document.getElementById("scene-viewport");
  if (viewport) {
    viewport.style.backgroundImage = `url("${SCENES[sceneKey].bg}")`;
  }
  document.querySelectorAll(".scene-pill").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.scene === sceneKey);
  });
  updateHud();
}

function setPartner(partnerKey) {
  if (!PARTNERS[partnerKey]) return;
  currentPartnerKey = partnerKey;
  happyTicks = 10;
  jumpOffset = 18;
  document.querySelectorAll(".partner-chip").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.partner === partnerKey);
  });
  updateHud();
  renderCanvas();
}

function spawnHearts(count = 3) {
  for (let i = 0; i < count; i += 1) {
    hearts.push({
      x: 260 + (Math.random() - 0.5) * 90,
      y: 118 + Math.random() * 20,
      vy: 1.2 + Math.random() * 0.8,
      life: 26
    });
  }
}

function renderCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(0, 0, 0, 0.36)";
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, 266, 76, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  const partner = PARTNERS[currentPartnerKey];
  const src = happyTicks > 0 ? partner.frames[2] : partner.frames[frameIndex % 2];
  const img = loadSprite(src);

  if (img.complete && img.naturalWidth > 0) {
    const scale = 3.6;
    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;
    const x = (canvas.width - w) / 2;
    const y = 264 - h - jumpOffset;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x, y, w, h);
  }

  for (let i = hearts.length - 1; i >= 0; i -= 1) {
    const h = hearts[i];
    ctx.fillStyle = "#ff78b4";
    ctx.font = "bold 18px sans-serif";
    ctx.fillText("♥", h.x, h.y);
    h.y -= h.vy;
    h.life -= 1;
    if (h.life <= 0) hearts.splice(i, 1);
  }
}

if (canvas) {
  canvas.addEventListener("click", () => {
    const partner = PARTNERS[currentPartnerKey];
    partner.stats.bond = Math.min(100, partner.stats.bond + 2);
    partner.stats.mood = Math.min(100, partner.stats.mood + 2);
    happyTicks = 14;
    jumpOffset = 22;
    spawnHearts(4);
    document.getElementById("stage-tip").textContent = `${partner.name} 开心地跳了起来！亲密 +2`;
    updateHud();
    renderCanvas();
  });
}

document.querySelectorAll(".partner-chip").forEach((btn) => {
  btn.addEventListener("click", () => setPartner(btn.dataset.partner));
});

document.querySelectorAll(".scene-pill").forEach((btn) => {
  btn.addEventListener("click", () => setScene(btn.dataset.scene));
});

document.querySelectorAll("[data-pick-scene]").forEach((card) => {
  card.addEventListener("click", () => {
    setScene(card.dataset.pickScene);
    document.getElementById("showcase")?.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
  });
});

const ACTION_FEEDBACK = {
  snack: { stat: "satiety", delta: 8, text: "喂食了像素点心，饱食度上升！" },
  play: { stat: "mood", delta: 6, text: "陪搭档玩耍了一会儿，心情大好！" },
  clean: { stat: "hygiene", delta: 10, text: "栖息地打扫得干干净净，清洁拉满！" },
  expedition: { stat: "bond", delta: 4, text: "已模拟派遣「深夜远征」，满载数据碎片归来！" }
};

document.querySelectorAll("[data-action]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const cfg = ACTION_FEEDBACK[btn.dataset.action];
    if (!cfg) return;
    const partner = PARTNERS[currentPartnerKey];
    partner.stats[cfg.stat] = Math.min(100, partner.stats[cfg.stat] + cfg.delta);
    partner.evoPct = Math.min(100, partner.evoPct + 3);
    happyTicks = 14;
    jumpOffset = 18;
    spawnHearts(3);
    document.getElementById("hud-status").textContent = cfg.text;
    document.getElementById("stage-tip").textContent = cfg.text;
    updateHud();
    renderCanvas();
  });
});

const copyBtn = document.getElementById("copy-cmd");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const cmd = copyBtn.dataset.cmd || "";
    const badge = document.getElementById("copy-status");
    try {
      await navigator.clipboard.writeText(cmd);
      if (badge) badge.textContent = "已复制";
    } catch {
      if (badge) badge.textContent = "请手动复制";
    }
  });
}

updateHud();
renderCanvas();

if (!prefersReducedMotion) {
  setInterval(() => {
    frameIndex = (frameIndex + 1) % 2;
    if (happyTicks > 0) happyTicks -= 1;
    if (jumpOffset > 0) jumpOffset = Math.max(0, jumpOffset - 6);
    renderCanvas();
  }, 420);
}
