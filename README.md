# Tab Out

**Keep tabs on your tabs.**

Tab Out is a Chrome extension that replaces your new tab page with a dashboard of everything you have open. Tabs are grouped by window — each window gets its own column, so you can see exactly what you're working on in each context. Close tabs with a satisfying swoosh + confetti.

No server. No account. No external API calls. Just a Chrome extension.

---

## About this fork

This is a personal fork of [zarazhangrui/tab-out](https://github.com/zarazhangrui/tab-out) by [Zara](https://x.com/zarazhangrui).

**Changes from the original:**

| | Original | This fork |
|---|---|---|
| Tab grouping | By domain | By window |
| Window naming | — | Persistent custom names per window |
| Side panel | — | Always-on side panel (`Alt+T`) for current window |
| Layout | Domain cards grid | Windows as columns, tabs as flat list |

---

## Install with a coding agent

Send your coding agent (Claude Code, Codex, etc.) this repo and say **"install this"**:

```
https://github.com/wp2123/tab-out
```

The agent will walk you through it. Takes about 1 minute.

---

## Features

### New tab dashboard
- **Grouped by window** each browser window gets its own column — tabs stay in the context you put them in
- **Rename windows** give each window a persistent name (e.g. "Work", "Research") that survives refreshes
- **Close tabs with style** swoosh sound + confetti burst on close
- **Close a whole window's tabs** in one click
- **Click any tab to jump to it** across windows, no new tab opened
- **Save for later** save tabs to a checklist before closing them
- **Localhost port labels** shows port numbers next to each tab so you can tell your local projects apart
- **Expandable list** shows first 8 tabs with a clickable "+N more"

### Side panel
- **Always-on tab manager** press `Alt+T` (or click the toolbar icon) to open a persistent side panel
- **Current window only** the side panel shows only the tabs in the window you're working in
- **Real-time updates** list refreshes automatically as you open, close, or navigate tabs
- **Syncs window names** rename a window in the dashboard and the side panel title updates instantly

### General
- **100% local** your data never leaves your machine
- **Pure Chrome extension** no server, no Node.js, no npm, no setup beyond loading the extension

---

## Setup

**1. Clone the repo**

```bash
git clone https://github.com/wp2123/tab-out.git
```

**2. Load the Chrome extension**

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder inside the cloned repo

**3. Pin the icon (optional but recommended)**

Click the puzzle-piece icon in the Chrome toolbar → find Tab Out → click the pin icon. This lets you open the side panel with one click.

**4. Set your shortcut (optional)**

The default shortcut to toggle the side panel is `Alt+T`. To change it, go to `chrome://extensions/shortcuts`.

---

## How it works

```
Open a new tab
  -> Dashboard shows all windows side by side, each as a column
  -> Current window appears first
  -> Click any tab to jump to it
  -> Rename a window to remember what it's for (persists across refreshes)
  -> Close a whole window's tabs at once, or save individual tabs for later

Press Alt+T (or click the toolbar icon)
  -> Side panel opens on the right
  -> Shows only the current window's tabs, updated in real time
  -> Close or save tabs without leaving what you're doing
```

Everything runs inside the Chrome extension. No external server, no API calls, no data sent anywhere. Saved tabs and window names are stored in `chrome.storage.local`.

---

## Tech stack

| What | How |
|------|-----|
| Extension | Chrome Manifest V3 |
| Storage | chrome.storage.local |
| Sound | Web Audio API (synthesized, no files) |
| Animations | CSS transitions + JS confetti particles |

---

## License

MIT

---

Built by [Zara](https://x.com/zarazhangrui)
