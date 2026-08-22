// Cyberdeck Launcher — the meta application / OS shell.
// Installs + launches WebAX apps, and builds a capability registry from their
// Cyberdeck Compatibility manifests.

import { parseWebAXManifest } from '../../jcule/dist/index.js';
import '../../jellicule/dist/index.js'; // registers jel-* components
import { MemoryCore } from '../../memory-core/dist/index.js';
import { CyberEyes } from '../../cyber-eyes/dist/index.js';

const log = new CyberEyes('launcher', 'main');
const root = document.getElementById('app');
const memory = new MemoryCore({ localStorage: window.localStorage });
const CYBERDECK_OS = 'http://127.0.0.1:16999';

const DEFAULT_APPS = [
  {
    id: 'pet-store',
    name: 'Pet Store',
    icon: '🐾',
    url: '/pet-store/app/index.html',
    description: 'Spec-driven WebAX demo app',
    provides: [{ intent: 'share', type: 'image', formats: ['image/*'] }],
    requires: [],
    services: [],
  },
];

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  for (const c of children) if (c) node.append(c);
  return node;
}

async function getApps() {
  const apps = await memory.useStore('localStorage').get('apps');
  return Array.isArray(apps) && apps.length ? apps : DEFAULT_APPS;
}

async function installApp(url, manifestUrl) {
  if (!url) return;
  const apps = await getApps();
  const app = { id: 'app-' + Date.now(), name: url, icon: '📦', url, provides: [], requires: [], services: [] };
  if (manifestUrl) {
    try {
      const manifest = await fetch(manifestUrl).then((r) => r.json());
      const w = parseWebAXManifest(manifest);
      app.id = w.packageId || app.id;
      app.name = w.name || w.packageId || url;
      app.provides = w.provides;
      app.requires = w.requires;
      app.services = w.services;
      app.provisionedServices = await provisionServices(app.id, w.services);
      log.info({ message: 'installed from manifest', packageId: w.packageId });
    } catch (err) {
      log.error({ message: 'manifest fetch failed', error: String(err) });
    }
  }
  apps.push(app);
  await memory.useStore('localStorage').set('apps', apps);
  render();
}

/** Provision the docker services an app declares (via CyberdeckOS). */
async function provisionServices(appId, services) {
  const provisioned = [];
  for (const s of services ?? []) {
    try {
      const res = await fetch(`${CYBERDECK_OS}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, service: s }),
      });
      if (res.ok) {
        const data = await res.json();
        provisioned.push({ type: s.type, hostPort: data.service?.hostPort });
        log.info({ message: 'service provisioned', service: s.type, hostPort: data.service?.hostPort });
      } else {
        log.warn({ message: 'service provision failed', service: s.type, status: res.status });
      }
    } catch (err) {
      log.warn({ message: 'CyberdeckOS unreachable', error: String(err) });
    }
  }
  return provisioned;
}

function capabilityRegistry(apps) {
  const registry = {};
  for (const app of apps) {
    for (const capability of app.provides ?? []) {
      const key = capability.intent + (capability.type ? ':' + capability.type : '');
      (registry[key] ??= []).push(app.name);
    }
  }
  return registry;
}

function launch(app) {
  const overlay = el('div', { style: 'position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;flex-direction:column;z-index:1000;' });
  const bar = el('div', { style: 'display:flex;align-items:center;justify-content:space-between;padding:.5rem 1rem;background:#12161c;color:#fff;' });
  const title = el('span', {}, `${app.icon} ${app.name}`);
  const close = el('jel-button', { variant: 'ghost' }, '✕ Close');
  close.addEventListener('jel-click', () => overlay.remove());
  bar.append(title, close);
  const frame = document.createElement('iframe');
  frame.src = app.url;
  frame.style.cssText = 'flex:1;width:100%;border:0;background:#fff;';
  overlay.append(bar, frame);
  document.body.appendChild(overlay);
  log.info({ message: 'launched', app: app.name });
}

async function render() {
  const apps = await getApps();
  root.replaceChildren();

  root.append(el('h1', { reveal: '' }, '🖥️ Cyberdeck Launcher'));

  // Install form
  const form = el('div', { style: 'display:flex;gap:.5rem;margin-bottom:1.25rem;flex-wrap:wrap;' });
  const urlInput = document.createElement('jel-input');
  urlInput.setAttribute('name', 'url');
  urlInput.setAttribute('placeholder', 'App URL (e.g. /pet-store/app/index.html)');
  urlInput.style.flex = '1 1 260px';
  const manifestInput = document.createElement('jel-input');
  manifestInput.setAttribute('name', 'manifest');
  manifestInput.setAttribute('placeholder', 'Manifest URL (optional)');
  manifestInput.style.flex = '1 1 260px';
  const addBtn = el('jel-button', { variant: 'primary' }, 'Install');
  addBtn.addEventListener('jel-click', () => installApp(urlInput.value, manifestInput.value));
  form.append(urlInput, manifestInput, addBtn);
  root.append(form);

  // App grid
  const grid = el('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:1rem;' });
  for (const app of apps) {
    const card = document.createElement('jel-card');
    card.setAttribute('title', `${app.icon} ${app.name}`);
    card.setAttribute('reveal', '');
    card.append(el('p', {}, app.description ?? ''));
    if (app.provisionedServices?.length) {
      card.append(el('p', {}, 'Services: ' + app.provisionedServices.map((s) => `${s.type}:${s.hostPort}`).join(', ')));
    }
    const launchBtn = el('jel-button', { variant: 'primary', slot: 'footer' }, 'Launch');
    launchBtn.addEventListener('jel-click', () => launch(app));
    card.append(launchBtn);
    grid.append(card);
  }
  root.append(grid);

  // Capability registry
  const registry = capabilityRegistry(apps);
  if (Object.keys(registry).length) {
    root.append(el('h2', {}, 'Capabilities (Cyberdeck Compatibility)'));
    const list = document.createElement('jel-list');
    for (const [key, names] of Object.entries(registry)) {
      const li = document.createElement('li');
      li.textContent = `${key} ← ${names.join(', ')}`;
      list.append(li);
    }
    root.append(list);
  }
}

render();
