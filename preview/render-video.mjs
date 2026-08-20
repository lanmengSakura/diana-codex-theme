import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const previewDir = path.dirname(fileURLToPath(import.meta.url));
const projectDir = path.dirname(previewDir);
const endpoint = process.argv[2] || 'http://127.0.0.1:9227';
const outputPath = path.resolve(process.argv[3] || path.join(projectDir, 'dist', 'diana-codex-theme-demo-v2-visual.mp4'));
const coverPath = path.join(path.dirname(outputPath), 'diana-codex-theme-demo-v2-cover.png');
const fps = 30;
const duration = 45;
const totalFrames = fps * duration;
const previewUrl = `${pathToFileURL(path.join(previewDir, 'index.html')).href}?video=1&controls=none`;

await mkdir(path.dirname(outputPath), { recursive: true });

const pages = await fetch(`${endpoint}/json/list`).then((response) => response.json());
const page = pages.find((target) => target.type === 'page');
if (!page) throw new Error('No Chrome debugging page is available on the requested endpoint.');

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
  if (message.method === 'Runtime.exceptionThrown') runtimeErrors.push(message.params.exceptionDetails.text);
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
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const state = await send('Runtime.evaluate', {
      expression: "document.body?.dataset.previewReady === 'true' && Boolean(window.__dianaVideo)",
      returnByValue: true
    });
    if (state.result.value === true) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Video preview did not become ready.');
}

function writeFrame(stream, buffer) {
  if (stream.write(buffer)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const onDrain = () => {
      stream.off('error', onError);
      resolve();
    };
    const onError = (error) => {
      stream.off('drain', onDrain);
      reject(error);
    };
    stream.once('drain', onDrain);
    stream.once('error', onError);
  });
}

await send('Runtime.enable');
await send('Page.enable');
await send('Emulation.setDeviceMetricsOverride', {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  mobile: false
});
await send('Emulation.setEmulatedMedia', {
  features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }]
});
await send('Page.navigate', { url: previewUrl });
await waitUntilReady();

const metrics = await send('Runtime.evaluate', {
  expression: `(() => {
    const stage = document.querySelector('.stage').getBoundingClientRect();
    return {
      viewport: [innerWidth, innerHeight],
      stage: [stage.left, stage.top, stage.width, stage.height],
      overflow: [document.documentElement.scrollWidth, document.documentElement.scrollHeight]
    };
  })()`,
  returnByValue: true
});
const { viewport, stage, overflow } = metrics.result.value;
if (viewport[0] !== 1920 || viewport[1] !== 1080 || stage.some((value, index) => Math.abs(value - [0, 0, 1920, 1080][index]) > .75)) {
  throw new Error(`Unexpected video canvas metrics: ${JSON.stringify(metrics.result.value)}`);
}
if (overflow[0] > 1920 || overflow[1] > 1080) throw new Error(`Video page overflow: ${overflow.join('x')}`);

const encoder = spawn('ffmpeg', [
  '-y',
  '-hide_banner',
  '-loglevel', 'warning',
  '-f', 'image2pipe',
  '-framerate', String(fps),
  '-vcodec', 'mjpeg',
  '-i', 'pipe:0',
  '-an',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '17',
  '-vf', 'scale=in_range=full:out_range=tv,format=yuv420p',
  '-color_range', 'tv',
  '-movflags', '+faststart',
  '-r', String(fps),
  outputPath
], { stdio: ['pipe', 'inherit', 'inherit'] });

const encoderDone = new Promise((resolve, reject) => {
  encoder.once('error', reject);
  encoder.once('exit', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)));
});

for (let frame = 0; frame < totalFrames; frame += 1) {
  const time = frame / fps;
  await send('Runtime.evaluate', {
    expression: `window.__dianaVideo.render(${time.toFixed(6)})`,
    returnByValue: true
  });
  const screenshot = await send('Page.captureScreenshot', {
    format: 'jpeg',
    quality: 94,
    fromSurface: true,
    captureBeyondViewport: false
  });
  await writeFrame(encoder.stdin, Buffer.from(screenshot.data, 'base64'));
  if ((frame + 1) % (fps * 3) === 0) {
    process.stdout.write(`Rendered ${String((frame + 1) / fps).padStart(2, '0')} / ${duration}s\n`);
  }
}
encoder.stdin.end();
await encoderDone;

await send('Runtime.evaluate', { expression: 'window.__dianaVideo.render(1.45)', returnByValue: true });
const cover = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: false });
await writeFile(coverPath, Buffer.from(cover.data, 'base64'));

if (runtimeErrors.length) throw new Error(`Video page console issues: ${runtimeErrors.join(', ')}`);
socket.close();

console.log(JSON.stringify({
  status: 'rendered',
  outputPath,
  coverPath,
  width: 1920,
  height: 1080,
  fps,
  duration
}, null, 2));
