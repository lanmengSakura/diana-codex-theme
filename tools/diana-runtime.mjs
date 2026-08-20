import path from "node:path";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import {
  applySkin,
  CdpSession,
  discoverApp,
  findTargets,
  findRunningPids,
  getAdapter,
  launchApp,
  readThemePackage,
  resolveThemeTarget,
  restoreSkin,
  verifyTheme,
  watchTheme,
} from "@codedrobe/core";

const args = process.argv.slice(2);
const command = args[0];
const execFileAsync = promisify(execFile);

// Recent Codex desktop builds can expose CDP on localhost/::1 even when the
// main process was launched with --remote-debugging-address=127.0.0.1.
// Codedrobe 0.6.1 probes the literal IPv4 address, so race both loopback forms
// for CDP discovery while leaving every non-CDP request untouched.
const nativeFetch = globalThis.fetch.bind(globalThis);
globalThis.fetch = async function dianaLoopbackCompatibleFetch(input, init) {
  const href = typeof input === "string"
    ? input
    : input instanceof URL
      ? input.href
      : input?.url;

  if (!href?.startsWith("http://127.0.0.1:") || !href.includes("/json/")) {
    return nativeFetch(input, init);
  }

  const localhostHref = href.replace("http://127.0.0.1:", "http://localhost:");
  try {
    return await Promise.any([
      nativeFetch(input, init),
      nativeFetch(localhostHref, init),
    ]);
  } catch (error) {
    throw error?.errors?.[0] ?? error;
  }
};

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function option(name) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : null;
}

function flag(name) {
  return args.includes(name);
}

async function quiesceCodexAppManager() {
  if (process.platform !== "win32") return null;

  const managerPath = path.join(
    process.env.LOCALAPPDATA ?? "",
    "Codex App Manager",
    "codex-app-manager.exe",
  );
  try {
    await fs.access(managerPath);
  } catch {
    return null;
  }

  const { stdout = "" } = await execFileAsync("tasklist.exe", [
    "/FI",
    "IMAGENAME eq codex-app-manager.exe",
    "/FO",
    "CSV",
    "/NH",
  ]).catch(() => ({ stdout: "" }));
  if (!stdout.toLowerCase().includes("codex-app-manager.exe")) return null;

  await execFileAsync("taskkill.exe", ["/F", "/IM", "codex-app-manager.exe"])
    .catch(() => {});
  await delay(500);
  return managerPath;
}

async function launchDianaHost({ adapter, port, timeoutMs = 30000 }) {
  // A third-party Codex App Manager can win Electron's single-instance race
  // and reopen Codex without the loopback CDP flag. Stop it only when it is
  // actually running and leave it stopped for the themed session. The old
  // implementation restarted it unconditionally, which kept an otherwise
  // unnecessary WebView2 tree resident (roughly 350 MB on the test machine).
  await quiesceCodexAppManager();
  return launchApp({
    adapter,
    port,
    restartExisting: true,
    timeoutMs,
  });
}

async function waitForServiceHost({ adapter, port, maintainHost }) {
  let recoveryAttempted = false;

  while (true) {
    try {
      const targets = await findTargets(adapter, port, 2500);
      if (targets.length) return;
    } catch {
      // Codex may not be running yet or may have been opened normally.
    }

    const discovered = await discoverApp(adapter, process.platform);
    const runningPids = discovered
      ? await findRunningPids(adapter, process.platform, discovered.executable)
      : [];

    if (!runningPids.length) {
      recoveryAttempted = false;
      await delay(4000);
      continue;
    }

    if (maintainHost && !recoveryAttempted) {
      recoveryAttempted = true;
      console.log(JSON.stringify({
        action: "service",
        type: "host-recovery",
        message: `Codex is running without CDP on port ${port}; performing one controlled relaunch.`,
        runningPids,
      }));
      try {
        await launchDianaHost({ adapter, port });
        return;
      } catch (error) {
        console.error(JSON.stringify({
          action: "service",
          type: "host-recovery-error",
          message: error?.message ?? String(error),
        }));
      }
    }

    // Never repeatedly bounce the same running app. A fully closed app resets
    // the attempt flag; the next user launch gets one fresh recovery.
    await delay(5000);
  }
}

const dianaRendererProfile = {
  id: "diana-codex-v1",
  runtime: function dianaRuntime() {
    const chromeId = "codedrobe-codex-skin-chrome";
    const railCurrentAttribute = "data-diana-viewport-current";
    const auxiliaryWindowClass = "diana-auxiliary-window";
    const surfaceClass = "diana-skin-surface";
    const foregroundClass = "diana-skin-foreground";
    const doodleLayerClass = "diana-doodle-layer";
    const cornerLineClass = "diana-corner-line";
    const characterStarsClass = "diana-character-stars";
    const characterAcaoClass = "diana-character-acao";
    let trackedScroller = null;
    let trackedNav = null;
    let railMutationObserver = null;
    let railResizeObserver = null;
    let railAnimationFrame = 0;

    function scheduleMessageRailSync() {
      if (railAnimationFrame) return;
      railAnimationFrame = requestAnimationFrame(() => {
        railAnimationFrame = 0;
        syncMessageRail();
      });
    }

    function syncMessageRail() {
      const scroller = trackedScroller;
      const nav = trackedNav;
      if (!scroller?.isConnected || !nav?.isConnected) return;

      const buttons = Array.from(
        nav.querySelectorAll("[data-thread-user-message-navigation-item-id]"),
      );
      const anchors = Array.from(
        scroller.querySelectorAll("[data-local-conversation-user-anchor=\"true\"]"),
      );
      if (!buttons.length || !anchors.length) return;

      const viewport = scroller.getBoundingClientRect();
      const readingLine = viewport.top + viewport.height * 0.5;
      let best = null;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (const anchor of anchors) {
        const rect = anchor.getBoundingClientRect();
        const turn = anchor.closest("[data-content-search-turn-key]");
        const key = turn?.getAttribute("data-content-search-turn-key");
        if (!key || rect.height <= 0) continue;

        const distance = readingLine < rect.top
          ? rect.top - readingLine
          : readingLine > rect.bottom
            ? readingLine - rect.bottom
            : 0;
        if (distance < bestDistance) {
          best = key;
          bestDistance = distance;
        }
      }

      const active = buttons.find((button) => {
        const id = button.getAttribute("data-thread-user-message-navigation-item-id");
        return id?.split(":", 1)[0] === best;
      });
      if (!active) return;

      for (const button of buttons) {
        if (button === active) button.setAttribute(railCurrentAttribute, "true");
        else button.removeAttribute(railCurrentAttribute);
      }
    }

    function stopMessageRailTracking() {
      if (railAnimationFrame) cancelAnimationFrame(railAnimationFrame);
      railAnimationFrame = 0;
      trackedScroller?.removeEventListener("scroll", scheduleMessageRailSync);
      window.removeEventListener("resize", scheduleMessageRailSync);
      railMutationObserver?.disconnect();
      railResizeObserver?.disconnect();
      trackedNav?.querySelectorAll(`[${railCurrentAttribute}]`).forEach((button) => {
        button.removeAttribute(railCurrentAttribute);
      });
      trackedScroller = null;
      trackedNav = null;
      railMutationObserver = null;
      railResizeObserver = null;
    }

    function ensureMessageRailTracking() {
      const scroller = document.querySelector(".thread-scroll-container");
      const nav = document.querySelector(
        'nav[aria-label="用户消息"], nav[aria-label="User messages"]',
      );
      if (!scroller || !nav) {
        if (trackedScroller || trackedNav) stopMessageRailTracking();
        return;
      }
      if (scroller === trackedScroller && nav === trackedNav) {
        syncMessageRail();
        scheduleMessageRailSync();
        return;
      }

      stopMessageRailTracking();
      trackedScroller = scroller;
      trackedNav = nav;
      trackedScroller.addEventListener("scroll", scheduleMessageRailSync, { passive: true });
      window.addEventListener("resize", scheduleMessageRailSync, { passive: true });
      railMutationObserver = new MutationObserver(scheduleMessageRailSync);
      railMutationObserver.observe(trackedScroller, { childList: true, subtree: true });
      railResizeObserver = new ResizeObserver(scheduleMessageRailSync);
      railResizeObserver.observe(trackedScroller);
      syncMessageRail();
      scheduleMessageRailSync();
    }

    function findSurface() {
      return document.querySelector("main.main-surface")
        ?? document.querySelector("aside.app-shell-left-panel ~ main")
        ?? document.querySelector("main");
    }

    function findWorkingPane(surface) {
      const surfaceRect = surface.getBoundingClientRect();
      const composer = surface.querySelector(
        "[role=\"textbox\"][contenteditable=\"true\"], textarea",
      );
      if (!composer) return surface;

      let pane = surface;
      let cursor = composer.parentElement;
      while (cursor && cursor !== surface) {
        const rect = cursor.getBoundingClientRect();
        const isFullHeight = rect.height >= surfaceRect.height * 0.75;
        const isNarrower = rect.width > 0 && rect.width < surfaceRect.width - 2;
        const sharesLeftEdge = Math.abs(rect.left - surfaceRect.left) <= 4;
        if (isFullHeight && isNarrower && sharesLeftEdge) pane = cursor;
        cursor = cursor.parentElement;
      }
      return pane;
    }

    function ensureDecorations(chrome) {
      let doodleLayer = chrome.querySelector(`.${doodleLayerClass}`);
      if (!doodleLayer) {
        doodleLayer = document.createElement("span");
        doodleLayer.className = doodleLayerClass;
        doodleLayer.setAttribute("aria-hidden", "true");
        chrome.append(doodleLayer);
      }

      let cornerLine = chrome.querySelector(`.${cornerLineClass}`);
      if (!cornerLine) {
        cornerLine = document.createElement("span");
        cornerLine.className = cornerLineClass;
        cornerLine.setAttribute("aria-hidden", "true");
        chrome.append(cornerLine);
      }

      let characterStars = chrome.querySelector(`.${characterStarsClass}`);
      if (!characterStars) {
        characterStars = document.createElement("span");
        characterStars.className = characterStarsClass;
        characterStars.setAttribute("aria-hidden", "true");
        chrome.append(characterStars);
      }
      for (const modifier of ["small", "large"]) {
        if (!characterStars.querySelector(`.diana-character-star-${modifier}`)) {
          const star = document.createElement("span");
          star.className = `diana-character-star diana-character-star-${modifier}`;
          characterStars.append(star);
        }
      }
      for (const modifier of ["wrapped", "lollipop"]) {
        if (!characterStars.querySelector(`.diana-character-candy-${modifier}`)) {
          const candy = document.createElement("span");
          candy.className = `diana-character-candy diana-character-candy-${modifier}`;
          characterStars.append(candy);
        }
      }
      for (const modifier of ["heart", "cheer"]) {
        if (!characterStars.querySelector(`.diana-character-acao-${modifier}`)) {
          const acao = document.createElement("span");
          acao.className = `${characterAcaoClass} diana-character-acao-${modifier}`;
          characterStars.append(acao);
        }
      }
      characterStars.querySelectorAll(
        ".diana-character-star, .diana-character-candy, .diana-character-acao",
      )
        .forEach((ornament) => {
          ornament.textContent = "";
        });
    }

    function ensure() {
      const root = document.documentElement;
      const surface = findSurface();
      if (!root || !surface || !document.body) return false;

      root.classList.add("codedrobe-codex-skin");
      const initialRoute = new URLSearchParams(window.location.search).get("initialRoute");
      const isAuxiliaryWindow = initialRoute === "/avatar-overlay";
      root.classList.toggle(auxiliaryWindowClass, isAuxiliaryWindow);
      let chrome = document.getElementById(chromeId);
      if (!chrome) {
        chrome = document.createElement("div");
        chrome.id = chromeId;
        chrome.setAttribute("aria-hidden", "true");
      }
      if (chrome.parentElement !== surface) surface.prepend(chrome);
      ensureDecorations(chrome);
      surface.classList.add(surfaceClass);

      if (isAuxiliaryWindow) {
        stopMessageRailTracking();
        return true;
      }

      const pane = findWorkingPane(surface);
      const foreground = Array.from(surface.children).find((child) => (
        child !== chrome
        && (child.contains(pane) || child.querySelector?.(".thread-scroll-container"))
      ));
      surface.querySelectorAll(`:scope > .${foregroundClass}`).forEach((child) => {
        if (child !== foreground) child.classList.remove(foregroundClass);
      });
      foreground?.classList.add(foregroundClass);

      const surfaceRect = surface.getBoundingClientRect();
      const rect = pane.getBoundingClientRect();
      chrome.style.left = `${Math.round(rect.left - surfaceRect.left)}px`;
      chrome.style.top = `${Math.round(rect.top - surfaceRect.top)}px`;
      chrome.style.width = `${Math.round(rect.width)}px`;
      chrome.style.height = `${Math.round(rect.height)}px`;

      const home = document.querySelector('[role="main"]:has([data-testid="home-icon"])');
      chrome.classList.toggle("dream-home-shell", Boolean(home));
      ensureMessageRailTracking();
      return true;
    }

    function cleanup() {
      stopMessageRailTracking();
      document.documentElement?.classList.remove("codedrobe-codex-skin", auxiliaryWindowClass);
      document.getElementById(chromeId)?.remove();
      document.querySelectorAll(`.${surfaceClass}`).forEach((surface) => {
        surface.classList.remove(surfaceClass);
      });
      document.querySelectorAll(`.${foregroundClass}`).forEach((foreground) => {
        foreground.classList.remove(foregroundClass);
      });
    }

    function verify() {
      const root = document.documentElement;
      const chrome = document.getElementById(chromeId);
      const missing = [];
      if (!root?.classList.contains("codedrobe-codex-skin")) {
        missing.push({ name: "diana-root-class", selectors: ["html.codedrobe-codex-skin"] });
      }
      if (!chrome) missing.push({ name: "diana-chrome", selectors: [`#${chromeId}`] });
      if (chrome && getComputedStyle(chrome).pointerEvents !== "none") {
        missing.push({ name: "noninteractive-chrome", selectors: [`#${chromeId} { pointer-events: none }`] });
      }
      if (chrome && !chrome.querySelector(`.${cornerLineClass}`)) {
        missing.push({ name: "diana-corner-line", selectors: [`.${cornerLineClass}`] });
      }
      if (chrome && !chrome.querySelector(`.${doodleLayerClass}`)) {
        missing.push({ name: "diana-doodle-layer", selectors: [`.${doodleLayerClass}`] });
      }
      if (chrome && chrome.querySelectorAll(`.${characterStarsClass} .diana-character-star`).length !== 2) {
        missing.push({ name: "diana-character-stars", selectors: [`.${characterStarsClass} .diana-character-star`] });
      }
      if (chrome && chrome.querySelectorAll(`.${characterStarsClass} .${characterAcaoClass}`).length !== 2) {
        missing.push({ name: "diana-character-acao", selectors: [`.${characterStarsClass} .${characterAcaoClass}`] });
      }
      if (chrome && chrome.querySelectorAll(`.${characterStarsClass} .diana-character-candy`).length !== 2) {
        missing.push({ name: "diana-character-candies", selectors: [`.${characterStarsClass} .diana-character-candy`] });
      }
      const messageRail = document.querySelector(
        'nav[aria-label="用户消息"], nav[aria-label="User messages"]',
      );
      if (messageRail && !messageRail.querySelector(`[${railCurrentAttribute}="true"]`)) {
        missing.push({
          name: "diana-message-rail-tracking",
          selectors: [`[${railCurrentAttribute}="true"]`],
        });
      }
      return {
        id: "diana-codex-v1",
        pass: missing.length === 0,
        missing,
        rootClassPresent: Boolean(root?.classList.contains("codedrobe-codex-skin")),
        chromePresent: Boolean(chrome),
      };
    }

    return { ensure, cleanup, verify };
  },
  cleanup: function dianaCleanup() {
    document.documentElement?.classList.remove("codedrobe-codex-skin", "diana-auxiliary-window");
    document.getElementById("codedrobe-codex-skin-chrome")?.remove();
    document.querySelectorAll(".diana-skin-surface").forEach((surface) => {
      surface.classList.remove("diana-skin-surface");
    });
    document.querySelectorAll(".diana-skin-foreground").forEach((foreground) => {
      foreground.classList.remove("diana-skin-foreground");
    });
    document.querySelectorAll("[data-diana-viewport-current]").forEach((button) => {
      button.removeAttribute("data-diana-viewport-current");
    });
  },
};

function dianaAdapter() {
  const base = getAdapter("codex");
  return {
    ...base,
    rendererProfiles: {
      ...(base.rendererProfiles ?? {}),
      [dianaRendererProfile.id]: dianaRendererProfile,
    },
    lastVerified: {
      ...(base.lastVerified ?? {}),
      win32: {
        appVersion: "26.814.5517.0",
        build: "26.814.5517.0",
        verifiedAt: "2026-08-20",
      },
    },
    verification: {
      rootAny: [
        "main.main-surface",
        "aside.app-shell-left-panel ~ main",
        "main.relative",
      ],
      recommended: [
        { name: "sidebar", any: ["aside.app-shell-left-panel"] },
        {
          name: "composer",
          any: [
            ".composer-surface-chrome",
            "[role=\"textbox\"][contenteditable=\"true\"]",
          ],
        },
      ],
    },
  };
}

async function loadTheme(filename, adapter) {
  if (!filename) throw new Error("Missing --theme <file.codedrobe-theme>.");
  const absolute = path.resolve(filename);
  const bundle = await readThemePackage(absolute);
  return { absolute, targetTheme: resolveThemeTarget(bundle, adapter.id) };
}

async function captureMainWindow(adapter, port, output) {
  const targets = await findTargets(adapter, port, 10000);
  const target = targets.find((item) => item.url === "app://-/index.html")
    ?? targets.find((item) => !String(item.url ?? "").includes("initialRoute"))
    ?? targets[0];
  if (!target) throw new Error("No Codex renderer is available for screenshot capture.");

  const session = await new CdpSession(target, 120000).open();
  try {
    const result = await session.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false,
    });
    const filename = path.resolve(output);
    await fs.mkdir(path.dirname(filename), { recursive: true });
    await fs.writeFile(filename, Buffer.from(result.data, "base64"));
    return filename;
  } finally {
    session.close();
  }
}

async function main() {
  const adapter = dianaAdapter();
  const port = Number(option("--port") ?? adapter.defaultPort);

  if (command === "restore") {
    console.log(JSON.stringify(await restoreSkin({ adapter, port }), null, 2));
    return;
  }

  const { absolute, targetTheme } = await loadTheme(option("--theme"), adapter);

  if (command === "verify") {
    const targets = await verifyTheme({ adapter, targetTheme, port, timeoutMs: 10000 });
    const screenshot = option("--screenshot");
    if (screenshot) {
      await captureMainWindow(adapter, port, screenshot);
    }
    console.log(JSON.stringify({ action: "verify", theme: absolute, targets, screenshot }, null, 2));
    return;
  }

  if (command !== "apply") {
    throw new Error("Usage: diana-runtime.mjs <apply|verify|restore> [options]");
  }

  const restartExisting = flag("--restart-existing");
  const serviceMode = flag("--service");
  const maintainHost = flag("--maintain-host");

  if (serviceMode) {
    await waitForServiceHost({ adapter, port, maintainHost });
  }

  const result = await applySkin({
    adapter,
    targetTheme,
    port,
    launch: serviceMode ? false : restartExisting,
    restartExisting: serviceMode ? false : restartExisting,
    timeoutMs: 30000,
  });
  console.log(JSON.stringify(result, null, 2));

  if (flag("--watch")) {
    console.log(`[diana] Watching Codex on loopback port ${port}.`);
    let consecutiveWaits = 0;
    let recoveryPromise = null;
    let recoveryAttemptedSinceInjection = false;

    async function recoverHostIfNeeded() {
      const discovered = await discoverApp(adapter, process.platform);
      if (!discovered) return;
      const runningPids = await findRunningPids(
        adapter,
        process.platform,
        discovered.executable,
      );
      if (!runningPids.length) {
        recoveryAttemptedSinceInjection = false;
        return;
      }
      if (recoveryAttemptedSinceInjection) return;
      recoveryAttemptedSinceInjection = true;

      console.log(JSON.stringify({
        action: "watch",
        type: "host-recovery",
        message: `Codex is running without CDP on port ${port}; restarting it once with the Diana runtime enabled.`,
        runningPids,
      }));
      await launchDianaHost({ adapter, port });
    }

    await watchTheme({
      adapter,
      targetTheme,
      port,
      onEvent(event) {
        console.log(JSON.stringify({ action: "watch", ...event }));
        if (event.type === "injected") {
          consecutiveWaits = 0;
          recoveryAttemptedSinceInjection = false;
          return;
        }
        if (event.type !== "waiting") return;
        consecutiveWaits += 1;
        if (!maintainHost || consecutiveWaits < 4 || recoveryPromise) return;

        recoveryPromise = recoverHostIfNeeded()
          .catch((error) => {
            console.error(JSON.stringify({
              action: "watch",
              type: "host-recovery-error",
              message: error?.message ?? String(error),
            }));
          })
          .finally(() => {
            consecutiveWaits = 0;
            recoveryPromise = null;
          });
      },
    });
  }
}

main().catch((error) => {
  console.error(error?.stack ?? error?.message ?? String(error));
  process.exitCode = 1;
});
