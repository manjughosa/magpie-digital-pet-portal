# Digital Pet Portal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished, independent, pure-page magpie plugin that showcases and links to the existing Digital Pet plugin.

**Architecture:** A dependency-free static page lives under `page/`; root `package.json` declares only `magpie.page`. Contract tests inspect the manifest and HTML, while real browser checks cover rendering and interaction. The portal never starts a service or touches pet data.

**Tech Stack:** Bun tests, semantic HTML, CSS, vanilla JavaScript, local PNG/WebP assets.

**Spec:** `docs/superpowers/specs/2026-11-03-digital-pet-portal-design.md`

## Global Constraints

- Package/repository name: `magpie-digital-pet-portal`.
- Exact copy: `600+ 宠物` and `超过 14 套像素场景`.
- All acquisition CTAs link to `https://github.com/manjughosa/magpie-digital-pet`.
- No `main`, `exports`, middleware, agent, hooks, service, engine dependency, runtime dependency, or pet database access.
- Do not modify the existing Digital Pet plugin.
- No git commit, push, remote repository creation, or publication.

## Review Focus

- Manifest shape could silently reintroduce the provider fallback; Task 1 tests the exact forbidden fields and derives `kind: page` using magpie's rule.
- A moved or missing screenshot could make the polished page collapse; Task 2 tests every local `src`/`href` asset reference.
- External navigation could accidentally point to the portal itself; Task 2 tests every acquisition CTA destination.
- Narrow sandbox iframes could overflow; Task 3 checks desktop and mobile widths in a real browser.
- Decorative motion could ignore user preferences; Task 2 tests a `prefers-reduced-motion` rule and Task 3 verifies it in Chromium.

---

### Task 1: Pure-page package contract

**Files:**
- Create: `package.json`
- Create: `page/index.html`
- Create: `tests/portal-contract.test.mjs`

**Interfaces:**
- Produces: root manifest with `magpie.page.file === "page/index.html"` and no executable entry; static page shell for later tasks.

- [ ] **Step 1: Write the failing manifest test**

Assert the package name, `magpie.page.file`, absence of `main`/`exports`/middleware/agent/hooks/service, absence of dependencies, and derived `kind === "page"` using magpie's `main`/`exports` guard.

- [ ] **Step 2: Run the test and verify RED**

Run: `bun tests/portal-contract.test.mjs`
Expected: failure because `package.json` does not exist.

- [ ] **Step 3: Add the minimal package and page shell**

Create the named package, `magpie.page` metadata, local page icon, and a semantic HTML shell. Do not add an executable entry.

- [ ] **Step 4: Run the test and verify GREEN**

Run: `bun tests/portal-contract.test.mjs`
Expected: all manifest assertions pass.

### Task 2: Finished visual page and content contract

**Files:**
- Create: `page/app.css`
- Create: `page/app.js`
- Create: `page/assets/*`
- Create: `page/cover.png`
- Create: `README.md`
- Create: `LICENSE`
- Create: `NOTICE`
- Modify: `page/index.html`
- Modify: `tests/portal-contract.test.mjs`

**Interfaces:**
- Consumes: the pure-page shell from Task 1.
- Produces: complete dark pixel showcase, local visual assets, in-page navigation, accessible external links, and redistribution notices.

- [ ] **Step 1: Extend the tests and verify RED**

Assert exact `600+ 宠物` and `超过 14 套像素场景` copy, the original Digital Pet URL on every `[data-pet-link]`, existing local assets, `target="_blank"` plus `rel="noopener noreferrer"`, reduced-motion CSS, and required showcase/scene/gameplay/privacy sections.

- [ ] **Step 2: Capture and collect real visual assets**

Capture the existing pet interface without changing its database; copy selected backgrounds, sprite frames, cover art, and their attribution. Optimize screenshots without editing what the interface shows.

- [ ] **Step 3: Implement the approved dark showcase**

Build the hero interface window, scene gallery, gameplay and privacy sections, final portal-disclaimer CTA, responsive layout, keyboard focus, and reduced-motion behavior. Keep JavaScript limited to navigation/gallery enhancement; content remains readable without it.

- [ ] **Step 4: Run the contract tests and verify GREEN**

Run: `bun tests/portal-contract.test.mjs`
Expected: all manifest, content, link, asset, and accessibility-contract assertions pass.

### Task 3: Real-browser verification and visual review

**Files:**
- Create: `tests/static-server.mjs` only if an external static server is unavailable
- Modify: `page/app.css`, `page/app.js`, or `page/index.html` only for observed browser failures

**Interfaces:**
- Consumes: the complete static page from Task 2.
- Produces: reproducible HTTP preview and recorded desktop/mobile verification evidence.

- [ ] **Step 1: Serve the exact package page over localhost**

Use an ephemeral loopback static server with no API and no database. Record the URL and HTTP status.

- [ ] **Step 2: Verify desktop behavior**

Open the page in Chromium; assert no console errors, all images load, every in-page anchor has a target, acquisition links have the original repository URL, and `document.documentElement.scrollWidth <= innerWidth`.

- [ ] **Step 3: Verify narrow-screen and reduced-motion behavior**

Repeat layout checks at mobile width and with reduced motion enabled. Inspect navigation and CTA visibility.

- [ ] **Step 4: Review screenshots and fix only observed issues**

Capture desktop and mobile screenshots. Check clipping, illegible text, stretched pixel art, empty assets, and visual hierarchy; rerun the full contract test and browser checks after any fix.

- [ ] **Step 5: Run final verification**

Run: `bun tests/portal-contract.test.mjs` and repeat the real-browser checks.
Expected: tests pass, HTTP 200, no console/page errors, no missing assets, no horizontal overflow, and all CTA destinations correct. Report remote publication as not performed.
