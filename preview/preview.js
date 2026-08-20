const root = document.documentElement;
const themeButtons = [...document.querySelectorAll('.theme-button')];
const sceneSelect = document.querySelector('#scene-select');
const timeline = document.querySelector('#timeline');
const playToggle = document.querySelector('.play-toggle');
const controlsClose = document.querySelector('.controls-close');
const controlsOpen = document.querySelector('.controls-open');
const footerThemeName = document.querySelector('.footer-theme-name');
const railButtons = [...document.querySelectorAll('.message-rail button')];
const panelToggle = document.querySelector('.panel-toggle');
const sidebarTasks = [...document.querySelectorAll('.sidebar-section .task')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const sceneProgress = { compose: 0.12, inspect: 0.58, complete: 0.94 };
const sceneOrder = ['compose', 'inspect', 'complete'];
const themeNames = { dark: 'Diana Night', light: 'Diana Day' };
let progress = sceneProgress.complete;
let playing = false;
let frameId = 0;
let lastFrame = 0;

const clamp = (value, minimum = 0, maximum = 1) => Math.min(maximum, Math.max(minimum, value));
const segment = (value, start, end) => clamp((value - start) / (end - start));

function setReveal(selector, opacity, offset = 16) {
  document.querySelectorAll(selector).forEach((element) => {
    element.style.opacity = String(opacity);
    const y = (1 - opacity) * offset;
    element.style.transform = element.classList.contains('change-toast')
      ? `translate(-50%, ${y}px)`
      : `translateY(${y}px)`;
  });
}

function updateRail(value) {
  const current = Math.min(railButtons.length - 1, Math.floor(value * railButtons.length));
  railButtons.forEach((button, index) => button.classList.toggle('rail-current', index === current));
}

function renderTimeline(value) {
  progress = clamp(value);
  timeline.value = String(Math.round(progress * 1000));
  root.style.setProperty('--demo-progress', progress.toFixed(3));
  root.style.setProperty('--skin-enter', (0.72 + segment(progress, 0.02, 0.22) * 0.28).toFixed(3));
  setReveal('.reveal-user', segment(progress, 0.03, 0.14), 10);
  setReveal('.reveal-answer', segment(progress, 0.20, 0.38), 18);
  setReveal('.reveal-tool', segment(progress, 0.46, 0.62), 14);
  setReveal('.reveal-complete', segment(progress, 0.72, 0.88), 12);
  updateRail(progress);
}

function scaleStage() {
  const scale = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
  root.style.setProperty('--stage-scale', scale.toFixed(6));
}

function setTheme(theme) {
  if (!(theme in themeNames)) return;
  root.dataset.theme = theme;
  footerThemeName.textContent = themeNames[theme];
  themeButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.themeValue === theme));
}

function setScene(scene) {
  if (!(scene in sceneProgress)) return;
  root.dataset.scene = scene;
  sceneSelect.value = scene;
  renderTimeline(sceneProgress[scene]);
}

function setPlaying(nextPlaying) {
  playing = !reducedMotion && nextPlaying;
  playToggle.textContent = playing ? 'Ⅱ' : '▷';
  playToggle.setAttribute('aria-label', playing ? '暂停演示' : '播放演示');
  if (!playing) {
    cancelAnimationFrame(frameId);
    lastFrame = 0;
    return;
  }
  frameId = requestAnimationFrame(tick);
}

function tick(timestamp) {
  if (!playing) return;
  if (!lastFrame) lastFrame = timestamp;
  const delta = (timestamp - lastFrame) / 9000;
  lastFrame = timestamp;
  renderTimeline((progress + delta) % 1);
  frameId = requestAnimationFrame(tick);
}

function moveScene(direction) {
  const current = sceneOrder.indexOf(root.dataset.scene);
  const next = Math.min(sceneOrder.length - 1, Math.max(0, current + direction));
  setScene(sceneOrder[next]);
}

const params = new URLSearchParams(window.location.search);
setTheme(params.get('theme') || root.dataset.theme);
root.dataset.controls = ['off', 'none'].includes(params.get('controls')) ? params.get('controls') : 'on';
setScene(params.get('scene') || root.dataset.scene);
if (params.has('time')) renderTimeline(Number(params.get('time')));
setPlaying(params.get('play') === '1');

themeButtons.forEach((button) => button.addEventListener('click', () => setTheme(button.dataset.themeValue)));
sceneSelect.addEventListener('change', (event) => setScene(event.target.value));
timeline.addEventListener('input', (event) => {
  setPlaying(false);
  renderTimeline(Number(event.target.value) / 1000);
});
playToggle.addEventListener('click', () => setPlaying(!playing));
controlsClose.addEventListener('click', () => { root.dataset.controls = 'off'; });
controlsOpen.addEventListener('click', () => { root.dataset.controls = 'on'; });
panelToggle.addEventListener('click', () => {
  const isOpen = panelToggle.getAttribute('aria-pressed') === 'true';
  panelToggle.setAttribute('aria-pressed', String(!isOpen));
  panelToggle.classList.toggle('is-on', !isOpen);
  root.dataset.inspector = isOpen ? 'closed' : 'open';
});
sidebarTasks.forEach((task) => task.addEventListener('click', () => {
  sidebarTasks.forEach((item) => item.classList.toggle('active', item === task));
}));
window.addEventListener('resize', scaleStage);
document.addEventListener('keydown', (event) => {
  if (event.key === ' ') {
    event.preventDefault();
    setPlaying(!playing);
  }
  if (event.key === 'ArrowRight') moveScene(1);
  if (event.key === 'ArrowLeft') moveScene(-1);
  if (event.key.toLowerCase() === 'd') setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

const showcaseAssets = [
  '../assets/diana-brand/derived/diana-line-art-approved-upper.png',
  '../assets/diana-brand/derived/diana-doodle-chalk-v2-approved.png',
  '../assets/diana-brand/derived/diana-left-top-detailed-corner-mask-v7.png',
  '../assets/diana-brand/derived/diana-night-v3.png',
  '../assets/diana-brand/derived/diana-corner-cutout-v2.png',
  '../assets/diana-brand/derived/diana-hand-star-reference-v2.png',
  '../assets/diana-brand/derived/diana-candy-wrapped-v1.png',
  '../assets/diana-brand/derived/diana-candy-lollipop-v1.png',
  '../assets/diana-brand/derived/acao-heart-v3.png',
  '../assets/diana-brand/derived/acao-cheer-v1.png'
];

function preloadAsset(source) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = resolve;
    image.onerror = resolve;
    image.src = source;
  });
}

scaleStage();
Promise.all(showcaseAssets.map(preloadAsset)).then(() => {
  requestAnimationFrame(() => { document.body.dataset.previewReady = 'true'; });
});
