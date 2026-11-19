# MITSPI System — room booking

Live at https://mitspi.pages.dev since 19 Nov 2026.
React app on Cloudflare Pages; data, admin sign-in and server code on Supabase (free plan).
One system for the school: new functions are added as new features (see "Add a new feature").

## Stack
- Vite 8 + React 19 + TypeScript
- Tailwind CSS 4. Theme tokens are in `src/index.css`.
- shadcn/ui components in `src/components/ui/` (added by the shadcn CLI)
- `@supabase/supabase-js` (client in `src/lib/supabase.ts`), `@marsidev/react-turnstile` (robot check)

## Commands
- `npm run dev` — start the dev server. Needs `.env` (see "Keys and secrets").
- `npm run build` — type-check and build. Run it before you say "done".
- `npx shadcn@4.22.1 add <name>` — add a shadcn component
- `node scripts/fetch-holidays.mjs 2026 2027` — writes `src/data/holidays.json`, a backup copy of the
  public holidays. The app does not read it: the admin updates the live list with "Update from Google".

## Booking rules (from the teacher)
- 2 rooms (Makmal Komputer 1 and 2), 10 classes and 25 subjects. They live in Supabase
  (starting rows: `supabase/sql/05-starting-data.sql`); the admin changes them on "School lists".
- Names: Title Case. Short forms (1B, BM) show in dashboard rows and closed filters;
  forms show "Name (SHORT)"; booking details and CSV use full names.
- App bar: logo + full school name. Footer: "© <year> MAAHAD INTEGRASI TAHFIZ SELANGOR PANDAN INDAH".
- Open 7:30 AM – 6:30 PM, in 30-minute slots.
- No past dates. On today, no slots that already started.
- One booking = one or more back-to-back free slots in one room.
- After submit, those slots are locked.
- Weekends, holidays and events never block booking (answered 20 Oct 2026). They only show a note;
  holidays and events also get a dot on the date.
- The admin updates public holidays ("Update from Google") and adds school holidays and events by hand.
- Teachers can tap a booked time to see who booked it (name, class, subject).

## Roles (answered 20 Oct 2026)
- Teacher: books a room. No login. Cannot edit or remove; asks the admin.
- Admin: one account for now (answered 20 Oct 2026). Signs in. Sees the dashboard, downloads reports, edits and removes bookings.
  After an edit or remove, "Tell the teacher on WhatsApp" opens WhatsApp with the message written.
- Admin also keeps rooms, classes and subjects on "School lists" (hide, not delete).
- Admin keeps school holidays (cuti sekolah) and events up to date each term (answered 20 Oct 2026).
- Admin sets the WhatsApp number behind the teachers' contact button ("School lists", bottom).
  Change it when a new admin takes over. It is public.
- A booking that has started is read-only.
- Admin sign-in: Supabase Auth (email + password). To add an admin: create the user in
  Supabase Auth, then insert its id into `admin_user`. Sign-ups are off.
- Full design: `docs/architecture.md` (flows, API, security), `docs/database.md` (tables).

## Open questions for the teacher
- None right now. All answered on 20 Oct 2026.

## Structure
- `src/app/` — app frame: `App.tsx`, navbar, sidebar, and `pages.ts` (the list of pages)
- `src/features/<name>/` — one folder per feature: its page, components, logic, types.
  Today: `booking/`, `auth/`, `school-lists/`, `holidays/`.
- `src/components/` — parts shared by 2+ features (`StepLayout`)
- `src/components/ui/` — shadcn components. Do not edit by hand unless needed.
- `src/data/` — `school.ts` (name, hours, shared types), the stores that talk to Supabase:
  `school-lists.tsx` (rooms, classes, subjects), `school-calendar.tsx` (holidays and events),
  `school-setting.ts` (admin WhatsApp number); `holidays.json` (backup copy, not used by the app)
- `src/lib/` — shared pure logic (`time.ts`, `csv.ts`, `holiday-feed.ts`) and `supabase.ts` (the client).
- `src/hooks/` — shared React hooks (`use-mobile.ts`)
- `scripts/` — Node scripts run by hand (`fetch-holidays.mjs`)
- `src/assets/` — images that the code imports (logo, 128 px)
- `design/` — source files (full-size logo). The app does not import them.
- `supabase/sql/` — the SQL run in the Supabase SQL editor, in order `01`–`08`. Rebuilds the database.
- `supabase/functions/` — Edge Functions: `create-booking` (Turnstile, then save), `holiday-feed` (Google feed).
- `.github/workflows/keep-alive.yml` — reads one row Sun + Wed so Supabase free does not pause.

## Add a new feature
1. Make `src/features/<name>/` with `<name>-page.tsx` that exports the page component.
2. Add one line to `PAGES` in `src/app/pages.ts` (path, label, icon, page).
   It gets a URL (react-router) and a sidebar link.
   An admin page loads with `lazy()` (copy an existing line), so teachers do not download it.
3. A feature imports from `src/components/`, `src/lib/` and `src/data/`.
   It never imports from another feature. Move a shared part to `src/components/` first.
4. Data that 2+ pages share lives in one store (example: `features/booking/bookings-store.tsx`).
   Only the store talks to Supabase. Pages never call `supabase` directly.
5. New tables: add the next numbered file in `supabase/sql/` (with RLS and policies), run it in the
   Supabase SQL editor, and add the table to `docs/database.md`.

## Design references
- shadcn MCP (`.mcp.json`): look up components and blocks before you build new ones.
- shadcn blocks: https://ui.shadcn.com/blocks
- Cal.com, open-source booking UI: https://github.com/calcom/cal.com
- Material 3 date pickers: https://m3.material.io/components/date-pickers
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines
- Project skill: `/booking-ui` for any UI work.
- Design skill: `/web-ui-design` for web UI/UX rules of thumb and the review loop.
- Code skill: `/software-best-practices` for modular, readable code and the OWASP check.
- Playwright MCP (`.mcp.json`): open the dev server and take screenshots to check the design.

## Backend and deploy (live, Nov 2026)
- Code: private GitHub repo `ictmitspi/mitspi-sys`. A push to `main` makes Cloudflare Pages build and deploy.
- Cloudflare Pages project `mitspi`: build `npm run build`, output `dist`. No `_redirects` needed:
  with no `404.html`, Pages sends every page link to `index.html`.
- Supabase project `ict-booking` (Singapore): Postgres with RLS on every table, Auth, 2 Edge Functions.
  Edge Functions are deployed in the Supabase dashboard; a git push does not update them.
- Double booking: the `booking_slot` primary key stops it, even when two teachers submit at once.
- Supabase free pauses after 7 days idle: the keep-alive job reads one row Sun + Wed, 9:00 AM Malaysia.
  No free backups: the admin downloads the CSV each month.

## Keys and secrets
| Value | Public? | Where it lives |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes (in the browser) | `.env` (local, gitignored), Cloudflare Pages variables |
| `VITE_TURNSTILE_SITE_KEY` | Yes | `.env`, Cloudflare Pages variables. Widget hostnames: `mitspi.pages.dev`, `localhost` |
| `TURNSTILE_SECRET_KEY` | **No** | Supabase → Edge Functions → Secrets only |
| Supabase secret key | **No** | Given to Edge Functions by Supabase (`SUPABASE_SECRET_KEYS`). Never in the app. |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` | Yes | GitHub → Settings → Secrets → Actions (for the keep-alive job) |

Never put a secret in code, a commit, logs or chat. A change to a `VITE_*` value needs a new build (push).

## Later
- A screen for `booking_history` (today the admin reads it in the Supabase dashboard).

## Avoid AI slop
AI slop is generic, decorated output that looks machine-made and adds nothing.
Each element must earn its place (NN/g heuristic 8, "Aesthetic and minimalist design").
If removing it loses nothing, remove it.
- Design: no gradients, glows, glass blur, or a shadow on every card. No default purple-blue
  palette: use the theme tokens in `src/index.css`. No emoji as icons, no sparkle icon for "AI", no decorative blobs.
  No generic hero text or three-feature-card grid by default.
- Content: no lorem ipsum, invented stats, fake reviews or fake testimonials.
- Words (UI text, docs, commits): plain and specific. No hype words ("seamless", "robust",
  "leverage", "elevate", "unlock", "powerful"). No emoji in headings, docs or commits.
  Buttons say verb + object ("Book room", not "Let's go!").
- Code: no comments that repeat the code, no generic names (`data`, `utils`, `manager`),
  no leftover `console.log`. Never invent a package, API or version: check that it exists.
- Before you hand over, ask: "Would a careful human expert make this?" Remove what fails.

## Save tokens
- Take a screenshot only after a UI change. For a small text change, run the build and skip it.
- Take all sizes (phone, tablet, desktop) once at the end, not after each edit.
- Read only the part of a file you need. Do not re-read a file you just edited.
- Use `/model haiku` for builds and screenshots, `/model sonnet` for small changes, `/compact` in a long session.
