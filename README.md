# TPT Odyssey

An open-source AI-driven life-path and mastery engine, built by [TPT Solutions](https://tpt.co.nz).

Users complete a conversational AI intake, receive a personalised quest (narrative arc + milestones + tasks + resources), check in with AI after each milestone, and watch their quest adapt based on their wellbeing. Social features connect peers, mentors, and public quest journeys.

## Features

- **AI onboarding** — conversational intake extracts a psychological profile (Big Five, curiosity type, motivation style, interests, latent talents)
- **Quest generation** — personalised narrative arc with ordered milestones, tasks, and curated resources
- **Adaptive check-ins** — AI scores mood, flow, and engagement after each milestone; adjusts remaining milestones when needed
- **Community** — peer matching by shared interests, mentor discovery, public quest sharing
- **Self-hostable** — Docker Compose setup with Postgres; no external auth service required

## Tech stack

- [Next.js 15](https://nextjs.org) App Router with React Server Components
- [Prisma 7](https://www.prisma.io) + PostgreSQL
- Internal JWT auth (bcryptjs + jose, httpOnly cookie)
- [OpenRouter](https://openrouter.ai) AI gateway (OpenAI-compatible, model-agnostic)
- [shadcn/ui v4](https://ui.shadcn.com) + Tailwind CSS v4

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL (or use Docker Compose)
- An [OpenRouter](https://openrouter.ai) API key

### Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Random secret for signing session JWTs — generate with `openssl rand -base64 32` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key |
| `OPENROUTER_DEFAULT_MODEL` | Model to use, e.g. `anthropic/claude-3.5-sonnet` |
| `NEXT_PUBLIC_APP_URL` | Public URL of your deployment |

### Run locally

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Run with Docker

```bash
docker compose up
```

This starts Postgres and the app. Migrations run automatically on startup. Pass all required env vars via a `.env` file or your Docker environment.

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type check

npx prisma studio    # Open DB browser
npx prisma migrate dev --name <name>   # Create a migration
```

## Project structure

```
src/
  app/
    (auth)/          # Sign-in / sign-up pages
    (main)/          # Authenticated app (dashboard, quest, profile, community)
    api/             # API routes (auth, AI, quests, milestones, tasks, community)
    onboarding/      # AI intake chat
    q/[shareId]/     # Public read-only quest page
  components/        # Shared UI components
  lib/
    ai/              # OpenRouter client, prompts, Zod schemas
    auth/            # JWT session utilities
    db/              # Prisma client singleton
prisma/
  schema.prisma      # Data model
```

## License

Copyright 2026 TPT Solutions. Licensed under the [Apache License, Version 2.0](LICENSE).
