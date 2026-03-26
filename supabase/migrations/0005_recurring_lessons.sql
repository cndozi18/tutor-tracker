-- Add recurring lesson support to lessons table
ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS series_id uuid,
  ADD COLUMN IF NOT EXISTS recurrence_rule text CHECK (recurrence_rule IN ('weekly', 'biweekly'));

CREATE INDEX IF NOT EXISTS lessons_series_id_idx ON public.lessons(series_id);
