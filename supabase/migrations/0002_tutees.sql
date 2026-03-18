-- Tutees table
CREATE TABLE IF NOT EXISTS public.tutees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  year_group text,
  age smallint,
  subjects text[],
  learning_style text,
  parent_name text,
  parent_email text,
  parent_phone text,
  notes text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS tutees_tutor_id_idx ON public.tutees(tutor_id);
CREATE INDEX IF NOT EXISTS tutees_full_name_fts_idx ON public.tutees
  USING gin(to_tsvector('english', full_name));

-- Updated_at trigger
CREATE TRIGGER tutees_updated_at
  BEFORE UPDATE ON public.tutees
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
