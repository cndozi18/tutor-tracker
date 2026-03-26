'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { viewWeek, viewMonthGrid, createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import '@schedule-x/theme-default/dist/index.css';
import { Temporal as TemporalPolyfill } from '@js-temporal/polyfill';
import { useLessons } from '@/hooks/useLessons';
import { QuickAddModal } from '@/components/lessons/QuickAddModal';
import type { Lesson } from '@/lib/types/database.types';

// Schedule-x v4 validates events using `instanceof globalThis.Temporal.ZonedDateTime`.
// Chrome 129+ has native Temporal; use it when present so instanceof checks pass.
// Otherwise install the polyfill as the global so both sides share the same class.
type TemporalType = typeof TemporalPolyfill;
const g = globalThis as Record<string, unknown>;
if (!g.Temporal) Object.assign(globalThis, { Temporal: TemporalPolyfill });
const T = g.Temporal as TemporalType;

// Compute timezone inside the function, not at module level.
// Module-level LOCAL_TZ would be evaluated on the server during SSR (returning UTC),
// whereas CalendarInner only ever renders client-side (after useLessons loads).
// Intl.DateTimeFormat().resolvedOptions().timeZone always returns the browser's
// local timezone at call time, which is what we want.
function lessonToEvent(lesson: Lesson) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const start = T.Instant.from(lesson.starts_at).toZonedDateTimeISO(tz);
  const end = start.add({ minutes: lesson.duration_mins });
  return {
    id: lesson.id,
    title: lesson.subject ?? 'Lesson',
    start,
    end,
    calendarId: 'lessons',
  };
}

// Returns the Monday of the week containing `d`
function getWeekStart(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// ─── Inner calendar ───────────────────────────────────────────────────────────

interface CalendarInnerProps {
  initialLessons: Lesson[];
  onEventClick: (id: string) => void;
  onClickDate: (date: string) => void;
  onClickDateTime: (dateTime: string) => void;
  onLessonCreated: (addEvent: (lesson: Lesson) => void) => void;
}

function CalendarInner({ initialLessons, onEventClick, onClickDate, onClickDateTime, onLessonCreated }: CalendarInnerProps) {
  const [view, setView] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekStart = getWeekStart(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  // Use Wednesday of the week as the representative month (most stable)
  const headerDate = view === 'week' ? weekDays[2] : currentDate;
  const monthLabel = headerDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });

  const calendarApp = useNextCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    defaultView: viewWeek.name,
    locale: 'en-GB',
    events: initialLessons.map(lessonToEvent),
    dayBoundaries: { start: '07:00', end: '22:00' },
    calendars: {
      lessons: {
        colorName: 'lessons',
        lightColors: { main: '#1A6B5C', container: '#E8F5F2', onContainer: '#1A6B5C' },
        darkColors:  { main: '#1A6B5C', container: '#E8F5F2', onContainer: '#1A6B5C' },
      },
    },
    callbacks: {
      onEventClick: (event) => onEventClick(event.id as string),
      onClickDate,
      onClickDateTime,
    },
  });

  // Give the parent a stable function it can call to add a new event
  onLessonCreated((lesson: Lesson) => {
    try { calendarApp?.events.add(lessonToEvent(lesson)); } catch { /* ignore */ }
  });

  const navigate = (dir: -1 | 1) => {
    const newDate = new Date(currentDate);
    if (view === 'week') {
      newDate.setDate(newDate.getDate() + dir * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + dir);
    }
    setCurrentDate(newDate);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const $app = (calendarApp as any).$app;
      const pad = (n: number) => String(n).padStart(2, '0');
      const localDateStr = `${newDate.getFullYear()}-${pad(newDate.getMonth() + 1)}-${pad(newDate.getDate())}`;
      const plainDate = T.PlainDate.from(localDateStr);
      $app.datePickerState.selectedDate.value = plainDate;
    } catch { /* ignore */ }
  };

  const handleViewChange = (newView: 'week' | 'month') => {
    setView(newView);
    if (!calendarApp) return;
    const viewName = newView === 'week' ? viewWeek.name : viewMonthGrid.name;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const $app = (calendarApp as any).$app;
      $app.calendarState.setView(viewName, $app.datePickerState.selectedDate.value);
    } catch { /* ignore */ }
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Custom header: month label + navigation ── */}
      <div className="flex items-center justify-between px-4 pt-1 pb-2">
        <span className="font-serif text-xl text-text">{monthLabel}</span>
        <div className="flex items-center gap-0.5">
          {/* View toggle */}
          <div className="flex bg-border rounded-lg p-0.5 mr-2">
            <button
              onClick={() => handleViewChange('week')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                view === 'week'
                  ? 'bg-white text-primary shadow-card'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleViewChange('month')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                view === 'month'
                  ? 'bg-white text-primary shadow-card'
                  : 'text-text-muted hover:text-text'
              }`}
            >
              Month
            </button>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border transition-colors text-text-muted active:scale-90"
            aria-label="Previous"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="10 4 6 8 10 12" />
            </svg>
          </button>
          <button
            onClick={() => navigate(1)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-border transition-colors text-text-muted active:scale-90"
            aria-label="Next"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 4 10 8 6 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Week day strip (week view only) ── */}
      {view === 'week' && (
        <div className="sx-week-strip border-b border-border pb-2 mb-0">
          {/* 75px spacer to align with schedule-x's time axis */}
          <div className="flex" style={{ paddingLeft: 75 }}>
            {weekDays.map((day, i) => {
              const isToday = day.getTime() === today.getTime();
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] font-medium text-text-muted tracking-widest uppercase">
                    {DAY_LETTERS[i]}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      isToday
                        ? 'bg-primary text-white'
                        : 'text-text'
                    }`}
                  >
                    {day.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Schedule-x calendar ── */}
      <div className={`flex-1 overflow-y-auto ${view === 'week' ? 'sx-week-mode' : 'sx-month-mode'}`}>
        {calendarApp && <ScheduleXCalendar calendarApp={calendarApp} />}
      </div>
    </div>
  );
}

// ─── Outer shell ──────────────────────────────────────────────────────────────

export function CalendarView() {
  const router = useRouter();
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<string | undefined>();
  const [quickAddTime, setQuickAddTime] = useState<string | undefined>();

  const addEventRef = useRef<((lesson: Lesson) => void) | null>(null);

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();

  const { lessons, loading } = useLessons({ startDate, endDate });

  const handleLessonCreated = (lesson: Lesson) => {
    addEventRef.current?.(lesson);
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)]">

      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="font-serif text-3xl text-text">Calendar</h1>
        {loading && (
          <span className="text-sm text-text-muted animate-pulse">Loading…</span>
        )}
      </div>

      {/* Calendar — only mount after lessons are fetched */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!loading && (
          <CalendarInner
            initialLessons={lessons}
            onEventClick={(id) => router.push(`/lessons/${id}`)}
            onClickDate={(date) => { setQuickAddDate(date); setQuickAddTime('09:00'); setQuickAddOpen(true); }}
            onClickDateTime={(dateTime) => {
              const [datePart, timePart] = dateTime.split(' ');
              setQuickAddDate(datePart);
              setQuickAddTime(timePart?.slice(0, 5) ?? '09:00');
              setQuickAddOpen(true);
            }}
            onLessonCreated={(fn) => { addEventRef.current = fn; }}
          />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setQuickAddDate(undefined); setQuickAddTime(undefined); setQuickAddOpen(true); }}
        className="fixed right-5 bottom-[calc(80px+env(safe-area-inset-bottom)+16px)] w-14 h-14 bg-accent rounded-full shadow-card-lg flex items-center justify-center text-white active:scale-95 transition-transform z-30"
        aria-label="Add lesson"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>

      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        defaultDate={quickAddDate}
        defaultTime={quickAddTime}
        onCreated={handleLessonCreated}
      />
    </div>
  );
}
