# Jeet Gohel — Portfolio

Interactive portfolio built with **Vite + React + TypeScript**, hand-written CSS (design tokens in `src/styles/base.css`),
`react-router-dom` and `lucide-react`. No animation library: motion is CSS + small hooks, and respects `prefers-reduced-motion`.

```bash
npm install
npm run dev       # local dev
npm run build     # typecheck + production build → dist/
npm run preview
```

## Pages
| Route | What |
|---|---|
| `/` | Loader → interactive sky hero (drag the sun/moon, time-of-day, 4 seasons) → intro → selected work (6 slots) → interface showcase → visual gallery + lightbox → motion lab → desk/letter teasers |
| `/work/:slug` | Reusable 12-section case study (sticky nav, progress bar, lightbox, annotated UI, accordion, prev/next) |
| `/about` | Interactive desk — click objects to open story, philosophy, experience, education, skills, tools, interests, resume |
| `/contact` | Envelope + letter form with validation, copy email, LinkedIn, Behance, WhatsApp placeholder |
| `/resume` | On-page resume + PDF download |

## Where things live
```
src/data/        personal.ts · projects.ts · caseStudies.ts · gallery.ts · navigation.ts   ← edit content here
src/components/  SkyHero, SelectedWork, Showcase, GalleryShowcase, MotionLab, Art (placeholders), …
src/pages/       Home, CaseStudy, About, Contact, Resume
src/styles/      base · hero · sections · case · pages
public/          images/ (profile, projects/*, case-studies, experiments) · videos/ · resume/ · icons/
legacy/          the previous static site, kept for reference
```

## Replacing placeholders
Everything labelled **Sample / Placeholder** is fake on purpose. Images are paths relative to `public/`.
- **Project:** edit/add an entry in `src/data/projects.ts` → set `cover`, `images`, `role`, `year`, `tools`, `placeholder: false`.
  Add images under `public/images/projects/<category>/`. New projects automatically get a case-study page at `/work/<slug>`.
- **Case study:** in `src/data/caseStudies.ts`, `hiddenSections: ['research', …]` hides sections; `content: { research: { lead, items:[{title, body}], images:[…] } }` fills them.
  Prototype: `embedUrl` (Figma/Framer) or `video`. Item titles must match the topic names in `SECTION_TEMPLATE`.
- **Gallery / motion:** `src/data/gallery.ts` — set `src` (image), or `video` / `gif` / `embed` for motion items.
- **Portrait:** put a file in `public/images/profile/` and set `portrait` in `personal.ts` (not rendered yet — wire into About when ready).
- **Resume:** replace `public/resume/jeet-gohel-resume.pdf`.
- **Experience dates / role title:** `src/data/personal.ts` (left generic on purpose — nothing invented).
- **WhatsApp:** set `whatsapp` in `personal.ts` (e.g. `https://wa.me/91XXXXXXXXXX`).

## Contact form
No email service is configured by default, so the form opens the visitor's email app via `mailto:` and says so honestly.
To send directly, set `VITE_CONTACT_ENDPOINT` (see `.env.example`) to any endpoint accepting a JSON POST
(e.g. a Formspree form URL). Success/error states are handled.

## Deploying
Static SPA. `vercel.json` and `public/_redirects` (Netlify) provide the fallback to `index.html`. For GitHub Pages use a
base path (`vite build --base=/repo/`) and add a copy of `index.html` as `404.html`.

## Notes
- Fonts load from Google Fonts (Instrument Serif, Inter Tight, JetBrains Mono) with system fallbacks.
- The reference sites could not be fetched from the build environment (blocked network), so the design follows the brief's
  description of the reference rather than a direct inspection of its code or motion.
