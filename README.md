# Kanban API

GraphQL API for the [Kanban Task Management App](https://github.com/ayreese/kanban-task-management-app).
Built with Apollo Server 4, Nexus and Prisma on Postgres.

## Requirements

- Node.js 22 (pinned in `.node-version`; Node 25+ breaks `jsonwebtoken`)
- A Postgres database (local, Docker, or hosted, e.g. Neon, Supabase, Railway)

## Run locally

```bash
# 1. Start Postgres (skip if you already have one)
docker run -d --name kanban-db -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:16

# 2. Configure
cp .env.example .env
# set JWT_SECRET to a long random string

# 3. Install, create the tables, start
npm install
npm run db:migrate
npm run dev
```

The API runs at http://localhost:4000. Then start the frontend, which expects the API at that address by default.

## Deploy

1. Create a hosted Postgres database and set `DATABASE_URL`.
2. Set `JWT_SECRET` (a long random value, never the example) and, if needed, `PORT`.
3. Build: `npm install && npm run build`
4. Run migrations: `npm run db:migrate`
5. Start: `npm start`

Point the frontend's `NEXT_PUBLIC_API_URL` at the deployed URL.

## Auth

`login` and `signUp` return a JWT valid for one day. Send it as
`Authorization: Bearer <token>`. Every query and mutation other than
`login` and `signUp` requires it, and only returns or changes data that
belongs to the signed-in user.
