import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const endpoint = process.argv[2] || 'http://127.0.0.1:9227';
const previewDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(previewDir, 'qa');
const previewUrl = pathToFileURL(path.join(previewDir, 'index.html')).href;

const cases = [
  { name: 'readme-dark-1600x900', width: 1600, height: 900, query: 'theme=dark&scene=complete&controls=none' },
  { name: 'readme-light-1600x900', width: 1600, height: 900, query: 'theme=light&scene=complete&controls=none' },
  { name: 'promo-dark-1920x1080', width: 1920, height: 1080, query: 'theme=dark&scene=inspect&controls=none' },
  { name: 'promo-light-1920x1080', width: 1920, height: 1080, query: 'theme=light&scene=inspect&controls=none' },
  { name: 'video-night-1920x1080', width: 1920, height: 1080, query: 'video=1&videoTime=8.6&controls=none' },
  { name: 'video-day-1920x1080', width: 1920, height: 1080, query: 'video=1&videoTime=18.5&controls=none' },
  { name: 'video-end-1920x1080', width: 1920, height: 1080, query: 'video=1&videoTime=28&controls=none' },
  { name: 'preview-mobile-375x812', width: 375, height: 812, query: 'theme=dark&scene=complete&controls=none' }
];

const pages = await fetch(`${endpoint}/json/list`).then((response) => response.json());
const page = pages.find((target) => target.type === 'page');
if (!page) throw new Error('No Chrome debugging page is available.');

const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

let requestId = 0;
const pending = new Map();
const runtimeErrors = [];

socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
    return;
  }
  if (message.method === 'Runtime.exceptionThrown') {
    runtimeErrors.push(message.params.exceptionDetails.text);
  }
  if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
    runtimeErrors.push(`console.${message.params.type}`);
  }
});

function send(method, params = {}) {
  const id = ++requestId;
  socket.send(JSON.stringify({ id, method, params }));
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }));
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const state = await send('Runtime.evaluate', {
      expression: "document.body?.dataset.previewReady === 'true' && [...document.images].every((image) => image.complete)",
      returnByValue: true
    });
    if (state.result.value === true) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Preview did not become ready.');
}

await send('Runtime.enable');
await send('Page.enable');

for (const testCase of cases) {
  runtimeErrors.length = 0;
  await send('Emulation.setDeviceMetricsOverride', {
    width: testCase.width,
    height: testCase.height,
    deviceScaleFactor: 1,
    mobile: testCase.width < 500
  });
  await send('Page.navigate', { url: `${previewUrl}?${testCase.query}` });
  await waitUntilReady();
  await new Promise((resolve) => setTimeout(resolve, 250));

  const metrics = await send('Runtime.evaluate', {
    expression: `(() => {
      const stage = document.querySelector('.stage').getBoundingClientRect();
      return {
        width: innerWidth,
        height: innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        stage: { left: stage.left, top: stage.top, width: stage.width, height: stage.height }
      };
    })()`,
    returnByValue: true
  });
  const { width, height, scrollWidth, scrollHeight, stage } = metrics.result.value;
  if (width !== testCase.width || height !== testCase.height) {
    throw new Error(`${testCase.name}: unexpected viewport ${width}x${height}.`);
  }
  if (scrollWidth > width) {
    throw new Error(`${testCase.name}: horizontal overflow ${scrollWidth}px > ${width}px.`);
  }
  if (scrollHeight > height) {
    throw new Error(`${testCase.name}: vertical overflow ${scrollHeight}px > ${height}px.`);
  }
  if (testCase.width / testCase.height === 16 / 9) {
    const tolerance = .75;
    if (Math.abs(stage.left) > tolerance || Math.abs(stage.top) > tolerance ||
        Math.abs(stage.width - width) > tolerance || Math.abs(stage.height - height) > tolerance) {
      throw new Error(`${testCase.name}: stage does not fill the 16:9 viewport: ${JSON.stringify(stage)}.`);
    }
  }
  if (runtimeErrors.length) {
    throw new Error(`${testCase.name}: ${runtimeErrors.join(', ')}`);
  }

  const screenshot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true });
  await writeFile(path.join(outputDir, `${testCase.name}.png`), Buffer.from(screenshot.data, 'base64'));
  console.log(`${testCase.name}: ${width}x${height}, stage ${stage.width.toFixed(1)}x${stage.height.toFixed(1)}, no overflow, no console issues`);
}

await send('Emulation.setDeviceMetricsOverride', {
  width: 1280,
  height: 720,
  deviceScaleFactor: 1,
  mobile: false
});
await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
});
await send('Page.navigate', { url: `${previewUrl}?theme=dark&scene=complete&controls=on` });
await waitUntilReady();

const interactiveCheck = await send('Runtime.evaluate', {
  expression: `(async () => {
    const root = document.documentElement;
    document.querySelector('[data-theme-value="light"]').click();
    const lightAsset = getComputedStyle(document.querySelector('.skin-character')).backgroundImage;
    const lightTheme = root.dataset.theme === 'light' && lightAsset.includes('diana-corner-cutout-v2.png');
    document.querySelector('#scene-select').value = 'inspect';
    document.querySelector('#scene-select').dispatchEvent(new Event('change', { bubbles: true }));
    const scene = root.dataset.scene === 'inspect' && document.querySelector('#timeline').value === '580';
    const before = Number(document.querySelector('#timeline').value);
    document.querySelector('.play-toggle').click();
    await new Promise((resolve) => setTimeout(resolve, 140));
    document.querySelector('.play-toggle').click();
    const playback = Number(document.querySelector('#timeline').value) > before;
    document.querySelector('.panel-toggle').click();
    const panel = root.dataset.inspector === 'closed' && document.querySelector('.panel-toggle').getAttribute('aria-pressed') === 'false';
    const nextTask = [...document.querySelectorAll('.sidebar-section .task')].find((item) => !item.classList.contains('active'));
    nextTask.click();
    const taskSelection = nextTask.classList.contains('active') && document.querySelectorAll('.sidebar-section .task.active').length === 1;
    document.querySelector('.controls-close').click();
    const controls = root.dataset.controls === 'off';
    return { lightTheme, scene, playback, panel, taskSelection, controls };
  })()`,
  awaitPromise: true,
  returnByValue: true
});
const interactive = interactiveCheck.result.value;
if (Object.values(interactive).some((value) => value !== true)) {
  throw new Error(`Interactive showcase check failed: ${JSON.stringify(interactive)}.`);
}
console.log('interactive controls: theme, scene, playback, inspector, task selection, and control hiding passed');

socket.close();
