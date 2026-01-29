# ChopNow

Food rescue marketplace connecting businesses with surplus food to consumers.

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT auth, Cloudinary
- **Frontend:** React, Vite, Tailwind CSS

---

## Development

### Backend

```bash
cd Backend
cp .env.example .env
# Edit .env: set MONGO_URI (local or Atlas), JWT_SECRET
npm install
npm run dev
```

API: `http://localhost:5000`. Health: `GET /health`, ready: `GET /ready`.

### Frontend

```bash
cd Frontend
cp .env.example .env
# .env: VITE_API_URL=http://localhost:5000 for local backend
npm install
npm run dev
```

App: `http://localhost:5173`. Sign up: `/signup`, Login: `/login`.

---

## Production Deployment

### 1. Backend environment variables

Set these on your backend host (e.g. Render, Railway, Fly.io). Do **not** commit real values.

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` |
| `PORT` | No | Port (default `5000`) |
| `MONGO_URI` | Yes | MongoDB connection string (e.g. `mongodb+srv://...`) |
| `JWT_SECRET` | Yes | Strong secret, ≥32 characters (no placeholders) |
| `ALLOWED_ORIGINS` | Yes (prod) | Comma-separated frontend URL(s), e.g. `https://app.chopnow.com` |
| `LOG_LEVEL` | No | Logging level (`debug`, `info`, `warn`, `error`). Defaults to `info` in production |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |
| `RESEND_API_KEY` | For emails | Resend API key (for verification, password reset, OTP, order emails) |
| `FROM_EMAIL` | For emails | Sender email (e.g., `ChopNow <noreply@chopnow.app>`) |
| `FRONTEND_URL` | For emails | Frontend URL for email links (e.g., `https://www.chopnow.app`) |
| `SENTRY_DSN` | No | Sentry DSN for error tracking (leave unset to disable) |
| `SENTRY_TRACES_SAMPLE_RATE` | No | Sentry performance traces sample rate (0.0–1.0) |

Start command: `npm start` (runs `node server.js`). The server will exit on invalid or missing required env.

### 2. Frontend environment variables

Set at **build time** (e.g. in Vercel/Netlify dashboard or CI).

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL, no trailing slash (e.g. `https://api.chopnow.com`) |

Build: `npm run build`. Output: `dist/`.

### 3. Checklist

- [ ] Backend: `NODE_ENV=production`, real `MONGO_URI`, strong `JWT_SECRET`, `ALLOWED_ORIGINS` = your frontend origin(s)
- [ ] Frontend: `VITE_API_URL` = your backend URL
- [ ] MongoDB: network access / IP allowlist if Atlas
- [ ] HTTPS for both frontend and backend
- [ ] Optional: Cloudinary env for image uploads

### 4. Health checks

- `GET /health` → `{ "status": "ok" }`
- `GET /ready` → `{ "status": "ready", "database": "connected" }` when DB is up (503 otherwise)

Use these for load balancer or monitoring probes.
