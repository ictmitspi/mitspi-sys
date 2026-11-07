# MITSPI System — MVP (UI only)

Goal: a clickable demo for the teacher. No API, no database, no backend yet.
Bookings live in React state. They reset when the page reloads.

## Stack
- Vite 8 + React 19 + TypeScript
- Tailwind CSS 4. Theme tokens are in `src/index.css`.
- shadcn/ui components in `src/components/ui/` (added by the shadcn CLI)

## Commands
- `npm run dev` — start the dev server
- `npm run build` — type-check and build. Run it before you say "done".
- `npx shadcn@4.22.1 add <name>` — add a shadcn component
- `node scripts/fetch-holidays.mjs 2026 2027` — refresh the starting list of public holidays (`src/data/holidays.json`). The admin can also update them in the app ("Holidays and events", needs `npm run dev` in the demo).

## Booking rules (from the teacher)
- 2 rooms (Makmal Komputer 1 and 2), 10 classes and 25 subjects: the school's lists in `src/data/school.ts`.
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
- Admin also keeps rooms, classes and subjects on "School lists" (hide, not delete).
- Admin keeps school holidays (cuti sekolah) and events up to date each term (answered 20 Oct 2026).
- A booking that has started is read-only.
- Today the admin sign-in is a mock (any password). Real checks come with the API.
- Full design: `docs/architecture.md` (flows, API, security), `docs/database.md` (tables).

## Open questions for the teacher
- None right now. All answered on 20 Oct 2026.

## Structure
- `src/app/` — app frame: `App.tsx`, navbar, sidebar, and `pages.ts` (the list of pages)
- `src/features/<name>/` — one folder per feature: its page, components, logic, types.
  Today: `booking/`, `auth/`, `school-lists/`, `holidays/`.
- `src/components/` — parts shared by 2+ features (`StepLayout`)
- `src/components/ui/` — shadcn components. Do not edit by hand unless needed.
- `src/data/` — `school.ts` (name, hours, starting lists), `school-lists.tsx` (rooms, classes, subjects store), `school-calendar.tsx` (holidays and events store), `holidays.json` (starting public holidays)
- `src/lib/` — shared pure logic (`time.ts`, `csv.ts`, `holiday-feed.ts`). No React.
- `src/hooks/` — shared React hooks (`use-mobile.ts`)
- `scripts/` — Node scripts run by hand (`fetch-holidays.mjs`)
- `src/assets/` — images that the code imports (logo, 128 px)
- `design/` — source files (full-size logo). The app does not import them.

## Add a new feature
1. Make `src/features/<name>/` with `<name>-page.tsx` that exports the page component.
2. Add one line to `PAGES` in `src/app/pages.ts` (path, label, icon, page).
   It gets a URL (react-router) and a sidebar link.
3. A feature imports from `src/components/`, `src/lib/` and `src/data/`.
   It never imports from another feature. Move a shared part to `src/components/` first.
4. Data that 2+ pages share lives in one store (example: `features/booking/bookings-store.tsx`).
   When the API comes, only the store changes.

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

## Later (not in the MVP)
- Backend (decided 21 Oct 2026): Cloudflare Pages (site) + Supabase free (database, Auth, RLS, Edge Functions)
  + Cloudflare Turnstile (robot check). No Spring Boot. Plan in `docs/architecture.md` section 4.
- Deploy: private GitHub repo → Cloudflare Pages builds on every push. Not a git repo yet.
- Supabase free pauses after 7 days idle: GitHub Actions keep-alive job, Sun + Wed. No free backups: monthly CSV.
- Only the store files change when Supabase comes. The pages stay the same.
- Tell the teacher about an admin change: "Send on WhatsApp" button first (no numbers stored).
- The database must check again that the slot is free on submit (`create_booking`, `booking_slot` key).
  Two teachers can submit the same slot at the same time.
- Teacher → admin contact: floating WhatsApp button (`ADMIN_WHATSAPP` in `src/data/school.ts`, still a placeholder).

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
