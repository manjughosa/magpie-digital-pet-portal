import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGINAL_REPO_URL = "https://github.com/manjughosa/magpie-digital-pet";
const APPROVED_SCENES = ["castle.webp", "night.webp", "sakura.webp", "village.webp"];
const APPROVED_SPRITES = ["agumon", "gatomon", "metaltyrannomon", "wargreymon"];

let failures = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}`);
    console.error(error.message);
  }
}

function deriveMarketKind(pkg) {
  const hasMain = typeof pkg.main === "string" && pkg.main.trim() !== "";
  const hasExports = pkg.exports !== undefined && pkg.exports !== null && Object.keys(pkg.exports).length > 0;
  if (!hasMain && !hasExports) {
    if (pkg.magpie?.middleware?.trim()) return "middleware";
    if (pkg.magpie?.agent?.trim()) return "agent";
    if (pkg.magpie?.page?.file?.trim()) return "page";
    if (pkg.magpie?.hooks?.trim()) return "hooks";
  }
  return "provider-fallback";
}

test("package.json is a pure page plugin that cannot fall back to provider", () => {
  const pkgPath = join(ROOT, "package.json");
  assert.ok(existsSync(pkgPath), "package.json must exist");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));

  assert.equal(pkg.name, "magpie-digital-pet-portal");
  assert.equal(pkg.magpie?.page?.file, "page/index.html");
  assert.ok(existsSync(join(ROOT, pkg.magpie.page.file)), "magpie.page.file must exist on disk");
  assert.ok(existsSync(join(ROOT, pkg.magpie?.page?.icon ?? "")), "magpie.page.icon must exist on disk");

  for (const forbidden of ["main", "exports", "bin", "dependencies", "optionalDependencies", "peerDependencies"]) {
    assert.equal(pkg[forbidden], undefined, `${forbidden} must not be declared`);
  }
  for (const forbiddenMagpie of ["middleware", "agent", "hooks", "providers", "panels"]) {
    assert.equal(pkg.magpie?.[forbiddenMagpie], undefined, `magpie.${forbiddenMagpie} must not be declared`);
  }
  assert.equal(pkg.magpie?.page?.service, undefined, "pure portal page must not declare a local service");
  assert.equal(deriveMarketKind(pkg), "page");
  assert.match(pkg.magpie?.icon ?? "", /^data:image\/png;base64,[A-Za-z0-9+/=]+$/);
  assert.equal(pkg.homepage, ORIGINAL_REPO_URL);
});

test("page/index.html includes required copy, interactive showcase, and valid local assets", () => {
  const htmlPath = join(ROOT, "page", "index.html");
  const cssPath = join(ROOT, "page", "app.css");
  const jsPath = join(ROOT, "page", "app.js");
  assert.ok(existsSync(htmlPath), "page/index.html must exist");
  assert.ok(existsSync(cssPath), "page/app.css must exist");
  assert.ok(existsSync(jsPath), "page/app.js must exist");

  const html = readFileSync(htmlPath, "utf8");
  const css = readFileSync(cssPath, "utf8");
  const js = readFileSync(jsPath, "utf8");
  assert.doesNotThrow(() => new Function(js), "page/app.js must be valid JavaScript syntax");

  assert.match(html, /600\+\s*宠物/, "must include exact 600+ 宠物 copy");
  assert.match(html, /超过\s*14\s*套像素场景/, "must include exact 超过 14 套像素场景 copy");
  assert.ok(!html.includes("650 只图鉴"), "must not use rejected 650 只图鉴 copy");
  assert.ok(!html.includes("15 套像素场景"), "must not use rejected 15 套像素场景 copy");

  for (const allowedScene of ["阳光村落", "月见之丘", "樱之神社", "丑皇暗堡"]) {
    assert.ok(html.includes(allowedScene), `must showcase approved scene: ${allowedScene}`);
  }
  for (const hiddenScene of ["黄昏海岸", "数据神殿", "星海尽头", "永冬雪原"]) {
    assert.ok(!html.includes(hiddenScene), `must not spoil extra scene in HTML: ${hiddenScene}`);
    assert.ok(!js.includes(hiddenScene), `must not spoil extra scene in JS: ${hiddenScene}`);
  }
  const scenePillMatches = [...html.matchAll(/class="scene-pill(?:\s+active)?"/g)];
  assert.equal(scenePillMatches.length, 4, "showcase strip must only expose the 4 approved scenes");

  const ctaMatches = [...html.matchAll(/<a\b[^>]*data-pet-link[^>]*>/g)];
  assert.ok(ctaMatches.length >= 3, "must have at least 3 acquisition CTA links marked with data-pet-link");
  for (const [tag] of ctaMatches) {
    assert.match(tag, new RegExp(`href="${ORIGINAL_REPO_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?:#[^"]*)?"`));
    assert.match(tag, /target="_blank"/);
    assert.match(tag, /rel="noopener noreferrer"/);
  }

  const assetRefs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((ref) => !ref.startsWith("http://") && !ref.startsWith("https://") && !ref.startsWith("#") && !ref.startsWith("data:"))
    // _magpie/* 由宿主随页面文件一起提供，不是仓库里的本地资产
    .filter((ref) => !ref.startsWith("_magpie/"));

  // 宿主只给页面 10 秒报到；没有 bridge 的 hello，整页会被换成
  // 「此页面已停止工作」错误卡（2026-11-03 实测：4 秒内零消息）
  assert.match(
    html,
    /<script src="_magpie\/bridge\.js"><\/script>/,
    "page must load the host bridge, or magpie replaces it with its stopped-working card",
  );

  assert.ok(assetRefs.length >= 6, "must reference local stylesheet, script, and visual assets");
  for (const ref of assetRefs) {
    const cleanRef = ref.split("?")[0].split("#")[0];
    assert.ok(existsSync(join(ROOT, "page", cleanRef)), `referenced local asset must exist: page/${cleanRef}`);
  }

  assert.match(css, /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/, "CSS must respect prefers-reduced-motion");
  assert.match(css, /:focus-visible/, "CSS must provide visible keyboard focus styles");
});

test("shipped art is exactly the approved scenes and partners, with no unreferenced asset", () => {
  const html = readFileSync(join(ROOT, "page", "index.html"), "utf8");
  const js = readFileSync(join(ROOT, "page", "app.js"), "utf8");
  const combined = `${html}\n${js}`;

  const scenes = readdirSync(join(ROOT, "page", "assets", "scenes")).sort();
  assert.deepEqual(scenes, APPROVED_SCENES, "only the 4 approved scene files may ship");

  const spriteDirs = readdirSync(join(ROOT, "page", "assets", "sprites")).sort();
  assert.deepEqual(spriteDirs, APPROVED_SPRITES, "only the 4 approved partner sprite folders may ship");

  const assets = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else assets.push(full);
    }
  };
  walk(join(ROOT, "page", "assets"));

  for (const file of assets) {
    const relative = file.slice(join(ROOT, "page") .length + 1).replace(/\\/g, "/");
    assert.ok(combined.includes(relative), `shipped asset must be referenced by the page: ${relative}`);
  }

  for (const partner of APPROVED_SPRITES) {
    const frames = readdirSync(join(ROOT, "page", "assets", "sprites", partner)).sort();
    assert.deepEqual(frames, ["0.png", "1.png", "5.png"], `${partner} must ship exactly its 3 used frames`);
  }
});

test("README, LICENSE, and NOTICE exist and point to the original Digital Pet", () => {
  for (const file of ["README.md", "LICENSE", "NOTICE"]) {
    assert.ok(existsSync(join(ROOT, file)), `${file} must exist`);
  }
  const readme = readFileSync(join(ROOT, "README.md"), "utf8");
  assert.ok(readme.includes(ORIGINAL_REPO_URL), "README must link to original Digital Pet repository");
  assert.match(readme, /600\+\s*宠物/);
  assert.match(readme, /超过\s*14\s*套像素场景/);
});

test("no shipped file claims the official community scope, and NOTICE credits the sprite license", () => {
  for (const file of ["package.json", "README.md", "NOTICE", "page/index.html", "page/app.js"]) {
    const content = readFileSync(join(ROOT, file), "utf8");
    assert.ok(!content.includes("magpie-community"), `${file} must not claim official community scope`);
  }
  const notice = readFileSync(join(ROOT, "NOTICE"), "utf8");
  assert.match(notice, /CC BY-NC 4\.0/, "NOTICE must credit the sprite license");
  assert.match(notice, /sundeth\/omnipet/, "NOTICE must credit the sprite source");
  assert.match(notice, /unofficial/i, "NOTICE must state the unofficial status");
});

if (failures > 0) {
  process.exit(1);
}
