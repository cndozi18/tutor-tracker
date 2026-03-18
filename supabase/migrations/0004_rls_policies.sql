-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topic_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own profile
CREATE POLICY "profiles_own" ON public.profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Tutees RLS
CREATE POLICY "tutees_own" ON public.tutees
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

-- Topic progress RLS
CREATE POLICY "topic_progress_own" ON public.topic_progress
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());

-- Lessons RLS
CREATE POLICY "lessons_own" ON public.lessons
  USING (tutor_id = auth.uid())
  WITH CHECK (tutor_id = auth.uid());
