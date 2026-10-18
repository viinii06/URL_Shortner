# snip. — a tiny URL shortener

Minimal full-stack URL shortener built for a 45-minute workshop.

- **Frontend:** React + Vite
- **Backend:** Node.js + Express, SQLite via the built-in `node:sqlite`
- **Auth:** phone OTP via the [MiniMoth](https://minimoth.dev/docs) API

## Features
- Sign up / log in with a one-time code sent to your phone
- Shorten any `http(s)` URL
- See your links with click counts, and copy them
- Short links redirect at `http://localhost:5050/<code>`

## Project structure
```
backend/   server.js (5 endpoints), db.js (users, sessions, links), minimoth.js
frontend/  src/pages/Login.jsx, src/pages/Links.jsx
```

## API
| Method | Path                   | Auth | Description              |
|--------|------------------------|------|--------------------------|
| POST   | `/api/auth/send-otp`   | –    | Send an OTP to `phone`   |
| POST   | `/api/auth/verify-otp` | –    | Verify `code`, get token |
| POST   | `/api/links`           | ✓    | Create a short link      |
| GET    | `/api/links`           | ✓    | List your links          |
| GET    | `/:code`               | –    | Redirect to original URL |

## Setup
Requires **Node.js 22.13+** (for built-in `node:sqlite` and `--env-file`).

### 1. Backend
```bash
cd backend
cp .env.example .env      # set MINIMOTH_API_KEY (get one at app.minimoth.dev)
npm install
npm start                 # http://localhost:5050
```

### 2. Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev               # http://localhost:5173
```

Open http://localhost:5173, enter your phone number in international format (e.g. `+919876543210`), enter the OTP, and start shortening.

> The Vite dev server proxies `/api` to the backend, so no CORS configuration is needed.
