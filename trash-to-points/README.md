# Trash-to-Points Community Initiative — full-stack website

A **browser-based** rewards website (not a mobile app) for a university-style project: residents register, submit **photo proof** of disposals with a **bin code or QR value**, wait for **admin approval**, earn **1 point per verified item**, and **redeem rewards** with unique codes. Admins review images, correct quantities, manage bins and users, and mark redemptions as claimed.

**Repository layout:** `trash-to-points/` (this folder) contains **`client/`** (React + Vite) and **`server/`** (Node + Express). This matches a clean `client` / `server` split for deployment.

---

## Default logins (after `npm run seed`)

Sign in with **username + password** (not email).

**Admin**

| Field        | Value                    |
| ------------ | ------------------------ |
| **Username** | `admin`                  |
| **Password** | `admin123`               |
| **Role**     | `admin`                  |
| **User id**  | `1` (seeded first)       |

**Residents cannot register as admin.** Only `role = resident` is allowed on `POST /api/auth/register`. The demo admin is created only via seed data.

**Demo residents**

| Username | Password      |
| -------- | ------------- |
| `alex`   | `resident123` |
| `jordan` | `resident123` |
| `sam`    | `resident123` |

Use **Login** for everyone; use **Admin login** in the nav for a shortcut to the same page with a hint.

---

## Website features

### Public

- Home (hero, about, how it works, rewards teaser, event summary, budget, CTA)
- About, Rewards catalog, Budget, Event details
- Register (residents only), Login (JWT for residents and admins)

### Residents (JWT + sidebar)

- Dashboard, **New submission** (image + bin code/QR + quantity → status **Pending**)
- My submissions, My points, My rewards / redemptions (shows **redemption codes**)
- My profile

### Admins (JWT + sidebar)

- Dashboard, **Statistics**
- **Review submissions** (view photo, set verified quantity, approve/reject — **points only on approve**)
- Manage bins (codes + QR values), Manage users, Manage rewards, Manage redemptions (**mark claimed**), Manage events

### Rules implemented in the API

- **Points are never automatic** on upload; only `PUT /api/admin/submissions/:id/review` with `Approved` adds points.
- **1 verified item = 1 point** (`admin_verified_quantity` on approval).
- Redemptions: **Active → Claimed** at pickup via admin; codes generated on redeem.

---

## Tech stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18 + Vite                     |
| Styling  | Plain CSS (`client/src/index.css`)  |
| Backend  | Node.js + Express                   |
| Database | PostgreSQL (e.g. Supabase) via `pg` |
| Auth     | JWT + bcrypt (`password_hash`)      |
| Uploads  | `multer` → `server/uploads/`      |

---

## Environment variables

### Server (`server/.env`)

Copy `server/.env.example` to `.env`.

| Variable        | Description |
| --------------- | ----------- |
| `DATABASE_URL`  | Postgres connection URI (required). Must be a real URL — do not leave template text with `[brackets]` in the host; URL-encode special characters in the password (`@` → `%40`, etc.). |
| `JWT_SECRET`    | Long random string (required) |
| `PORT`          | API port (default `3001`) |
| `FRONTEND_URL`  | Comma-separated allowed origins for CORS. Local dev example: `http://localhost:8000,http://127.0.0.1:8000,http://[::1]:8000`. Leave empty to allow all origins (dev only). |

### Client (`client/.env.local`)

| Variable         | Description |
| ---------------- | ----------- |
| `VITE_API_URL`   | **Production:** API origin without trailing slash, e.g. `https://your-api.onrender.com`. **Local dev:** leave empty — Vite proxies `/api` and `/uploads` to the backend. |
| `VITE_DEV_API_PROXY` | Optional override for proxy target (default `http://127.0.0.1:3001`). |

---

## Installation & local run

**Prerequisites:** Node.js 18+ and a **PostgreSQL** database reachable from `DATABASE_URL` in `server/.env`.

### Local database with Docker (recommended if you see `ECONNREFUSED` on port 5432)

Nothing is listening on `localhost:5432` until Postgres runs. Easiest fix:

1. Install and start **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (Windows).
2. From the **`trash-to-points`** folder, run **`start-db.cmd`**, or from **`server`** double-click **`db-up.cmd`**, or run **`npm run db:up`** (all run `docker compose up -d`).
3. Keep **`DATABASE_URL`** as in `.env.example` (`postgres` / `postgres` / `trash_points` on `127.0.0.1:5432`).

Stop the DB later: `docker compose down` (same folder). Data persists in the Docker volume `ttp_pgdata`.

### Windows: `docker` is not recognized (but Docker Desktop is installed)

Docker’s `docker.exe` is usually at **`C:\Program Files\Docker\Docker\resources\bin`**. Cursor’s terminal sometimes does not put that folder on `PATH`. This repo’s **`server\db-up.cmd`** and **`npm run db:up`** prepend that folder automatically. If you still see “docker not found”, open **Docker Desktop** once (finish setup), or add that `bin` folder to your user **Path** in Environment Variables.

### Windows: `npm` or `node` is not recognized

Node is installed, but **`C:\Program Files\nodejs`** is missing from your **PATH**. Fix it properly:

1. Press **Win**, search **environment variables** → **Edit environment variables for your account**.
2. Under **User variables** (or **System**), select **Path** → **Edit** → **New**.
3. Add: `C:\Program Files\nodejs`
4. **OK** all dialogs, then **fully quit and reopen Cursor** (or open a **new** terminal).

**Or** for one terminal session only, run this first, then `npm run dev` as usual:

```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
```

**Or** use the helpers (prepend Node to PATH, then start dev):

- **`server\dev.cmd`** / **`client\dev.cmd`** — double-click or run from **Command Prompt** / PowerShell (`.\dev.cmd`). No need for `npm` on PATH.
- **`server\dev.ps1`** / **`client\dev.ps1`** — from an **already open** PowerShell: `cd server` then `.\dev.ps1` (do **not** nest `powershell -File` if `powershell` is not on your PATH).

```powershell
cd server
.\dev.ps1
```

```powershell
cd client
.\dev.ps1
```

### 1. Database schema

Schema **v2** runs once automatically when the API starts (`ensureSchema`). It records version `2` in `_ttp_schema_version`.  
If you upgrade from an older prototype in the same database, the migration **drops** legacy tables once — **back up data** if needed.

### 2. Server

```bash
cd server
npm install
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, FRONTEND_URL (see server/.env.example — port 8000 for Vite dev)
npm run dev
```

Optional demo data (bins, rewards, admin id=1, sample submissions/redemptions):

```bash
npm run seed
```

### 3. Client

```bash
cd client
npm install
cp .env.example .env.local
# Leave VITE_API_URL empty for local dev
npm run dev
```

Open **http://localhost:8000** (or **http://[::1]:8000**) in a desktop or mobile browser. The dev server listens on all interfaces (`host: true`), so terminal output like `http://[::]:8000` means “serving on IPv6” — use **localhost** or **[::1]** in the browser.

**Parent folder launcher:** from `Trash-to-Points` (parent of `trash-to-points`), `python -m launcher` can start both if configured.

---

## REST API (summary)

| Method | Path | Notes |
| ------ | ---- | ----- |
| POST | `/api/auth/register` | Body: `username`, `full_name`, `password`, optional `email` |
| POST | `/api/auth/login` | Body: `username` (or `name`), `password` |
| GET | `/api/users/me` | Current user |
| GET | `/api/users` | Admin: list users (search `?search=`) |
| POST | `/api/submissions` | Resident: `multipart` fields `image`, `bin_code`, `user_reported_quantity` |
| GET | `/api/submissions/my` | Resident |
| GET | `/api/admin/submissions` | Admin (`?status=Pending`) |
| PUT | `/api/admin/submissions/:id/review` | Body: `status`, `admin_verified_quantity` (if Approved), `admin_note` |
| GET | `/api/rewards` | Public list |
| POST/PUT/DELETE | `/api/rewards`, `/api/rewards/:id` | Admin |
| POST | `/api/redemptions` | Resident: `{ reward_id }` |
| GET | `/api/redemptions/my` | Resident |
| GET | `/api/admin/redemptions` | Admin |
| PUT | `/api/admin/redemptions/:id/claim` | Admin: mark **Claimed** |
| GET | `/api/bins` | Public bin list |
| GET/POST/PUT/DELETE | `/api/admin/bins`, `/api/admin/bins/:id` | Admin |
| GET | `/api/admin/users` | Admin |
| GET | `/api/admin/stats` | Admin dashboard |
| GET/POST/PUT | `/api/events`, `/api/events/:id` | Public read; write admin |
| GET | `/api/health` | Health check |

Static files: **`GET /uploads/...`** (images saved by the API).

---

## Deploying publicly (e.g. QR code to the site)

1. **API (e.g. Render):** root `server`, `npm install`, `npm start`, set `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` to your real site URL(s).
2. **Website (e.g. Vercel):** root `client`, build `npm run build`, set **`VITE_API_URL`** to the API origin (no `/api` suffix).
3. Point a **QR code** to your **production website URL** (the Vercel URL), not localhost.
4. Ensure uploaded files persist: on ephemeral hosts, configure **persistent disk** for `server/uploads` or switch storage to S3/Supabase Storage in a future iteration.

---

## Future improvements

- Cloud storage for images (S3 / Supabase Storage) instead of local `uploads/`
- Email verification / password reset
- Rate limiting and audit log for admin actions
- PWA manifest for “Add to Home Screen” (still a website)

---

## License

Educational / student project — use and modify freely for coursework.
