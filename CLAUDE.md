# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An interactive longread about musical life of Kazan, published at https://aidarkhusnutdinov.github.io/kazan-music-history/

The page is fully static (no build step). `index.html` fetches all `.md` files at runtime and renders them client-side. There is no framework, bundler, or package.json.

## Local development

Double-click `!open-preview.command` to start the dev server and open the page in a browser.  
Double-click `!open-media-admin.command` to start the server and open the media placement admin UI.

Both scripts auto-kill any existing process on port 8011 before starting a new one.

Manual start: `node local-preview-server.js` — serves on `http://127.0.0.1:8011`

The server provides:
- Static file serving from the project root
- `POST /save-media-raw` — writes raw text body directly to `media-placement.md`
- `POST /save-text-draft-block` — patches a specific block in `text-draft.md`
- `POST /save-chapter-title` — patches a chapter title in `text-draft.md`

## Content files (edit these for content changes)

| File | Purpose |
|------|---------|
| `text-draft.md` | Chapter text. Structure: `# N. Chapter`, `## Block N`, `### Subtitle`, body text, optional `**Разворот:**` expand section |
| `media-placement.md` | What media goes where in each chapter. Parsed by both `index.html` and `media-admin.html` |
| `chapter-sidebar-dates.md` | Timeline events shown in chapter sidebars (three columns: local / Russia / world) |
| `interactive-mong.md` | Config for the "Моң есть или нет?" listening quiz |
| `interactive-gummert.md` | Config for the "Ты поступаешь в школу Гуммерта" branching quiz |

## media-placement.md format

```
# N. Chapter Title

- **position:** after-block-2
  - **block:** Optional block title (used to disambiguate when multiple blocks exist)
  - **type:** image | youtube | embed | image-grid | interactive-mong | interactive-gummert
  - **src:** `url-or-filename`
  - **caption:** Caption text

- **position:** after-block-1
  - **type:** embed
  - **src:** ``
  - **html-start:**
<div id="..."></div>
<script>...</script>
  - **html-end:**
  - **caption:** Caption text

- **position:** before-blocks
  - **type:** image-grid
  - **items:**
    - `url1`
    - `url2`
  - **caption:** Caption text

---
```

Valid positions: `before-blocks`, `after-block-0`, `after-block-1`, etc.

## Key rendering details in index.html

- `body { zoom: 0.9 }` — embed containers counter-zoom with `zoom: 1.1111` to compensate
- VK/external embed scripts are loaded sequentially in `activateEmbeds()` to avoid race conditions
- Interactive types (`interactive-mong`, `interactive-gummert`) are rendered from their own `.md` files
- Conditional label rendering: if `**a-label:**` / `**b-label:**` are empty strings, no label div is rendered in the Моң interactive

## Deployment

Push to `main` branch of `https://github.com/aidarkhusnutdinov/kazan-music-history.git` — GitHub Pages serves from root automatically.
