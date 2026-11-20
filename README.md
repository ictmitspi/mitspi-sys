# MITSPI Room Booking

Room booking for the computer labs at Maahad Integrasi Tahfiz Selangor Pandan Indah (MITSPI).
Teachers book a room without logging in. One admin manages bookings, school lists and holidays.

**Live:** https://mitspi.pages.dev (since 19 Nov 2026). The admin pages are under `/admin`.

## Features

**Teachers** (no login)
- Book Makmal Komputer 1 or 2: pick a room, date and one or more 30-minute slots (7:30 AM – 6:30 PM).
- Tap a booked time to see who booked it (name, class, subject).
- See weekends, public holidays, school holidays and events as notes. They never block a booking.
- Contact the admin with the WhatsApp button.

**Admin** (signs in)
- Bookings: filter by month, class, subject and room. Download a CSV or print to PDF.
- Day view: one day as a grid, time × room.
- Edit or remove a booking until it starts, then tell the teacher on WhatsApp.
- School lists: add, rename or hide rooms, classes and subjects. Set the WhatsApp number.
- Holidays and events: update public holidays from Google, add school holidays and events.
- Change password. Forgot it? "Forgot password?" on the sign-in page emails a reset link.

## Accounts

Every service uses the school ICT account `ictmitspi`. To hand over the system, hand over that
account, then change its password. Never move a service to a personal account.

| Service | Used for | Where |
|---|---|---|
| GitHub | Code (private repo `ictmitspi/mitspi-sys`), keep-alive job | github.com |
| Cloudflare | Hosting (Pages project `mitspi`), robot check (Turnstile) | dash.cloudflare.com |
| Supabase | Database, admin sign-in, Edge Functions (project `ict-booking`, Singapore) | supabase.com/dashboard |

The app's admin sign-in is a separate user in Supabase Auth (see "Add or replace the admin").
All services are on free plans.

## Routine tasks (admin)

| When | Task | Where in the app |
|---|---|---|
| Each month | Download the CSV and save it to the school Drive. Supabase free has no backups. | Bookings → Download CSV |
| Each term | Add the school holidays and events | Holidays and events |
| Each term, and in December | Update the public holidays (Islamic dates change when announced) | Holidays and events → Update from Google |
| When the admin changes | Change the WhatsApp number | School lists → bottom |

## Add or replace the admin

Do this for a new admin. For a forgotten password, use "Forgot password?" first (see below).
You need the `ictmitspi` login. Today the admin is the ICT person, with the `ictmitspi` email.

1. Open supabase.com/dashboard and sign in. Open the project `ict-booking`.
2. Go to Authentication → Users → Add user → Create new user.
3. Type the admin's email and a new password (8 characters or more). Tick "Auto Confirm User".
   Click "Create user".
   The reset email reaches only emails in the Supabase team (free plan). Use the `ictmitspi`
   email, or invite the new email to the team (Organization settings → Team).
   An email can belong to one user only.
4. Go to SQL Editor → New query. Paste this, change the name and email, then click "Run":
   ```sql
   INSERT INTO admin_user (id, name)
   SELECT id, 'Admin Name' FROM auth.users WHERE email = 'new.admin@example.com';
   ```
   The result must say "1 row". "0 rows" means the email is not the same as in step 3.
5. Sign in on https://mitspi.pages.dev/admin/sign-in with the new email and password.
6. On School lists, change the WhatsApp number if the admin changed.

Do not delete the old user. The change history of the bookings points to it.

## When something breaks

You do not need to know Supabase or Cloudflare for these steps. Sign in to each site with the
`ictmitspi` login. If a step says "ask a developer", the fix needs a code change.

### Nothing loads, or all bookings are gone
Supabase pauses a free project after 7 days without use. The keep-alive job stops that, but it can fail.
1. Open supabase.com/dashboard and sign in. Open the project `ict-booking`.
2. If it says the project is paused, click "Resume project". Wait a few minutes.
3. Open https://mitspi.pages.dev again. The bookings come back.
4. Open github.com/ictmitspi/mitspi-sys → Actions → "Keep Supabase Awake".
   The last run must have a green tick. If it is red, ask a developer.

A paused project can be resumed for up to 1 year. After that, only a backup file can be
downloaded from the dashboard, and a developer must rebuild the database.

### A change did not go live, or the new version is broken
1. Open dash.cloudflare.com and sign in. Go to Workers & Pages → `mitspi` → Deployments.
2. A failed build has a red mark. The last good version stays live, so teachers are not affected.
   Ask a developer to fix it. Send them the build log (click the failed deployment).
3. If the newest version is live but broken: find the last good deployment, open its menu (…),
   and click "Rollback to this deployment".

### Teachers see "The robot check failed" on every try
1. Open dash.cloudflare.com and sign in. Open Turnstile, then the widget for this site.
2. Check the hostname list. It must have `mitspi.pages.dev`. If the site has a new address, add it.

### "Update from Google" fails
The old holiday list stays, and teachers can still book. Try again the next day.
If it still fails, ask a developer. Google may have changed the feed (see
[docs/architecture.md](docs/architecture.md) → Holidays; logs: Supabase → Edge Functions → `holiday-feed` → Logs).

### The admin forgot the password
1. Open https://mitspi.pages.dev/admin/sign-in. Tap "Forgot password?".
2. Type the admin email. Tap "Send reset link".
3. Open the email (check spam) and tap the link. "Change password" opens, already signed in.
4. Type a new password twice. Tap "Save password".

Supabase sends at most 2 emails per hour (free plan). No email after 1 hour? Check
Supabase → Logs → Auth. If the reset still fails, follow "Add or replace the admin" above,
with another email (for Gmail, `ictmitspi+2@gmail.com` reaches the same inbox).

To change the password while signed in: sidebar → Admin → Change password.

## Run it locally (developer)

Needs Node.js 22 or newer.

1. Make a file `.env` in the project folder (it is gitignored):
   ```
   VITE_SUPABASE_URL=...              # Supabase → Project Settings → API
   VITE_SUPABASE_PUBLISHABLE_KEY=...  # Supabase → Project Settings → API keys (publishable)
   VITE_TURNSTILE_SITE_KEY=...        # Cloudflare → Turnstile → the widget
   ```
   These 3 values are public. Never put a secret key in `.env` or in the code.
2. Run:
   ```sh
   npm install
   npm run dev      # http://localhost:5173
   ```

| Command | Does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build to `dist/`. Run it before each push. |
| `npm run preview` | Serve the built `dist/`, as Cloudflare does |

The local app uses the **live database**. A test booking is a real booking: remove it after the test.

## Change and deploy (developer)

| Change | How it goes live |
|---|---|
| App code (`src/`) | Push to `main`. Cloudflare builds and deploys in about 1 minute. |
| Database (`supabase/sql/`) | Add the next numbered file and run it in the Supabase SQL editor. Download the CSV first. |
| Edge Functions (`supabase/functions/`) | Edit and deploy in the Supabase dashboard, then copy the code back to the repo. A push does not deploy them. |
| Secrets (Turnstile secret key) | Supabase → Edge Functions → Secrets only. Never in the repo. |

## Settings

| Setting | Where |
|---|---|
| Rooms, classes, subjects | In the app: School lists |
| Admin WhatsApp number (public) | In the app: School lists → bottom |
| Holidays and events | In the app: Holidays and events |
| Where the reset link goes | Supabase → Authentication → URL Configuration: Site URL `https://mitspi.pages.dev`, Redirect URLs `https://mitspi.pages.dev/admin/password` and `http://localhost:5173/admin/password` |
| Minimum password length (8) | Supabase → Authentication → Sign In / Providers → Email. Same as `MIN_LENGTH` in `src/features/auth/password-page.tsx`. |
| School name, opening hours, slot length | `src/data/school.ts` (a code change) |
| Colours (theme tokens) | `src/index.css` |

## Documentation

| File | Holds |
|---|---|
| [CLAUDE.md](CLAUDE.md) | Project rules, booking rules, structure, keys and secrets, how to add a feature |
| [docs/architecture.md](docs/architecture.md) | Flows, system design, security, decisions and why |
| [docs/database.md](docs/database.md) | Tables, RLS policies, database functions, the SQL files in order |
| [Teacher guide](https://claude.ai/artifact/LHyWVNHAeZzmabdttKmGcy) | For teachers: book a room, see who booked, ask for a change. Export to Word or PDF. |
| [Admin guide](https://claude.ai/artifact/7HL6TRF3bhiG9fYK3kj8An) | For the admin: every admin page, routine tasks, common problems. Export to Word or PDF. |

## Stack

Vite 8, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, React Router,
Supabase (Postgres, Auth, Edge Functions), Cloudflare Pages and Turnstile, GitHub Actions.

---

© 2026 Maahad Integrasi Tahfiz Selangor Pandan Indah
