# Jeet Gohel — Portfolio

Interactive portfolio built with **Vite + React + TypeScript**, hand-written CSS (design tokens at the top of
`src/styles/base.css`), `react-router-dom` and `lucide-react`. No animation library — motion is CSS plus small hooks,
and respects `prefers-reduced-motion`.

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build → dist/
npm run preview    # serve dist/ locally
```

## Pages
| Route | What |
|---|---|
| `/` | Loader → interactive sky hero (drag the sun/moon, time of day, 4 seasons) → intro + marquee → selected work (6 slots) → interface showcase → visual-design gallery + lightbox → motion lab → desk/letter teasers |
| `/work/:slug` | Reusable 12-section case study: sticky section nav, progress bar, editorial split layouts, device stages, image grids, annotated UI, lightbox, accordion, prev/next |
| `/about` | Interactive desk — each object opens a panel (story, philosophy, experience, education, skills, tools, interests, resume) |
| `/contact` | Envelope + letter form (validation, mailto fallback), copy email, LinkedIn, Behance, WhatsApp placeholder |
| `/resume` | On-page resume + PDF download |

## Project structure
```
src/data/        ← ALL editable content
  personal.ts      name, email, links, portrait path, resume path, experience, education, skills, tools
  projects.ts      the 6 project slots (cover images, role, year, tools)
  caseStudies.ts   per-project case study: hidden sections + real content/images
  gallery.ts       visual-design gallery + motion lab items
  showcase.ts      homepage dashboard / website / mobile showcase screenshots
  navigation.ts    nav items
src/components/  SkyHero, SelectedWork, Showcase, GalleryShowcase, MotionLab, Art (placeholder art + frames), Lightbox …
src/pages/       Home, CaseStudy, About, Contact, Resume
src/styles/      base · hero · sections · case · pages
public/          static assets (see below)
legacy/          the previous static site, kept for reference
```

## Replacing placeholders — exact files

All image paths in data files are **relative to `public/`** (write `images/...`, not `/public/images/...`).
Anything left empty — or pointing to a file that does not load — automatically falls back to a designed placeholder,
so you can replace things one at a time. Remove `placeholder: true` from a project once it is real (this hides the "Sample" badges).

| What | Put the file here | Then set |
|---|---|---|
| **Resume PDF** | `public/resume/jeet-gohel-resume.pdf` (replace the file, same name) | nothing — or change `resumePath` in `src/data/personal.ts` |
| **Profile photo** | `public/images/profile/portrait.jpg` (4:5, ≥ 800 px wide) | `portrait: 'images/profile/portrait.jpg'` in `src/data/personal.ts` |
| **Project cover — website** | `public/images/projects/websites/website-project-cover.jpg` | `cover:` on that project in `src/data/projects.ts` |
| **Project cover — mobile app** | `public/images/projects/mobile-apps/mobile-app-project-cover.jpg` | `cover:` |
| **Project cover — dashboard** | `public/images/projects/dashboards/saas-dashboard-project-cover.jpg` | `cover:` |
| **Project cover — product** | `public/images/projects/dashboards/product-design-project-cover.jpg` (any folder works) | `cover:` |
| **Project cover — branding** | `public/images/projects/branding/brand-identity-project-cover.jpg` | `cover:` |
| **Project cover — graphics** | `public/images/projects/graphics/graphic-design-project-cover.jpg` | `cover:` |
| **Homepage dashboard screenshot** | `public/images/projects/dashboards/showcase-dashboard.png` (16:9, ≥ 1600 px) | `dashboard:` in `src/data/showcase.ts` |
| **Homepage website screenshot** | `public/images/projects/websites/showcase-website.png` (top of the page) | `website:` |
| **Homepage mobile screenshots** | `public/images/projects/mobile-apps/showcase-1.png`, `-2.png`, `-3.png` (≈ 9:19.5) | `mobile: [...]` |
| **Branding / graphics gallery** | `public/images/projects/branding/…` or `…/graphics/…` | `src:` on a gallery item in `src/data/gallery.ts` |
| **Motion videos** | `public/videos/<name>.mp4` (+ optional poster in `public/images/experiments/`) | `video:` / `poster:` on a motion item in `gallery.ts` |
| **Motion GIFs** | `public/images/experiments/<name>.gif` | `gif:` |
| **Interactive prototype** | — (a URL) | `embed:` in `gallery.ts`, or `embedUrl:` in a case study |
| **Case study images** | `public/images/case-studies/<slug>/<file>.jpg` | see below |
| **Favicon / app icon** | replace `public/favicon.svg` and `public/apple-touch-icon.png` (180×180) | — |

### Adding a new project
1. Copy an entry in `src/data/projects.ts`, give it a unique `slug`, `kind` (`web | mobile | dashboard | product | brand | graphic`),
   `title`, `category`, `summary`, `role`, `year`, `platform`, `tools`, `palette`, `cover`, `placeholder: false`.
2. It immediately appears in *Selected work* and gets a page at `/work/<slug>`.
3. Optionally add `CASE_STUDIES['<slug>']` in `src/data/caseStudies.ts` (hide sections / add content).

### Case study content
In `src/data/caseStudies.ts`:
```ts
'my-project': {
  hiddenSections: ['research', 'prototype'],           // hide what you don't need
  cover: 'images/case-studies/my-project/cover.jpg',   // optional: overrides the project cover on this page
  content: {
    introduction: { lead: 'One-paragraph overview…' },
    problem:  { items: [{ title: 'Problem statement', body: 'Real text…' }] },   // title must match a topic name
    research: { images: ['images/case-studies/my-project/affinity-map.jpg'] },   // replaces the placeholder visual
    final: {
      desktop: [{ src: 'images/case-studies/my-project/desktop-1.png', caption: 'Dashboard overview' }],
      mobile:  ['images/case-studies/my-project/mobile-1.png', 'images/case-studies/my-project/mobile-2.png'],
      images:  ['images/case-studies/my-project/detail-1.jpg'],                  // extra grid under the devices
    },
    prototype: { embedUrl: 'https://www.figma.com/embed?...' },                  // or: video: 'videos/my-project.mp4'
  },
}
```
Section ids: `introduction, overview, problem, research, strategy, ux, visual, final, prototype, outcomes, learnings, next`.
Topic names per section are listed in `SECTION_TEMPLATE` at the top of that file. Any image can be a plain path or
`{ src, caption, alt }`. Images in grids keep their natural proportions and open in a zoomable lightbox.

## Contact form
No email service is configured by default, so the form opens the visitor's email app via `mailto:` and tells them the
message is **not sent until they press send**. To send directly, set `VITE_CONTACT_ENDPOINT` (see `.env.example`) to any
endpoint that accepts a JSON `POST` (e.g. a Formspree URL), then rebuild. Success and error states are built in.
WhatsApp: set `whatsapp` in `src/data/personal.ts` (e.g. `https://wa.me/91XXXXXXXXXX`); until then it shows "coming soon".

## Deploying
Static SPA. `vercel.json` and `public/_redirects` (Netlify) provide the fallback to `index.html`. For GitHub Pages build with
`vite build --base=/<repo>/` and copy `dist/index.html` to `dist/404.html`.
Set your real domain in `index.html` (`<link rel="canonical">`, Open Graph image) once it is known.

## Notes
- Fonts load from Google Fonts (Instrument Serif, Inter Tight, JetBrains Mono) with system fallbacks.
- `legacy/` holds the original static site; delete it whenever you like.
