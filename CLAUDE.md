# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A karaoke prompter: a single-page app in **vanilla HTML/CSS/JS** — no framework, no build step, no server, no dependencies. Lyrics scroll automatically and fill with color left-to-right, synced to the audio.

## Running & checking

- **Run**: open `index.html` directly in a browser (Chrome preferred). There is no dev server.
- **Syntax check** (no test suite exists): `node --check script.js`
- **Sanity-check JSON parsing** of a `song.json` against the real import path:
  ```bash
  node -e 'const d=require("fs").readFileSync("song.json","utf8");console.log(JSON.parse(d).length)'
  ```

## Architecture

Everything runs from `script.js` (the only logic file). `index.html` is structure, `style.css` is presentation, `videoplayback.m4a` is the default audio.

### Data model: `song.json` (external, not embedded)
A song is a JSON array of `{ text, curve, time }` objects:
- `text: ""` is a non-timeable spacer between verses.
- `curve` is the fill easing (`linear`/`easeIn`/`easeOut`/`easeInOut`/`steps`), applied in `applyEasing()`.
- `time` is the start time in seconds (`null` = unset).

`song.json` is **not loaded by the page** and is **not tracked in git** — it is user data, imported and exported at runtime (like `.lrc` exports). At startup the app is empty until the user imports.

### Two parallel index spaces (the main gotcha)
`SONG` includes empty spacer lines, but the timeable arrays do **not**. `lineEls`, `lineCurves`, and `timings` are indexed only over non-empty lines. Any code walking `SONG` while touching `timings` must keep a separate counter that advances only on non-empty lines (see `buildSong`, `exportLrc`, `timingsFromSong`). Mixing the two index spaces is the easiest way to misalign timing.

### Import / export / persistence flow
- **Import** (`importSong`): `JSON.parse` only — never `eval`/`new Function`. The imported file is authoritative: it replaces `SONG` and `timings` wholesale. Guarded by a confirm if `hasUnsavedWork` is set.
- **Export** (`downloadSong` → `song.json`, `exportLrc` → `.lrc`): `buildSong()` reinjects current `timings` back into `SONG` shape. `.lrc` is one-way (not re-importable).
- **Auto-save draft** (`autoSaveDraft`/`restoreDraft`): a single localStorage key `karaoke-draft` holds the full song (lyrics + times) so a reload restores work without re-importing. Any timing edit calls `markDirty()` (sets `hasUnsavedWork` + auto-saves); a successful export clears the dirty flag.

### Playback engine
`renderPlayback()` runs in a `requestAnimationFrame` loop (`startLoop`/`stopLoop`, gated on audio play/pause and `mode === "play"`). It reads only `timings[]`: `findCurrentIndex()` picks the active line, `lineEndTime()` derives its end from the next timed line (or audio duration), and the progress is written to the CSS custom property **`--fill`** on the active `<p>`. The left-to-right color fill is pure CSS: `style.css` paints a `linear-gradient` through the text via `background-clip: text` using `--fill` (only under `body.mode-play`).

### Modes
`setMode("play"|"sync")` toggles `mode-btn`/body classes and shows/hides `#sync-tools`. Sync mode marks line times via `markLine` (keyboard `M`/`Space`, or buttons); `Q` toggles play/pause in any mode. Audio (`#audio-file`) is independent of lyrics — changing it never touches `SONG` or `timings`.

## Conventions specific to this repo

- Code identifiers/comments in **English**; user-facing UI strings and `hint` messages in **French**.
- When touching the data shape, update the `## Changer les paroles` and `## Sauvegarder et réutiliser` sections of `README.md` (user-facing docs are kept in sync).
