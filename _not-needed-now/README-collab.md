# Collaboration / media workflow

Project root:
`~/Dropbox/Projects/kazan-music-format/`

## Main files
- `preview.html` — main reading page
- `text-draft.md` — final text
- `chapter-sidebar-dates.md` — right sidebar dates
- `media-placement.md` — media placement logic
- `media-admin.html` — simple admin UI for media placement
- `!open-preview.command` — opens the preview page locally

## Easiest workflow for a non-technical collaborator

1. Open this folder.
2. Start a simple local server in the folder.
   - easiest: run `!open-preview.command`
   - or `python3 -m http.server 8000`
3. Open:
   - `http://localhost:8000/media-admin.html`
4. Add image/video links in the admin UI.
5. Click **Download media-placement.md**.
6. Replace the project’s `media-placement.md` with the downloaded one.
7. Reload `preview.html`.

## Notes
- The admin UI is meant for normal users: add chapter, choose position, paste link, export file.
- Images can be remote URLs or local project-relative paths like `./kazan-panorama.jpg`.
- YouTube links should be embed URLs like:
  `https://www.youtube.com/embed/VIDEO_ID`
