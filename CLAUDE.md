# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npx tsc --noEmit     # TypeScript type check (no test suite exists yet)

npx prisma generate                        # Regenerate Prisma client after schema changes
npx prisma migrate dev --name <name>       # Create and apply a new migration
npx prisma migrate deploy                  # Apply pending migrations (production / Docker)
npx prisma studio                          # Open DB browser GUI
```

## Architecture

### What this is
TPT Odyssey is an open-source AI-driven "life-path and mastery" engine. Users complete a conversational AI intake → receive a personalised quest (narrative arc + milestones + tasks + resources) → check in with AI after each milestone → quest adapts based on their wellbeing scores. Social features: peer matching, mentors, public quest sharing.

### Key tech decisions
- **Next.js 15 App Router** with React Server Components for data fetching, client components for interactive UI
- **Prisma 7** with PostgreSQL. DB connection URL lives in `prisma.config.ts` (not `schema.prisma` — Prisma 7 breaking change)
- **Internal auth** — email+password credentials; bcrypt hashing via `bcryptjs`; JWT (HS256, 30-day) stored in httpOnly cookie via `jose`; session read server-side with `getSession()` from `src/lib/auth/session.ts`; middleware at `src/middleware.ts` protects all routes except `/`, `/sign-in`, `/sign-up`, `/q/[shareId]`, and `/api/auth/*`
- **OpenRouter** as the AI gateway (OpenAI-compatible API), defaulting to `OPENROUTER_DEFAULT_MODEL` env var. Three AI primitives in `src/lib/ai/client.ts`: `streamChat`, `chat`, `generateStructured`
- **shadcn/ui v4** uses `@base-ui/react` for primitives and Tailwind v4. The `Button` component was patched to add `asChild` via `@radix-ui/react-slot` (shadcn v4 dropped it)
- **Auth routes**: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout` — no auth required on these

### Route structure
```
/                          → Landing page (public)
/sign-in, /sign-up         → Clerk auth pages
/onboarding                → AI intake chat → creates Profile + first Quest
/dashboard                 → Quest card grid; redirects to /onboarding if no Profile
/quest/[id]                → Quest detail: milestones, tasks, resources
/quest/[id]/check-in       → AI check-in chat after milestone completion
/profile                   → Psychological profile view
/community                 → Peer matching / mentors / public journeys (tabs)
/q/[shareId]               → Public read-only quest page (no auth required)
```

### API routes
All under `src/app/api/`. Each protected route calls `getSession()` from `src/lib/auth/session.ts` and returns 401 if null.

| Route | Purpose |
|---|---|
| `POST /api/auth/register` | Create account, hash password, set session cookie |
| `POST /api/auth/login` | Verify credentials, set session cookie |
| `POST /api/auth/logout` | Clear session cookie |
| `POST /api/ai/onboarding-chat` | Streaming chat with onboarding system prompt baked in |
| `POST /api/ai/check-in-chat` | Streaming chat with check-in system prompt baked in |
| `POST /api/ai/chat` | Generic streaming chat (accepts optional systemPrompt in body) |
| `POST /api/profile` | Extract Profile from onboarding conversation + generate first Quest |
| `GET /api/profile` | Fetch current user's Profile |
| `GET /api/quests` | All user quests with milestones |
| `GET/PATCH /api/quests/[id]` | Single quest; PATCH handles status and share toggle |
| `PATCH /api/tasks` | Toggle task completion (verifies ownership via quest chain) |
| `POST /api/milestones/[id]/complete` | Mark milestone done, activate next, or complete quest |
| `POST /api/ai/check-in` | Extract CheckIn scores, optionally adapt quest milestones |
| `GET/PATCH /api/community` | Peer/mentor discovery; toggle mentor status |

### AI layer (`src/lib/ai/`)
- **`client.ts`** — Three exports: `streamChat` (returns ReadableStream), `generateStructured<T>` (JSON mode + Zod parse), `chat` (simple string response)
- **`prompts/`** — One file per AI interaction: `onboarding.ts`, `quest-gen.ts`, `check-in.ts`, `adapt-quest.ts`
- **`schemas/index.ts`** — Zod schemas for all structured AI outputs: `ProfileSchema`, `QuestSchema`, `CheckInResultSchema`, `AdaptedQuestSchema`

### Completion markers
The `ChatInterface` component watches for a string marker in the AI's response to know the conversation is done:
- Onboarding: `[PROFILE_READY]` — triggers profile extraction + quest generation
- Check-in: `[CHECKIN_READY]` — triggers score extraction + optional quest adaptation

### Data model summary
`User` → `Profile` (1:1, psychological data) → `Quest[]` → `Milestone[]` (ordered) → `Task[]` + `Resource[]`
`Milestone` → `CheckIn` (1:1, created after completion)
`User` ↔ `Connection` (bidirectional peer links)
`User` ↔ `Mentorship` (mentor/mentee roles)

Public sharing: `Quest.shareId` (nanoid) set via PATCH → exposes `/q/[shareId]`

### Environment variables required
See `.env.example`. Key ones:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — random 32+ char string for signing session JWTs (`openssl rand -base64 32`)
- `OPENROUTER_API_KEY`, `OPENROUTER_DEFAULT_MODEL` (e.g. `anthropic/claude-3.5-sonnet`)
- `NEXT_PUBLIC_APP_URL`

### Self-hosting
`docker compose up` runs Postgres + app. The app container auto-runs `prisma migrate deploy` before starting. Needs all env vars from `.env.example` passed in.
