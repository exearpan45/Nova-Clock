# NOVA CLOCK

NOVA CLOCK is a responsive smart-time cockpit for live time, alarms, focus tools, world clocks, countdowns, and personal routines.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/nova-clock/src/components/nova-shell.tsx` — responsive application shell, navigation, and first-visit authentication prompt
- `artifacts/nova-clock/src/pages/nova-pages.tsx` — clock, alarms, stopwatch, timer, world clock, countdown, calendar, settings, and profile screens
- `artifacts/nova-clock/src/hooks/use-local.ts` — local-first persistence and live clock engine
- `artifacts/nova-clock/src/lib/supabase.ts` — optional Supabase Auth REST seam using only public browser configuration
- `artifacts/nova-clock/supabase/schema.sql` — paste-ready Supabase tables, indexes, trigger, and RLS policies
- `artifacts/nova-clock/public/manifest.json` and `public/sw.js` — PWA metadata and offline shell

## Architecture decisions

- Core clock tools are local-first so a network outage never blocks the clock, timer, stopwatch, or existing routines.
- Supabase is optional at runtime; the browser seam accepts only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, never a service-role key.
- The frontend uses browser timezone APIs instead of a paid weather or timezone service.
- The UI uses the artifact's shared responsive routing and a desktop rail/mobile bottom navigation split.

## Product

The first build includes a live analog/digital overview, alarm CRUD, stopwatch laps, focus timer presets, world clocks, countdowns, a lightweight calendar, settings, profile/guest mode, responsive navigation, PWA shell support, and a Supabase schema for later account sync.

## User preferences

- Premium smartphone-OS feel with glass surfaces, soft gradients, rounded cards, and restrained motion.

## Gotchas

- Auth and cloud sync need `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` configured in the web artifact environment.
- Browser alarms and notification delivery are subject to browser/PWA permission and background-execution limits.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
