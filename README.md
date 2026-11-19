# Jeet Gohel — Portfolio

Interactive portfolio built with **Vite + React + TypeScript**, hand-written CSS (design tokens at the top of
`src/styles/base.css`), `react-router-dom` and `lucide-react`. Motion is CSS plus small hooks and respects `prefers-reduced-motion`.

```bash
npm install
npm run dev        # local dev server
npm run build      # typecheck + production build → dist/
npm run preview    # serve dist/ locally
```

## Pages
| Route | What |
|---|---|
| `/` | Loader → interactive sky hero → intro → **Selected work** (real projects, discipline filters) → **Visual design** gallery → About / Contact teasers |
| `/work/:slug` | Editorial project page: hero, sticky section nav, asymmetric image blocks, themed panels, lightbox with next/previous, prev/next project |
| `/about` · `/contact` · `/resume` | Interactive desk · envelope + letter form · on-page resume + PDF |

## Adding or editing a project — `src/data/projects.ts`
1. Put optimised images in `public/images/projects/<slug>/` (webp or jpg, ≤ 2000 px wide, descriptive names, e.g. `moodboard.webp`).
2. Add a `Project` entry. Every image needs its real pixel size `{ src, w, h, alt, caption }` so layouts never jump.
3. Build each section from blocks: `image` (full / wide / narrow) · `pair` · `split` (image + copy) · `text` · `palette` · `keywords`.
   Give a section a `theme` to place it in its own tinted panel (used by NOAH to keep three directions visually separate).
4. `featured` sets the order on the homepage (1 = first). `discipline` (`ui` | `brand` | `graphic`) drives the filter chips,
   which appear automatically once more than one discipline exists. `accent` picks the 3D objects shown on the card.
5. Only describe what the artwork shows. Leave a detail out rather than inventing it.

The page layout, sticky navigation, progress bar, lightbox (correct image, aspect ratio preserved, Esc / backdrop / close button,
next/previous across the page) and prev/next links are generated from that one entry.

**Visual design gallery:** `src/data/gallery.ts` — add items that point at images already in `public/images/projects/`.
`size`: `feature`/`wide` (8 cols) · `square` (4) · `half` (6). Keep rows tiling to 12 columns.

## Other content
| What | Where |
|---|---|
| Name, links, experience, education, skills, tools, portrait | `src/data/personal.ts` (portrait: put a file in `public/images/profile/`, set `portrait`) |
| Resume PDF | replace `public/resume/jeet-gohel-resume.pdf` |
| WhatsApp link | `whatsapp` in `personal.ts` |
| Contact form email service | `VITE_CONTACT_ENDPOINT` (see `.env.example`); without it the form opens the visitor's email app via `mailto:` |

## Design system
Tokens in `src/styles/base.css`: Bricolage Grotesque (display) + Instrument Sans (text) self-hosted via `@fontsource-variable`;
warm paper / charcoal / cobalt with coral, butter, lavender and mint accents; 4 px spacing scale; radius scale; one Lucide icon rule.
Motion + CSS-3D toolkit in `src/components/fx/` (SplitText, Magnetic, Cursor, Obj3D, PointerParallax, burst, Arrow).

## Deploying
Static SPA. `vercel.json` and `public/_redirects` provide the fallback to `index.html`.
