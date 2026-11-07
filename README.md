# MITSPI Room Booking

Room booking for the computer labs at Maahad Integrasi Tahfiz Selangor Pandan Indah (MITSPI).
Teachers book a room without logging in. One admin manages bookings, school lists and holidays.

> **Status: UI demo.** There is no backend yet. Data lives in the browser and resets when the page reloads.
> The admin sign-in accepts any password. Do not use it for real bookings yet.

## Features

**Teachers** (no login)
- Book Makmal Komputer 1 or 2: pick a room, date and one or more 30-minute slots (7:30 AM – 6:30 PM).
- Tap a booked time to see who booked it (name, class, subject).
- See weekends, public holidays, school holidays and events as notes. They never block a booking.
- Contact the admin with the WhatsApp button.

**Admin**
- Bookings: filter by month, class, subject and room. Download a CSV or print to PDF.
- Day view: one day as a grid, time × room.
- Edit or remove a booking until it starts.
- School lists: add, rename or hide rooms, classes and subjects.
- Holidays and events: update public holidays from Google (works only with `npm run dev` in the demo),
  add school holidays and events.

## Run it

Needs Node.js 22 or newer.

```sh
npm install
npm run dev      # http://localhost:5173
```

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `node scripts/fetch-holidays.mjs 2026 2027` | Refresh the starting public holidays (`src/data/holidays.json`) |

The admin pages are under `/admin`. Sign in with any email and password (demo only).

## Settings

| Setting | File |
|---|---|
| School name, opening hours, starting rooms, classes, subjects | `src/data/school.ts` |
| Admin WhatsApp number (`ADMIN_WHATSAPP`, still a placeholder) | `src/data/school.ts` |
| Colours (theme tokens) | `src/index.css` |

The WhatsApp number is public in the page. Use the school's number, not a personal one.

## Stack

Vite 8, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, React Router.

## Project structure

| Folder | Holds |
|---|---|
| `src/app/` | App frame: router, navbar, sidebar, page list (`pages.ts`) |
| `src/features/` | One folder per feature: `booking`, `auth`, `school-lists`, `holidays` |
| `src/components/` | Parts shared by 2+ features. `ui/` holds the shadcn components. |
| `src/data/` | School settings and the shared stores (lists, calendar) |
| `src/lib/` | Pure logic: time formats, CSV, holiday feed |
| `docs/` | Design: [architecture](docs/architecture.md), [database](docs/database.md) |

A feature never imports another feature. Full rules: [CLAUDE.md](CLAUDE.md).

## Plan (not built yet)

Decided 21 Oct 2026, all on free plans:

- **Cloudflare Pages** hosts the site. Every push to `main` deploys.
- **Supabase** adds the database, admin sign-in (Auth), access rules (RLS) and two Edge Functions.
- **Cloudflare Turnstile** stops scripts on the booking form.
- A **GitHub Actions** job keeps the free Supabase project awake (Sunday and Wednesday).

Only the store files change. The pages stay the same. Details: [docs/architecture.md](docs/architecture.md) section 4.

---

© 2026 Maahad Integrasi Tahfiz Selangor Pandan Indah

# mitspi-sys
