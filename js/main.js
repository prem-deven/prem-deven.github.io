/* =========================================================================
   main.js
   Fetches data/profile.json, data/projects.json, data/clients.json
   and renders the site content. No HTML edits are needed to add
   new projects, client work, or update the profile — just edit the
   JSON files in /data.

   NOTE: because this uses fetch() to load local JSON files, the site
   must be served over http(s) — e.g. via GitHub Pages, or locally
   with `python3 -m server 8000`. Opening index.html directly with
   file:// will be blocked by the browser's CORS policy for fetch.
   ========================================================================= */

const DATA_PATHS = {
  profile: "data/profile.json",
  projects: "data/projects.json",
  clients: "data/clients.json",
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initNavToggle();
  initRevealAnimations();
  initFooterYear();
  loadAllData();
});

/* --------------------------------------------------------------------- */
/* Data loading                                                          */
/* --------------------------------------------------------------------- */

async function loadAllData() {
  const [profile, projects, clients] = await Promise.all([
    fetchJSON(DATA_PATHS.profile),
    fetchJSON(DATA_PATHS.projects),
    fetchJSON(DATA_PATHS.clients),
  ]);

  if (profile) renderProfile(profile);
  if (projects) renderProjects(projects);
  if (clients) renderClients(clients);

  // Re-observe any newly injected .reveal elements
  initRevealAnimations();
}

async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(err);
    return null;
  }
}

/* --------------------------------------------------------------------- */
/* Rendering: profile.json -> Home / About / Resume / Contact            */
/* --------------------------------------------------------------------- */

function renderProfile(profile) {
  // Hero
  setText("heroName", profile.name);
  setText("heroTitle", profile.title);
  if (profile.tagline) setText("heroTagline", profile.tagline);

  document.title = `${profile.name} — ${profile.title}`;

  // Resume buttons
  const resumeLink = profile.resumeLink || "#";
  ["heroResumeBtn", "resumeDownloadBtn"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.setAttribute("href", resumeLink);
      el.setAttribute("download", "");
    }
  });

  // About
  setText("aboutText", profile.about);

  // Footer
  setText("footerName", profile.name);

  // Contact cards
  const contactGrid = document.getElementById("contactGrid");
  if (contactGrid) {
    const items = [
      { label: "Email", value: profile.email, href: `mailto:${profile.email}` },
      { label: "GitHub", value: stripProtocol(profile.github), href: profile.github },
      { label: "LinkedIn", value: stripProtocol(profile.linkedin), href: profile.linkedin },
    ].filter((item) => item.value);

    contactGrid.innerHTML = items
      .map(
        (item, i) => `
      <a class="glass-card contact-card reveal" href="${escapeAttr(item.href)}" target="_blank" rel="noopener noreferrer" style="transition-delay:${i * 60}ms">
        <span class="contact-label">${escapeHTML(item.label)}</span>
        <span class="contact-value">${escapeHTML(item.value)}</span>
      </a>`
      )
      .join("");
  }
}

/* --------------------------------------------------------------------- */
/* Rendering: projects.json -> Projects section                         */
/* --------------------------------------------------------------------- */

function renderProjects(projects) {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;

  if (!Array.isArray(projects) || projects.length === 0) {
    grid.innerHTML = `<p class="empty-state">No projects yet — add entries to data/projects.json.</p>`;
    return;
  }

  grid.innerHTML = projects
    .map((project, i) => {
      const tags = (project.technologies || [])
        .map((tech) => `<span class="tag">${escapeHTML(tech)}</span>`)
        .join("");

      const media = project.image
        ? `<div class="project-card-media"><img src="${escapeAttr(project.image)}" alt="${escapeAttr(project.title || "Project image")}" loading="lazy"></div>`
        : "";

      const githubBtn = project.github
        ? `<a class="btn btn-ghost" href="${escapeAttr(project.github)}" target="_blank" rel="noopener noreferrer">View on GitHub →</a>`
        : "";

      return `
      <article class="project-card reveal" style="transition-delay:${i * 70}ms">
        ${media}
        <div class="project-card-body">
          <h3>${escapeHTML(project.title)}</h3>
          <p>${escapeHTML(project.description)}</p>
          <div class="tag-list">${tags}</div>
          ${githubBtn}
        </div>
      </article>`;
    })
    .join("");
}

/* --------------------------------------------------------------------- */
/* Rendering: clients.json -> Client Work section                       */
/* --------------------------------------------------------------------- */

function renderClients(clients) {
  const grid = document.getElementById("clientsGrid");
  if (!grid) return;

  if (!Array.isArray(clients) || clients.length === 0) {
    grid.innerHTML = `<p class="empty-state">No client work listed yet — add entries to data/clients.json.</p>`;
    return;
  }

  grid.innerHTML = clients
    .map((item, i) => {
      const tags = (item.technologies || [])
        .map((tech) => `<span class="tag">${escapeHTML(tech)}</span>`)
        .join("");

      return `
      <article class="glass-card client-card reveal" style="transition-delay:${i * 70}ms">
        <div class="client-card-head">
          <span class="client-name">${escapeHTML(item.client)}</span>
        </div>
        <h3>${escapeHTML(item.project)}</h3>
        <p>${escapeHTML(item.description)}</p>
        <div class="tag-list">${tags}</div>
      </article>`;
    })
    .join("");
}

/* --------------------------------------------------------------------- */
/* Header scroll state                                                   */
/* --------------------------------------------------------------------- */

function initHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 12);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* --------------------------------------------------------------------- */
/* Mobile nav toggle                                                     */
/* --------------------------------------------------------------------- */

function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("open");
    toggle.classList.toggle("open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

/* --------------------------------------------------------------------- */
/* Scroll reveal animations (vanilla JS, IntersectionObserver)          */
/* --------------------------------------------------------------------- */

function initRevealAnimations() {
  const targets = document.querySelectorAll(".reveal:not(.is-visible)");
  if (!targets.length) return;

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------- */
/* Footer year                                                           */
/* --------------------------------------------------------------------- */

function initFooterYear() {
  const el = document.getElementById("footerYear");
  if (el) el.textContent = new Date().getFullYear();
}

/* --------------------------------------------------------------------- */
/* Utilities                                                             */
/* --------------------------------------------------------------------- */

function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value != null) el.textContent = value;
}

function stripProtocol(url) {
  if (!url) return "";
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function escapeHTML(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  return escapeHTML(str);
}
