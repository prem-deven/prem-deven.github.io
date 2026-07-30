# Prem Kumar — Portfolio Website

A static, data-driven portfolio site built with plain HTML, CSS, and vanilla
JavaScript. No frameworks, no build step, no backend.

## Structure

```
index.html
css/style.css
js/main.js
data/profile.json      ← name, title, about, email, GitHub, LinkedIn, resume link
data/projects.json      ← personal project cards
data/clients.json       ← client work cards
assets/                 ← put your resume PDF here (see below)
```

## Running locally

Because `js/main.js` uses `fetch()` to load the JSON files, opening
`index.html` directly (`file://...`) will be blocked by the browser's CORS
policy. Serve the folder over a local HTTP server instead:

```bash
cd portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploying to GitHub Pages

1. Push this folder to a GitHub repository (or a `docs/` folder / `main`
   branch — whichever you prefer).
2. In the repo settings, go to **Pages** and set the source to that branch
   (and folder, if applicable).
3. GitHub Pages serves static files over HTTP, so `fetch()` will work
   automatically — no extra configuration needed.

## Adding your resume

Add your resume PDF at:

```
assets/Prem_Kumar_Resume.pdf
```

(or update `resumeLink` in `data/profile.json` to point wherever you keep
it — it can be a relative path or a full URL).

## Updating content — no HTML editing required

- **New project** → add an object to `data/projects.json`:
  ```json
  {
    "title": "Project Name",
    "description": "One or two sentence description.",
    "technologies": ["Python", "Docker"],
    "github": "https://github.com/you/project",
    "image": "https://example.com/image.jpg"
  }
  ```
- **New client work** → add an object to `data/clients.json`:
  ```json
  {
    "client": "Client Name",
    "project": "Project Name",
    "description": "What you built for them.",
    "technologies": ["FastAPI", "PostgreSQL"]
  }
  ```
- **Personal info** (name, title, tagline, about, email, GitHub, LinkedIn,
  resume link) → edit `data/profile.json`.

The page reads these files with JavaScript on load and renders the cards,
hero text, about copy, and contact links automatically.

## Notes

- Skills (Backend / Database / DevOps / Tools) on the Resume section are
  defined directly in `index.html` since they're structural, not repeating
  content — edit them there if they change.
- Scroll-reveal animations respect `prefers-reduced-motion`.
- All images referenced in `projects.json` currently point to Unsplash
  placeholders — swap in real project screenshots for production.
