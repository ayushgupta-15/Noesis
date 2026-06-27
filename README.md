# Noēsis

Auditable AI research workspace built as a local-first Next.js app with optional production Postgres persistence.

Noēsis takes a topic, builds a research brief, runs iterative web research, streams each pipeline event to the workspace, and generates a Markdown report with a source ledger.

## Current Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand
- AI SDK streaming
- OpenRouter models
- Exa web search
- Local JSON session storage for development
- Neon/Postgres session storage for production
- Vercel Blob report export
- Anonymous visitor-scoped sessions

## Architecture

```text
UI
  Landing -> Workspace -> route-based audit views

API routes
  /api/questions      -> clarifying questions
  /api/deep-research -> streamed research pipeline
  /api/sessions      -> session history
  /api/sessions/[id] -> saved session detail
  /api/exports/report -> hosted Markdown report export
  /api/health/db     -> persistence health check

Research engine
  query planning
  Exa search
  extract + dedupe
  coverage analysis
  confidence gate
  report generation

Persistence
  local .noesis/sessions.json fallback
  optional Postgres research_sessions table via DATABASE_URL
  optional public Markdown artifacts via BLOB_READ_WRITE_TOKEN
```

The app runs in one runtime: Next.js.

## Local Setup

Install dependencies:

```bash
npm install
```

Create `.env.local`:

```bash
cp .env.local.example .env.local
```

Add keys:

```env
OPENROUTER_API_KEY=
EXA_SEARCH_API_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`DATABASE_URL` is optional locally. When it is empty, sessions are stored in `.noesis/sessions.json`. When it is set, Noēsis creates and uses a `research_sessions` table automatically. Research sessions are scoped to an HTTP-only anonymous visitor cookie.

Run locally:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Verification

```bash
npx tsc --noEmit
npm run lint
npm run build
```

## Active Source Map

```text
src/app/page.tsx
src/app/workspace/page.tsx
src/app/workspace/*/page.tsx
src/app/history/page.tsx
src/app/report/[id]/page.tsx
src/app/api/questions/route.ts
src/app/api/deep-research/route.ts
src/app/api/deep-research/main.ts
src/app/api/deep-research/research-functions.ts
src/app/api/deep-research/model-caller.ts
src/app/api/deep-research/prompts.ts
src/app/api/sessions/route.ts
src/app/api/sessions/[id]/route.ts
src/app/api/exports/report/route.ts
src/app/api/health/db/route.ts
src/components/ui/deep-research/
src/lib/rate-limit.ts
src/lib/session-owner.ts
src/lib/session-store.ts
src/store/deepResearch.ts
```

## Production Checklist

- Configure `OPENROUTER_API_KEY` and `EXA_SEARCH_API_KEY`.
- Configure `DATABASE_URL` for durable sessions.
- Configure `BLOB_READ_WRITE_TOKEN` for hosted Markdown export artifacts.
- Check `/api/health/db` after setting production environment variables.
- Run `npx tsc --noEmit`, `npm run lint`, and `npm run build`.
- Test a full research run, route switching during streaming, `/history`, and `/report/[id]`.
- Test `Export Markdown` from `/workspace/report`.
