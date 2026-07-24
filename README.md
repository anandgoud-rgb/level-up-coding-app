# Level Up — Gamified Coding Learning App

A single-file, zero-build educational web app that teaches beginners to code through play. Built for Sunstone campus programs.

**Live:** https://verceldeploy-umber-one.vercel.app

## What it does

Students sign up (name, email, college, program, batch) and learn through two challenges:

- **Web Challenge** — a 4-track path:
  - **HTML** (10 coding levels)
  - **CSS** (10 coding levels)
  - **JavaScript** (10 coding levels)
  - **Instagram Profile Builder** (capstone project)
  - freeCodeCamp-style: write real code, pass test cases, advance. No locking between tracks.
- **Code Challenge (Java)** — 9 levels + an ATM capstone + Final Castle.

Small certificates are awarded after each section.

## Architecture

- **Frontend:** one file — `index.html` (HTML + CSS + vanilla JS, no frameworks, no build step).
- **Progress storage:** Google Sheets, one tab per campus, via a Google Apps Script web app (`LevelUp_AppScript.js`).
- **Hosting:** Vercel (static deploy).

### How progress saving works

1. Student fills the signup form → a row is created in their campus tab immediately.
2. Every level/section completion calls `syncProgress()` which sends the current progress to the Apps Script via a GET request (GET is used because Apps Script drops POST bodies on its 302 redirect in some browsers).
3. On a return visit, the student enters the same email + college → `loadProgress()` fetches their row and restores exactly where they left off.

## Files

| File | Purpose |
|------|---------|
| `index.html` | The entire app. Deploy this to any static host. |
| `LevelUp_AppScript.js` | Google Apps Script — paste into the Sheet's Apps Script editor, run `setupSheets()` once, deploy as a Web App. |
| `supabase_schema.sql` | (Legacy) Supabase schema from an earlier approach — not used by the current Google Sheets setup. |

## Setup

### 1. Google Sheet + Apps Script
1. Create a Google Sheet, note its ID.
2. Extensions → Apps Script → paste `LevelUp_AppScript.js` (set `SHEET_ID`).
3. Run `setupSheets()` once to create all campus tabs.
4. Deploy → New Deployment → Web App → "Who has access: Anyone" → copy the `/exec` URL.

### 2. Wire the app
In `index.html`, set:
```js
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/XXXX/exec';
```

### 3. Deploy
Drag `index.html` to Vercel / Netlify / GitHub Pages, or use the Vercel CLI.

## Campuses

ADTU, CUH, SAGE Indore, SAGE Bhopal, DRK, Hitech, IITM, SRMU, VGUJ, RBU, RGI, TIPS, RGU

## Notes
- Program durations: B.Tech = 4 yrs, BCA = 3 yrs, MCA = 2 yrs (batch dropdown adjusts automatically).
- The app works fully offline (in-memory) if `APPS_SCRIPT_URL` is left as the placeholder.
