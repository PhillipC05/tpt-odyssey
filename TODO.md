# TPT Odyssey — Build Checklist

## Phase 1 — Foundation
- [x] Init Next.js 15 + TypeScript + Tailwind CSS
- [x] shadcn/ui component library initialized
- [x] Prisma schema (User, Profile, Quest, Milestone, Task, Resource, CheckIn, Connection, Mentorship)
- [x] PostgreSQL datasource configured via `prisma.config.ts`
- [x] Prisma client generated
- [x] OpenRouter AI client (`src/lib/ai/client.ts`) — `streamChat`, `chat`, `generateStructured`
- [x] AI prompts — onboarding, quest-gen, check-in, adapt-quest
- [x] AI output schemas (Zod) — ProfileSchema, QuestSchema, CheckInResultSchema, AdaptedQuestSchema
- [x] Clerk auth middleware (`src/middleware.ts`) — public/protected route split
- [x] Clerk webhook handler (`/api/webhooks/clerk`) — user create/update/delete → DB sync
- [x] Environment config (`.env`, `.env.example`)

## Phase 2 — Onboarding & Quest Generation
- [x] Streaming `ChatInterface` component (reusable, completion-marker aware)
- [x] Onboarding page (`/onboarding`) — AI intake conversation
- [x] Dedicated `/api/ai/onboarding-chat` route (server-side system prompt)
- [x] `/api/profile` — POST: extract profile from conversation + generate first quest

## Phase 3 — Quest Experience
- [x] `/api/quests` — GET all user quests
- [x] `/api/quests/[id]` — GET single quest, PATCH (status, share toggle)
- [x] `/api/tasks` — PATCH task completion (with ownership verification)
- [x] `/api/milestones/[id]/complete` — POST complete milestone, activate next, complete quest
- [x] `QuestCard` component (progress bar, current milestone, status badge)
- [x] `TaskItem` component (optimistic checkbox with server sync)
- [x] `ResourceCard` component (typed icons, external link)
- [x] `CompleteMilestoneButton` — completes milestone, navigates to check-in
- [x] `ShareQuestButton` — toggle public sharing, copies URL to clipboard
- [x] Dashboard page (`/dashboard`) — active/completed quest grid, profile redirect guard
- [x] Quest detail page (`/quest/[id]`) — milestones, tasks, resources, check-in summaries

## Phase 4 — AI Check-in & Adaptation
- [x] `/api/ai/check-in-chat` route — streaming check-in conversation
- [x] `/api/ai/check-in` — POST: extract scores, save CheckIn, optionally adapt quest
- [x] Check-in page (`/quest/[id]/check-in`) — chat UI, calls check-in API on complete

## Phase 5 — Profile & Community
- [x] Profile page (`/profile`) — Big Five bars, interests, talent signals, curiosity/motivation type
- [x] `/api/community` — GET peer/mentor/public-quest lists by shared interests
- [x] Community page (`/community`) — tabbed: Peers / Mentors / Public journeys
- [x] Public quest share page (`/q/[shareId]`) — read-only, check-in reflections, CTA

## Phase 6 — Auth Pages & Root Layout
- [x] Sign-in page (`/sign-in/[[...sign-in]]`)
- [x] Sign-up page (`/sign-up/[[...sign-up]]`)
- [x] Root layout with ClerkProvider + Sonner toasts
- [x] Main app layout (`/(main)/layout.tsx`) — sticky nav, UserButton
- [x] Landing / marketing page (`/`)

## Phase 7 — Deployment
- [x] PWA manifest (`/public/manifest.json`)
- [x] `Dockerfile` (multi-stage: deps → builder → runner)
- [x] `docker-compose.yml` (Postgres + app + health checks + auto-migration)
- [x] TypeScript type check passes (`npx tsc --noEmit`)

---

## Remaining / Next Steps

### Must-do before first user
- [x] Add PWA icons (192×192 and 512×512 PNG) to `/public/`
- [x] Replace Clerk with internal JWT auth (bcryptjs + jose)
- [ ] Add `JWT_SECRET` env var + OpenRouter API key and configure default model
- [ ] Run first DB migration: `npx prisma migrate dev --name replace-clerk-with-internal-auth`
- [ ] Test full onboarding → quest → check-in flow end-to-end
- [x] Add `output: "standalone"` to `next.config.ts` for Docker builds

### Enhancements (post-MVP)
- [x] "New quest" flow — generate an additional quest from existing profile
- [x] Mentor opt-in UI — toggle `isMentor` and set `mentorTopics` from profile page
- [x] Mentorship request flow — send/accept/decline connections
- [x] Notifications — email reminders for inactive quests
- [x] Quest abandonment flow with option to restart or pivot
- [x] Admin dashboard (for self-hosters) — usage, model config
- [ ] End-to-end tests (Playwright) for onboarding + quest flow
- [ ] Accessibility audit
- [ ] i18n / localization
- [ ] Dark mode toggle in UI
