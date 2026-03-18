'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { viewWeek, viewMonthGrid, createViewWeek, createViewMonthGrid } from '@schedule-x/calendar';
import { useNextCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import '@schedule-x/theme-default/dist/index.css';
import { useLessons } from '@/hooks/useLessons';
import { QuickAddModal } from '@/components/lessons/QuickAddModal';

function toScheduleXDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getEndTime(startsAt: string, durationMins: number): string {
  const d = new Date(startsAt);
  d.setMinutes(d.getMinutes() + durationMins);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function CalendarView() {
  const router = useRouter();
  const [view, setView] = useState<'week' | 'month'>('week');
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddDate, setQuickAddDate] = useState<string | undefined>();
  const [quickAddTime, setQuickAddTime] = useState<string | undefined>();

  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 0).toISOString();

  const { lessons } = useLessons({ startDate, endDate });

  const events = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.subject ?? 'Lesson',
    start: toScheduleXDate(lesson.starts_at),
    end: getEndTime(lesson.starts_at, lesson.duration_mins),
    calendarId: 'lessons',
  }));

  const calendarApp = useNextCalendarApp({
    views: [createViewWeek(), createViewMonthGrid()],
    defaultView: viewWeek.name,
    events,
    calendars: {
      lessons: {
        colorName: 'lessons',
        lightColors: {
          main: '#1A6B5C',
          container: '#E8F5F2',
          onContainer: '#1A6B5C',
        },
        darkColors: {
          main: '#1A6B5C',
          container: '#E8F5F2',
          onContainer: '#1A6B5C',
        },
      },
    },
    callbacks: {
      onEventClick: (event) => {
        router.push(`/lessons/${event.id}`);
      },
      onClickDate: (date) => {
        setQuickAddDate(date);
        setQuickAddTime('09:00');
        setQuickAddOpen(true);
      },
      onClickDateTime: (dateTime) => {
        const [datePart, timePart] = dateTime.split(' ');
        setQuickAddDate(datePart);
        setQuickAddTime(timePart?.slice(0, 5) ?? '09:00');
        setQuickAddOpen(true);
      },
    },
  });

  const handleViewChange = (newView: 'week' | 'month') => {
    setView(newView);
    if (!calendarApp) return;
    const viewName = newView === 'week' ? viewWeek.name : viewMonthGrid.name;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (calendarApp as any).$app.calendarState.currentView.value = viewName;
    } catch {
      // Ignore if internal API changes
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-80px)]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h1 className="font-serif text-3xl text-text">Calendar</h1>
        <div className="flex rounded-xl overflow-hidden border border-border bg-surface">
            <button
              onClick={() => handleViewChange('week')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'week' ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => handleViewChange('month')}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-primary text-white' : 'text-text-muted hover:bg-background'
              }`}
            >
              Month
            </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 overflow-hidden px-2">
        {calendarApp && <ScheduleXCalendar calendarApp={calendarApp} />}
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
      />
    </div>
  );
}
