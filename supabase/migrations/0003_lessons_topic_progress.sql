-- Topic progress table
CREATE TABLE IF NOT EXISTS public.topic_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutee_id uuid NOT NULL REFERENCES public.tutees(id) ON DELETE CASCADE,
  subject text NOT NULL,
  topic text NOT NULL,
  rag_status text NOT NULL DEFAULT 'amber' CHECK (rag_status IN ('red', 'amber', 'green')),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS topic_progress_tutor_id_idx ON public.topic_progress(tutor_id);
CREATE INDEX IF NOT EXISTS topic_progress_tutee_id_idx ON public.topic_progress(tutee_id);
CREATE INDEX IF NOT EXISTS topic_progress_tutee_subject_idx ON public.topic_progress(tutee_id, subject);

CREATE TRIGGER topic_progress_updated_at
  BEFORE UPDATE ON public.topic_progress
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutee_id uuid NOT NULL REFERENCES public.tutees(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL,
  duration_mins smallint DEFAULT 60 NOT NULL,
  subject text,
  plan text,
  notes text,
  homework_set text,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS lessons_tutor_id_idx ON public.lessons(tutor_id);
CREATE INDEX IF NOT EXISTS lessons_tutee_id_idx ON public.lessons(tutee_id);
CREATE INDEX IF NOT EXISTS lessons_starts_at_idx ON public.lessons(starts_at);
CREATE INDEX IF NOT EXISTS lessons_tutor_starts_at_idx ON public.lessons(tutor_id, starts_at);

CREATE TRIGGER lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
