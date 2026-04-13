# svelte-messenger

A real-time one-to-one chat app built with Svelte, Express, and Socket.io, now with persisted user accounts and admin user management.

## Features

- Account registration and login with bcrypt password hashing
- JWT-based authentication and role-based admin access
- Admin panel for listing users, granting/revoking admin role, and deleting users
- Private one-to-one messaging over Socket.io namespaces
- Online buddy list and typing/keyboard activity indicators
- Local SQLite persistence via Drizzle ORM

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | Svelte 4, Vite, Socket.io-client |
| Backend | Node.js, Express, Socket.io |
| Auth | bcryptjs, jsonwebtoken |
| Data | SQLite (better-sqlite3), Drizzle ORM + Drizzle Kit |
| Testing | Playwright |

## Prerequisites

- Node.js >= 18
- npm

## Setup

```bash
git clone <repo-url>
cd svelte-messenger
npm install
```

Copy environment defaults:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Environment Variables

See `.env.example` for all options.

- `PORT`: backend port (default `4000`)
- `JWT_SECRET`: JWT signing key (required in production)
- `ALLOWED_ORIGINS`: comma-separated CORS origins for frontend URLs
- `DATABASE_URL`: SQLite file path (default `./messenger.db`)

## Running the App

Run frontend and backend in separate terminals.

Terminal 1 (frontend Vite dev server):

```bash
npm run dev
```

Terminal 2 (backend API + Socket.io server):

```bash
npm run start
```

By default:

- Frontend: http://localhost:5000
- Backend/API: http://localhost:4000

## Database Commands

```bash
npm run db:generate
npm run db:push
npm run db:migrate
npm run db:studio
```

## Testing

```bash
npm test
```

## Project Structure

```
├── server.ts                # Express API + Socket.io backend
├── drizzle.config.ts        # Drizzle Kit config
├── src/
│   ├── db/
│   │   ├── index.ts         # Drizzle database client
│   │   └── schema.ts        # Database schema
│   ├── App.svelte           # Root app shell
│   ├── types.ts             # Shared frontend types
│   └── components/
│       ├── Auth.svelte
│       ├── ChatBuddies*.svelte
│       └── AdminPanel.svelte
└── tests/                   # Playwright tests
```
