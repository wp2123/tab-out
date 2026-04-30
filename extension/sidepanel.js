'use strict';

/* ----------------------------------------------------------------
   CHROME TABS
   ---------------------------------------------------------------- */

let openTabs = [];

async function fetchOpenTabs() {
  try {
    const extensionId = chrome.runtime.id;
    const newtabUrl   = `chrome-extension://${extensionId}/index.html`;
    const tabs        = await chrome.tabs.query({});
    openTabs = tabs.map(t => ({
      id:       t.id,
      url:      t.url,
      title:    t.title,
      windowId: t.windowId,
      active:   t.active,
      isTabOut: t.url === newtabUrl || t.url === 'chrome://newtab/',
    }));
  } catch {
    openTabs = [];
  }
}

function getRealTabs() {
  return openTabs.filter(t => {
    const url = t.url || '';
    return (
      !url.startsWith('chrome://') &&
      !url.startsWith('chrome-extension://') &&
      !url.startsWith('about:') &&
      !url.startsWith('edge://') &&
      !url.startsWith('brave://')
    );
  });
}

async function focusTab(url) {
  if (!url) return;
  const allTabs = await chrome.tabs.query({});
  let matches = allTabs.filter(t => t.url === url);
  if (matches.length === 0) {
    try {
      const targetHost = new URL(url).hostname;
      matches = allTabs.filter(t => {
        try { return new URL(t.url).hostname === targetHost; }
        catch { return false; }
      });
    } catch {}
  }
  if (matches.length === 0) return;
  const match = matches[0];
  await chrome.tabs.update(match.id, { active: true });
  await chrome.windows.update(match.windowId, { focused: true });
}

async function closeTabById(tabId) {
  await chrome.tabs.remove(tabId);
  await fetchOpenTabs();
}

async function saveTabForLater(tab) {
  const { deferred = [] } = await chrome.storage.local.get('deferred');
  deferred.push({
    id:        Date.now().toString(),
    url:       tab.url,
    title:     tab.title,
    savedAt:   new Date().toISOString(),
    completed: false,
    dismissed: false,
  });
  await chrome.storage.local.set({ deferred });
}

async function getWindowNames() {
  const { windowNames = {} } = await chrome.storage.local.get('windowNames');
  return windowNames;
}


/* ----------------------------------------------------------------
   UI HELPERS
   ---------------------------------------------------------------- */

function showToast(message) {
  const toast  = document.getElementById('toast');
  const textEl = document.getElementById('toastText');
  if (!toast || !textEl) return;
  textEl.textContent = message;
  toast.classList.add('visible');
  setTimeout(() => toast.classList.remove('visible'), 2500);
}

function playCloseSound() {
  try {
    const ctx      = new (window.AudioContext || window.webkitAudioContext)();
    const t        = ctx.currentTime;
    const duration = 0.25;
    const buffer   = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data     = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const envelope = Math.exp(-i / (ctx.sampleRate * 0.08));
      data[i] = (Math.random() * 2 - 1) * envelope;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(200, t + duration);
    filter.Q.value = 0.8;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(t);
    source.stop(t + duration);
  } catch {}
}


/* ----------------------------------------------------------------
   TITLE HELPERS (复用自 app.js)
   ---------------------------------------------------------------- */

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function stripTitleNoise(title) {
  if (!title) return '';
  title = title.replace(/^\(\d+\+?\)\s*/, '');
  title = title.replace(/\s*\([\d,]+\+?\)\s*/g, ' ');
  title = title.replace(/\s*[\-‐-―]\s*[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '');
  title = title.replace(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, '');
  title = title.replace(/\s+on X:\s*/, ': ');
  title = title.replace(/\s*\/\s*X\s*$/, '');
  return title.trim();
}

function cleanTitle(title, hostname) {
  if (!title || !hostname) return title || '';
  const domain = hostname.replace(/^www\./, '');
  const seps   = [' - ', ' | ', ' — ', ' · ', ' – '];
  for (const sep of seps) {
    const idx = title.lastIndexOf(sep);
    if (idx === -1) continue;
    const suffix    = title.slice(idx + sep.length).trim().toLowerCase();
    const domLow    = domain.toLowerCase();
    if (domLow.includes(suffix) || suffix.includes(domLow)) {
      const cleaned = title.slice(0, idx).trim();
      if (cleaned.length >= 5) return cleaned;
    }
  }
  return title;
}

function smartTitle(title, url) {
  if (!url) return title || '';
  let pathname = '', hostname = '';
  try { const u = new URL(url); pathname = u.pathname; hostname = u.hostname; }
  catch { return title || ''; }
  const titleIsUrl = !title || title === url || title.startsWith(hostname) || title.startsWith('http');
  if ((hostname === 'x.com' || hostname === 'twitter.com') && pathname.includes('/status/')) {
    const username = pathname.split('/')[1];
    if (username) return titleIsUrl ? `Post by @${username}` : title;
  }
  if (hostname === 'github.com') {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const [owner, repo, ...rest] = parts;
      if (rest[0] === 'issues' && rest[1]) return `${owner}/${repo} Issue #${rest[1]}`;
      if (rest[0] === 'pull'   && rest[1]) return `${owner}/${repo} PR #${rest[1]}`;
      if (titleIsUrl) return `${owner}/${repo}`;
    }
  }
  return title || url;
}


/* ----------------------------------------------------------------
   CURRENT WINDOW DATA
   ---------------------------------------------------------------- */

async function getCurrentWindowData() {
  await fetchOpenTabs();
  const [currentWindow, windowNames] = await Promise.all([
    chrome.windows.getCurrent(),
    getWindowNames(),
  ]);
  const tabs = getRealTabs().filter(t => t.windowId === currentWindow.id);
  return {
    windowId:   currentWindow.id,
    customName: windowNames[String(currentWindow.id)] || null,
    tabs,
  };
}


/* ----------------------------------------------------------------
   RENDER
   ---------------------------------------------------------------- */

const SAVE_ICON  = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>`;
const CLOSE_ICON = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>`;

function renderTabChip(tab) {
  let label = cleanTitle(smartTitle(stripTitleNoise(tab.title || ''), tab.url), '');
  try {
    const parsed = new URL(tab.url);
    if (parsed.hostname === 'localhost' && parsed.port) label = `${parsed.port} ${label}`;
  } catch {}

  let domain = '';
  try { domain = new URL(tab.url).hostname; } catch {}
  const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=16` : '';
  const safeUrl    = (tab.url || '').replace(/"/g, '&quot;');
  const safeTitle  = label.replace(/"/g, '&quot;');

  return `<div class="page-chip clickable" data-action="focus-tab" data-tab-id="${tab.id}" data-tab-url="${safeUrl}" title="${safeTitle}">
    ${faviconUrl ? `<img class="chip-favicon" src="${faviconUrl}" alt="" onerror="this.style.display='none'">` : ''}
    <span class="chip-text">${label}</span>
    <div class="chip-actions">
      <button class="chip-action chip-save" data-action="save-tab" data-tab-id="${tab.id}" data-tab-url="${safeUrl}" data-tab-title="${safeTitle}" title="Save for later">${SAVE_ICON}</button>
      <button class="chip-action chip-close" data-action="close-tab" data-tab-id="${tab.id}" title="Close">${CLOSE_ICON}</button>
    </div>
  </div>`;
}

function render(wg) {
  const nameEl     = document.getElementById('spWindowName');
  const countEl    = document.getElementById('spTabCount');
  const listEl     = document.getElementById('spTabList');
  const emptyEl    = document.getElementById('spEmpty');
  const closeAllEl = document.getElementById('spCloseAll');

  if (nameEl) nameEl.textContent = wg.customName || 'This window';
  if (countEl) countEl.textContent = `${wg.tabs.length} tab${wg.tabs.length !== 1 ? 's' : ''}`;

  if (wg.tabs.length === 0) {
    if (listEl)     listEl.innerHTML = '';
    if (emptyEl)    emptyEl.style.display = 'block';
    if (closeAllEl) closeAllEl.style.display = 'none';
    return;
  }

  if (emptyEl)    emptyEl.style.display = 'none';
  if (closeAllEl) closeAllEl.style.display = '';
  if (listEl)     listEl.innerHTML = wg.tabs.map(renderTabChip).join('');
}


/* ----------------------------------------------------------------
   REFRESH
   ---------------------------------------------------------------- */

let currentWg = null;

async function refresh() {
  currentWg = await getCurrentWindowData();
  render(currentWg);
}


/* ----------------------------------------------------------------
   EVENT HANDLERS
   ---------------------------------------------------------------- */

document.addEventListener('click', async (e) => {
  const actionEl = e.target.closest('[data-action]');
  if (!actionEl) return;
  const action = actionEl.dataset.action;

  if (action === 'focus-tab') {
    const tabUrl = actionEl.dataset.tabUrl;
    if (tabUrl) await focusTab(tabUrl);
    return;
  }

  if (action === 'close-tab') {
    e.stopPropagation();
    const tabId = parseInt(actionEl.dataset.tabId, 10);
    if (!tabId) return;
    await closeTabById(tabId);
    playCloseSound();
    const chip = actionEl.closest('.page-chip');
    if (chip) {
      chip.style.transition = 'opacity 0.2s, transform 0.2s';
      chip.style.opacity    = '0';
      chip.style.transform  = 'scale(0.9)';
      setTimeout(() => chip.remove(), 200);
    }
    if (currentWg) {
      currentWg.tabs = currentWg.tabs.filter(t => t.id !== tabId);
      const countEl = document.getElementById('spTabCount');
      if (countEl) countEl.textContent = `${currentWg.tabs.length} tab${currentWg.tabs.length !== 1 ? 's' : ''}`;
      if (currentWg.tabs.length === 0) {
        document.getElementById('spEmpty').style.display = 'block';
        document.getElementById('spCloseAll').style.display = 'none';
      }
    }
    showToast('Tab closed');
    return;
  }

  if (action === 'save-tab') {
    e.stopPropagation();
    const tabId    = parseInt(actionEl.dataset.tabId, 10);
    const tabUrl   = actionEl.dataset.tabUrl;
    const tabTitle = actionEl.dataset.tabTitle || tabUrl;
    if (!tabUrl) return;
    await saveTabForLater({ url: tabUrl, title: tabTitle });
    await closeTabById(tabId);
    playCloseSound();
    const chip = actionEl.closest('.page-chip');
    if (chip) {
      chip.style.transition = 'opacity 0.2s';
      chip.style.opacity    = '0';
      setTimeout(() => chip.remove(), 200);
    }
    showToast('Saved for later');
    return;
  }

  if (action === 'close-all') {
    if (!currentWg || currentWg.tabs.length === 0) return;
    const ids = currentWg.tabs.map(t => t.id);
    await chrome.tabs.remove(ids);
    await fetchOpenTabs();
    playCloseSound();
    document.getElementById('spTabList').innerHTML = '';
    document.getElementById('spEmpty').style.display = 'block';
    document.getElementById('spCloseAll').style.display = 'none';
    document.getElementById('spTabCount').textContent = '0 tabs';
    currentWg.tabs = [];
    showToast('All tabs closed');
    return;
  }
});

document.getElementById('spCloseAll')?.addEventListener('click', async () => {
  if (!currentWg || currentWg.tabs.length === 0) return;
  const ids = currentWg.tabs.map(t => t.id);
  await chrome.tabs.remove(ids);
  await fetchOpenTabs();
  playCloseSound();
  document.getElementById('spTabList').innerHTML = '';
  document.getElementById('spEmpty').style.display = 'block';
  document.getElementById('spCloseAll').style.display = 'none';
  document.getElementById('spTabCount').textContent = '0 tabs';
  currentWg.tabs = [];
  showToast('All tabs closed');
});


/* ----------------------------------------------------------------
   REAL-TIME LISTENERS
   ---------------------------------------------------------------- */

chrome.tabs.onCreated.addListener(refresh);
chrome.tabs.onRemoved.addListener(refresh);
chrome.tabs.onMoved.addListener(refresh);
chrome.tabs.onActivated.addListener(refresh);
chrome.tabs.onUpdated.addListener((id, info) => {
  if (info.title || info.url || info.status === 'complete') refresh();
});

// 窗口名更新时同步（storage 变化监听）
chrome.storage.onChanged.addListener((changes) => {
  if (changes.windowNames && currentWg) {
    const names = changes.windowNames.newValue || {};
    currentWg.customName = names[String(currentWg.windowId)] || null;
    const nameEl = document.getElementById('spWindowName');
    if (nameEl) nameEl.textContent = currentWg.customName || 'This window';
  }
});


/* ----------------------------------------------------------------
   INITIALIZE
   ---------------------------------------------------------------- */

refresh();
