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

## Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Required in `.env.local` for local dev and in Vercel project settings for deployment. After changing env vars, clear the service worker cache (DevTools → Application → Clear site data) before new values take effect in the browser.

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
- `useTutees` — CRUD + debounced full-text search; `deleteTutee` is a hard-delete (DB cascades to lessons + topic_progress via `ON DELETE CASCADE`)
- `useTopicProgress(tuteeId)` — RAG status per topic, returns both flat array and `grouped` (by subject)
- `useLessons(options?)` — accepts optional `tuteeId`, `startDate`, `endDate` filters; lessons have `status` field: `'scheduled' | 'completed' | 'cancelled' | 'no_show'`. Also exposes `createRecurringSeries(baseValues, recurrence)` to generate a batch of recurring lessons sharing a `series_id`, and `updateFutureLessons(seriesId, fromStartsAt, time, duration, subject)` to bulk-update future occurrences in a series

### Forms
`react-hook-form` + `zod` are used for all forms. Schema validation lives alongside each form component.

### Import alias
`@/*` maps to `./src/*` (configured in `tsconfig.json`). Always use this for internal imports.

### Design system
**Warm Scholastic** aesthetic — `Instrument Serif` for headings, `DM Sans` for body. Custom Tailwind tokens in `tailwind.config.ts`: `primary` (#1A6B5C teal), `accent` (#E8863A amber), `background` (#FAF8F4 warm off-white), `rag.{red,amber,green}` and their `-bg` variants for topic progress chips. All spacing and shadow uses `shadow-card` / `shadow-card-lg` from the config.

### Calendar
`src/components/calendar/CalendarView.tsx` wraps schedule-x. View switching (week ↔ month) uses the internal API `(calendarApp as any).$app.calendarState.setView(viewName, selectedDate)` — the public `CalendarApp` type doesn't expose `setView`. Events use `Temporal.ZonedDateTime` objects (required by schedule-x v4 — plain strings will throw).

**Temporal polyfill:** If native `globalThis.Temporal` exists (Chrome 129+) use it directly; otherwise install the `@js-temporal/polyfill` onto `globalThis`. After patching, always reference `globalThis.Temporal` — not the raw polyfill import — so that `instanceof` checks work correctly with schedule-x internals.

**Timezone:** `lessonToEvent()` computes timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone` on every call — **not** a module-level constant. A module-level `LOCAL_TZ` would be evaluated during SSR (returning UTC), causing events to render in the wrong timezone. Since `CalendarInner` only mounts client-side (gated by `!loading`), the per-call `Intl` lookup is always in the browser context.

### Deletion
Reusable `ConfirmDialog` (`src/components/ui/ConfirmDialog.tsx`) wraps the existing `Modal` component. `TuteeActions` (tutee profile) and `LessonActions` (lesson detail) are client components that handle delete confirmation. `LessonActions` is series-aware: if a lesson has a `series_id`, it offers "delete this lesson only" vs "delete this and all future lessons in the series".

### Recurring lessons
Lessons can belong to a recurring series identified by `series_id` (UUID) with a `recurrence_rule` (`'weekly'` | `'biweekly'`). All occurrences are generated upfront as individual lesson rows sharing the same `series_id`. The `LessonForm` shows recurrence options in create mode (frequency, end condition, 5-date preview) and an "apply to all future" checkbox in edit mode. The tutee profile page groups upcoming series lessons into `SeriesCard` components, with a detail page at `/lessons/series/[seriesId]`.

### PWA
- `public/sw.js` — manual service worker: cache-first for `/_next/static/`, network-first for HTML, network-only for `*.supabase.co` (never cache auth)
- `public/manifest.json` + `public/icons/` — icons are currently **placeholder solid-teal PNGs** that need replacing before launch
- `sw.js` is served with `Cache-Control: no-cache` (configured in `next.config.js`)

### Database
5 migrations in `supabase/migrations/`. Apply with `supabase db push`. All tables have `tutor_id` RLS policies scoped to `auth.uid()` — multi-tutor ready without schema changes. The `topic_progress` table stores per-subject RAG (red/amber/green) status per tutee, separate from free-text notes. `lessons` has `series_id` (nullable UUID) and `recurrence_rule` (nullable, `'weekly'` | `'biweekly'`) for recurring lesson support. Both `lessons` and `topic_progress` have `ON DELETE CASCADE` from `tutees`, so deleting a tutee row automatically removes all related data.

### iOS PWA gotchas baked in
- `100dvh` used throughout (not `100vh`)
- `padding-bottom: env(safe-area-inset-bottom)` on `BottomNav` and sheet modals
- `overscroll-behavior-y: none` on body
- No `target="_blank"` on internal links
- OTP auth keeps the entire flow within the PWA window
