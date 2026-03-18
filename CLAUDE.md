# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (requires Node via nvm)
export PATH="$HOME/.nvm/versions/node/v20.20.1/bin:$PATH"
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build + type check
npm run lint       # ESLint
npm run start      # Serve production build
```

There are no tests. The build (`npm run build`) is the primary type-check mechanism — always run it after making changes.

## Architecture

**Next.js 14 App Router PWA** — single-tutor session management app, installable to iPhone home screen.

### Route groups
- `src/app/(auth)/` — unauthenticated pages: `/login` and `/auth/callback`
- `src/app/(app)/` — protected pages with `BottomNav` shell: `/calendar`, `/tutees`, `/lessons`, `/settings`
- Root `src/app/page.tsx` redirects to `/calendar` or `/login` based on session

### Auth
OTP flow only (no magic links — avoids in-app browser trap on iOS PWA). `src/middleware.ts` guards all routes by calling `supabase.auth.getUser()` on every request. The `/auth/callback` route handles PKCE fallback for direct link clicks.

### Supabase client pattern
Two separate clients — use the right one for context:
- `src/lib/supabase/client.ts` — `createBrowserClient()` for Client Components and hooks
- `src/lib/supabase/server.ts` — `createServerClient()` (async) for Server Components and Route Handlers

**Type casting:** The Supabase JS client is instantiated without the `<Database>` generic (our manually-written types in `src/lib/types/database.types.ts` don't satisfy Supabase's internal TypeScript generics). All query results are cast with `as unknown as Type`. Always cast when reading query results.

### Data hooks (`src/hooks/`)
All data fetching and mutation for client components goes through three hooks:
- `useTutees` — CRUD + debounced full-text search
- `useTopicProgress(tuteeId)` — RAG status per topic, returns both flat array and `grouped` (by subject)
- `useLessons(options?)` — accepts optional `tuteeId`, `startDate`, `endDate` filters

### Design system
**Warm Scholastic** aesthetic — `Instrument Serif` for headings, `DM Sans` for body. Custom Tailwind tokens in `tailwind.config.ts`: `primary` (#1A6B5C teal), `accent` (#E8863A amber), `background` (#FAF8F4 warm off-white), `rag.{red,amber,green}` and their `-bg` variants for topic progress chips. All spacing and shadow uses `shadow-card` / `shadow-card-lg` from the config.

### Calendar
`src/components/calendar/CalendarView.tsx` wraps schedule-x. View switching (week ↔ month) uses the internal API `(calendarApp as any).$app.calendarState.currentView.value` — the public `CalendarApp` type doesn't expose `setView`. Events map `starts_at` (timestamptz) to schedule-x's `"YYYY-MM-DD HH:mm"` local string format via `toScheduleXDate()`.

### PWA
- `public/sw.js` — manual service worker: cache-first for `/_next/static/`, network-first for HTML, network-only for `*.supabase.co` (never cache auth)
- `public/manifest.json` + `public/icons/` — icons are currently **placeholder solid-teal PNGs** that need replacing before launch
- `sw.js` is served with `Cache-Control: no-cache` (configured in `next.config.js`)
- After changing env vars, the browser service worker cache must be cleared (DevTools → Application → Clear site data) before the new values take effect

### Database
4 migrations in `supabase/migrations/`. Apply with `supabase db push`. All tables have `tutor_id` RLS policies scoped to `auth.uid()` — multi-tutor ready without schema changes. The `topic_progress` table stores per-subject RAG (red/amber/green) status per tutee, separate from free-text notes.

### iOS PWA gotchas baked in
- `100dvh` used throughout (not `100vh`)
- `padding-bottom: env(safe-area-inset-bottom)` on `BottomNav` and sheet modals
- `overscroll-behavior-y: none` on body
- No `target="_blank"` on internal links
- OTP auth keeps the entire flow within the PWA window
