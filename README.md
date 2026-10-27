# Hotel Planner (MEAN Stack)

A personal project: a full-stack hotel search and planning app I built solo for a web development class, using an evolutionary development model. It is a portfolio piece built to production standards. It is not a commercial booking service, and it does not take reservations or payments.

Live demo: https://hotel-planner-black.vercel.app (also embedded as the "Hospitality OS" card on https://www.carter-portfolio.fyi/projects)

## What it does

- Browse and search hotels by location (text search), price range, and star rating, with paginated results
- Hotel detail pages with amenities, price per night, and ratings that merge the listing rating with in-app review averages
- Accounts: register, log in, and log out with Passport.js local strategy and hashed passwords (bcryptjs)
- Save hotels to a personal list, and write, edit, and delete your own reviews
- Admin moderation: list users with their reviews, toggle roles and bans, delete users and reviews
- Password reset by email when SMTP is configured (see below)

## Project Structure

- **/backend**: Express.js server, MongoDB models, and API routes. Also serves the built frontend from `backend/public` when run standalone.
- **/frontend**: Angular 21 application (standalone components, Signals) for the user interface.
- **/api**: Serverless entry point for Vercel deployment (`api/index.js` loads the Express app).

## Setup and Installation

From the project root, run:

```bash
npm run install-all
```

Create a `.env.local` file in the project root (the backend also checks `backend/.env.local`) with:

```bash
MONGODB_URI=<your MongoDB connection string>
SESSION_SECRET=<a long random string>
```

Optional, for password reset email and reset links:

```bash
FRONTEND_URL=<public base URL of the frontend, for example https://hotel-planner-black.vercel.app>
SMTP_HOST=<smtp host>
SMTP_PORT=587
SMTP_USER=<smtp username>
SMTP_PASS=<smtp password>
SMTP_FROM=<from address>
```

If the SMTP variables are not set, no reset email is sent. The reset link is logged to the server console instead, which is enough for local development, and the server logs say plainly that no email went out.

## Running the Application

From the project root:

- **Development**: starts the backend (port 3000) and frontend (port 4200) together. The Angular dev server proxies `/api` to the backend (see `frontend/proxy.conf.json`).
  ```bash
  npm run dev
  ```
- **Production-style processes** (still both processes, without the dev watcher):
  ```bash
  npm start
  ```
- **Port-finding launcher**: picks free ports, generates the proxy config for them, and starts both servers. Works on Windows, macOS, and Linux.
  ```bash
  npm run dev:launcher
  ```
- **Backend only**, serving the committed frontend build in `backend/public`:
  ```bash
  npm run start --prefix backend
  ```

## Deployment

One Vercel project deploys the whole app: the root `vercel.json` builds the Angular frontend as static output and routes `/api/*` to the Express app as a serverless function (`api/index.js`). The frontend calls the API same-origin under `/api`.

That single deployment is the live one (hotel-planner-black). There is no separate backend deployment: an earlier backend-only project no longer exists. `backend/vercel.json` is kept only in case a standalone backend deployment is ever wanted again.

For the live demo to work, the Vercel project needs the production environment variables `MONGODB_URI` and `SESSION_SECRET` set (plus `FRONTEND_URL` and the SMTP variables for password reset email). Without `MONGODB_URI`, `/api/health` reports `DEGRADED` with HTTP 503 and the data routes return 503.

Iframe embedding: responses set a Content-Security-Policy `frame-ancestors` that allows this app's own origin, `https://www.carter-portfolio.fyi` and `https://carter-portfolio.fyi` (the portfolio embeds the live demo), and Vercel preview domains. The allowlist lives in `backend/app.js` for API responses, in the root `vercel.json` for the static frontend, and in `backend/vercel.json` for a standalone backend deployment.

## Seed data (local development only)

`backend/scripts/seed-hotels.js` loads the public Azure sample hotel dataset (duplicated up to 5,000 listings so search and pagination have volume) and `backend/scripts/seed-users.js` creates sample users and reviews. These are development fixtures with sample data, not real properties or real users, and should never be run against a database you care about: both scripts delete existing data first. `backend/scripts/promote-admins.js` promotes the accounts listed in that file to admin.
