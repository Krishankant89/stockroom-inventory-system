# Stockroom — Inventory Tracking System

A full-stack inventory management app: authentication, products, categories,
suppliers, stock in/out transactions with a full audit trail, a live analytics
dashboard, and CSV export. Built with **React + Vite + Tailwind** on the
frontend and **Supabase** (Postgres + Auth) on the backend.

## Features

- Passwordless email-link and Google authentication through Supabase Auth
- Optional email/password sign-up, one profile per user
- Cloudflare Turnstile protection on email authentication forms
- Client-side input validation and normalization for authentication fields
- Database triggers validate and normalize profile data even when requests do not
  come from the UI
- MFA enrollment and verification with TOTP
- Account profile fields include full name, username, role, and deactivation status
- Products: SKU, price, cost, quantity, reorder level, category, supplier, location
- Stock in / stock out with reason notes — every movement is logged
- Categories & suppliers management
- Dashboard: total SKUs, units in stock, inventory value, low-stock alerts,
  top products chart, stock-by-category pie chart, recent movements
- Reports: CSV export of full inventory, net daily stock movement chart
- Low-stock detection driven by a per-product reorder level
- Responsive, works on mobile

## 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates
   all tables, a stock-transaction function, Row Level Security policies,
   account deactivation support, and a couple of starter categories/locations.
   Run [`supabase/account_rights.sql`](./supabase/account_rights.sql) as well
   if the original schema was already applied to an existing project.
3. Go to **Settings → API** and copy your **Project URL** and **anon public key**.
4. Under **Authentication → URL Configuration**, add the callback URL for each
   environment, such as `http://localhost:5173/login` and
   `https://your-domain.com/login`.
5. Enable the Google provider under **Authentication → Providers** if Google
   sign-in is required. Configure its OAuth credentials and callback URL using
   the values shown by Supabase.
6. (Optional) Under **Authentication → Providers**, turn off "Confirm email"
   if you want instant password sign-up during testing.

## 2. Configure the frontend

```bash
cp .env.example .env
```

Fill in `.env`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
# Optional: override the default `${window.location.origin}/login` callback.
VITE_AUTH_REDIRECT_URL=http://localhost:5173/login
```

The Supabase URL must be the hosted project URL (for example,
`https://your-project-ref.supabase.co`), not `localhost` or `127.0.0.1`.
Create the Turnstile site key in Cloudflare and configure the matching secret
in the Supabase Auth CAPTCHA settings. Environment variables are embedded into
the build, so configure them before running the build or deploying.

Authentication fields are normalized and validated in the browser before being
sent to Supabase. The database schema also validates and normalizes email,
full-name, and username metadata in the auth trigger and profile trigger, so
client-side checks cannot be bypassed through DevTools or direct API requests.
Passwords are never sanitized or stored by this app; they are validated for
length and control characters, then handled by Supabase Auth.

## 3. Run locally

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`. Use **Send sign-in link** for an existing
account, **Create an account** for a new account, or **Continue with Google**.
Open the email link in the same environment where the request was made.

## 4. Build for production

```bash
npm run build   # outputs to /dist
npm run preview # sanity-check the production build locally
```

## 5. Deploy

The app is a static Vite build, so it deploys the same way on any of these.
In every case, set the environment variables
(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and
`VITE_TURNSTILE_SITE_KEY`) in the platform's dashboard —
they must be present **at build time** since Vite inlines them.

### Vercel
1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Vite**. Build command `npm run build`, output dir `dist`.
3. Add the two env vars under Project → Settings → Environment Variables.
4. `vercel.json` (included) handles client-side routing rewrites.

### Netlify
1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. `netlify.toml` (included) already sets build command `npm run build` and
   publish dir `dist`, plus the SPA redirect rule.
3. Add the two env vars under Site configuration → Environment variables.

### Render
1. New → **Static Site**, connect the repo.
2. `render.yaml` (included) preconfigures the build command and publish path.
3. Add the two env vars under Environment before the first deploy (Render
   needs them at build time for static sites).

### Railway
1. New Project → Deploy from GitHub repo.
2. Railway auto-detects Node via Nixpacks. Set the **Build Command** to
   `npm install && npm run build` and the **Start Command** to `npm start`
   (this repo's `start` script serves `dist/` with the `serve` package on
   Railway's assigned `$PORT`).
3. Add the two env vars in the Variables tab — again, before building, since
   they're baked in at build time.

## Project structure

```
src/
  pages/         Route-level pages (Dashboard, Products, Categories, ...)
  components/    Shared UI (Layout, Modal, StatCard, ConfirmDialog)
  context/       AuthContext (Supabase session/profile)
  lib/supabase.js  Supabase client
supabase/
  schema.sql     Full DB schema, RLS policies, and database functions
  account_rights.sql  Migration for existing projects
```

## Notes on data model

- `products.quantity` is always kept in sync via the `apply_stock_transaction`
  Postgres function — the frontend never writes `quantity` directly after
  creation, so the audit trail (`stock_transactions`) can never drift from
  the live count.
- RLS policies here allow any authenticated user full read/write access,
  which is fine for a single team/workspace. If you need per-role
  restrictions (e.g. staff can't delete products), tighten the policies in
  `schema.sql` using the `profiles.role` column that's already there.
- Deactivated accounts are marked in `profiles.deactivated_at`; the
  `deactivate_own_account()` function can be called by an authenticated user
  to deactivate their own account.
