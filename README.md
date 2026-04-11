# Tab Out

**Keep tabs on your tabs.**

Tab Out replaces your Chrome new tab page with a dashboard that shows everything you have open -- grouped by domain, with landing pages (Gmail, X, LinkedIn, etc.) pulled into their own group for easy cleanup. Close tabs with a satisfying swoosh + confetti.

Built for people who open too many tabs and never close them.

---

## Install with a coding agent

Send your coding agent (Claude Code, Cursor, Windsurf, etc.) this repo and say **"install this"**:

```
https://github.com/zarazhangrui/tab-out
```

The agent will explain what Tab Out does and set everything up. Takes about 2 minutes.

---

## Features

- **See all your tabs at a glance** -- grouped by domain on a clean grid, no more squinting at 30 tiny tab titles
- **Landing pages group** -- homepages and feeds (Gmail, X, LinkedIn, GitHub, YouTube) are pulled into one card so you can close them all at once
- **Close tabs with style** -- swoosh sound + confetti burst when you clean up a group. Makes tab hygiene feel rewarding
- **Duplicate detection** -- flags when you have the same page open twice, with one-click cleanup
- **Click any tab to jump to it** -- switches to the existing tab, even across windows
- **Save for later** -- bookmark individual tabs to a checklist before closing them
- **Tab Out dupe detection** -- notices when you have extra new tab pages open and offers to close them
- **Expandable groups** -- large groups show the first 8 tabs with a clickable "+N more" to reveal the rest
- **Auto-updates** -- get notified when a new version is available, update with one click
- **100% local** -- your browsing data never leaves your machine. No AI, no external API calls
- **Always on** -- starts automatically when you log in, runs silently in the background

---

## Manual Setup

If you prefer to set things up yourself instead of using a coding agent:

**1. Clone and install**

```bash
git clone https://github.com/zarazhangrui/tab-out.git
cd tab-out
npm install
```

**2. Run the setup script**

```bash
npm run install-service
```

This creates `~/.mission-control/`, writes a default config, and installs an auto-start service for your platform (macOS Launch Agent, Linux systemd, or Windows Startup script).

**3. Load the Chrome extension**

1. Go to `chrome://extensions` in Chrome
2. Enable **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `extension/` folder from this repo

**4. Start the server**

```bash
npm start
```

Open a new tab -- you'll see Tab Out. The server auto-starts on future logins.

---

## Configuration

Config lives at `~/.mission-control/config.json`:

| Field | Default | What it does |
|-------|---------|-------------|
| `port` | `3456` | Local port for the dashboard |

---

## How it works

```
You open a new tab
  -> Chrome extension loads Tab Out in an iframe
  -> Dashboard shows your open tabs grouped by domain
  -> Landing pages (Gmail, X, LinkedIn, etc.) get their own group at the top
  -> You close groups you're done with (swoosh + confetti)
  -> Repeat
```

The server runs silently in the background. It starts on login and restarts if it crashes. You never think about it.

---

## Tech stack

| What | How |
|------|-----|
| Server | Node.js + Express |
| Database | better-sqlite3 (local SQLite) |
| Extension | Chrome Manifest V3 |
| Auto-start | macOS Launch Agent / Linux systemd / Windows Startup |
| Sound | Web Audio API (synthesized, no files) |
| Animations | CSS transitions + JS confetti particles |

---

## License

MIT

---

Built by [Zara](https://x.com/zarazhangrui)
