# AGENTS.md -- Tab Out: Setup & Onboarding Guide for Coding Agents

You're installing **Tab Out** for the user. Your job is not just to set it up -- it's to get them excited about using it. Explain what it does, why it's useful, and walk them through the experience.

---

## Step 0 -- Introduce the product

Before doing anything technical, tell the user what they're about to get. Say something like:

> **Tab Out** replaces your new tab page with a clean dashboard that shows everything you have open -- grouped by domain, with landing pages pulled into their own group for easy cleanup.
>
> Here's what makes it great:
> - **See all your open tabs at a glance** -- grouped by domain, no scrolling through 30+ tiny tabs
> - **Landing pages group** -- homepages and feeds (Gmail, X, LinkedIn, GitHub, YouTube) are grouped into one card you can close with one click
> - **Close tabs with style** -- satisfying swoosh sound + confetti burst when you clean up a group. Makes tab cleanup feel like a reward, not a chore.
> - **Duplicate detection** -- flags when you have the same page open twice (we've all been there)
> - **Click any tab title to jump to it** -- even across different Chrome windows
> - **Save for later** -- bookmark individual tabs to a checklist before closing them
> - **100% local** -- your browsing data never leaves your machine. No AI, no external API calls.
> - **Always on** -- starts automatically when you log in, runs silently in the background
>
> Let's set it up -- takes about 2 minutes.

---

## Step 1 -- Clone and install

```bash
git clone https://github.com/zarazhangrui/tab-out.git
cd tab-out
npm install
```

---

## Step 2 -- Write the config

Create `~/.mission-control/config.json`:

```json
{
  "port": 3456
}
```

---

## Step 3 -- Run the setup script

```bash
npm run install-service
```

This creates data/logs directories and installs a platform-specific auto-start service (macOS Launch Agent, Linux systemd, or Windows Startup script).

---

## Step 4 -- Install the Chrome extension

This is the one step that requires manual action from the user. Make it as easy as possible:

**First**, tell the user the full path they'll need. Print it clearly:
```bash
echo "Extension folder: $(cd extension && pwd)"
```

**Then**, copy the path to their clipboard so they can paste it in the file picker:
- macOS: `cd extension && pwd | pbcopy && echo "Path copied to clipboard"`
- Linux: `cd extension && pwd | xclip -selection clipboard 2>/dev/null || pwd | xsel --clipboard 2>/dev/null || echo "Path: $(pwd)"`
- Windows: `cd extension && echo %CD% | clip`

**Then**, open the extensions page:
```bash
open "chrome://extensions"
```

**Then**, walk the user through it step by step. Say something like:

> I've copied the extension folder path to your clipboard. Now:
>
> 1. You should see Chrome's extensions page. In the **top-right corner**, toggle on **Developer mode** (it's a switch).
> 2. Once Developer mode is on, you'll see a button called **"Load unpacked"** appear in the top-left. Click it.
> 3. A file picker will open. **Press Cmd+Shift+G** (Mac) or **Ctrl+L** (Windows/Linux) to open the "Go to folder" bar, then **paste** the path I copied (Cmd+V / Ctrl+V) and press Enter.
> 4. Click **"Select"** or **"Open"** -- the extension will install immediately.
>
> You should see "Tab Out" appear in your extensions list.

**Also**, open Finder/Explorer directly to the extension folder as a fallback:
- macOS: `open extension/`
- Linux: `xdg-open extension/`
- Windows: `explorer extension\\`

This way the user can also just drag or navigate to it visually if the clipboard approach doesn't work.

---

## Step 5 -- Start, verify, and show them around

```bash
npm start &
sleep 2
open http://localhost:3456
```

Once the dashboard loads, walk them through the experience:

> You're all set! Here's how to use Tab Out:
>
> 1. **Open a new tab** -- you'll see your open tabs grouped by domain, with landing pages (Gmail, X, etc.) at the top.
> 2. **Click any tab title** to jump directly to that tab (no new tab opened).
> 3. **Click "Close all N tabs"** on any group to clean up -- you'll hear a swoosh and see confetti.
> 4. **Duplicate tabs** are flagged with an amber badge. Click "Close duplicates" to keep just one copy.
> 5. **Save individual tabs for later** by clicking the bookmark icon before closing.
>
> The server runs automatically in the background -- you never need to start it again. Every new tab is now your dashboard.

---

## Key Facts

- Config: `~/.mission-control/config.json`
- Logs: `~/.mission-control/logs/`
- Default port: `3456`
- Auto-starts on login (macOS Launch Agent / Linux systemd / Windows Startup)
- 100% local -- no data is sent to any external service
