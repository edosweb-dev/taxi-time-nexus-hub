-- FASE 1.1: Migrazione Sicurezza Ruoli

-- 1. Crea enum ruoli
CREATE TYPE public.app_role AS ENUM ('admin', 'socio', 'dipendente', 'cliente');

-- 2. Crea tabella user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 3. Abilita RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Migra dati esistenti da profiles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role FROM public.profiles;

-- 5. Crea funzione security definer per check ruolo
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 6. Crea funzione helper per ottenere ruolo primario
CREATE OR REPLACE FUNCTION public.get_primary_role(_user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'socio' THEN 2
      WHEN 'dipendente' THEN 3
      WHEN 'cliente' THEN 4
    END
  LIMIT 1
$$;

-- 7. RLS Policies per user_roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all roles" ON public.user_roles
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 8. Aggiorna RLS policies esistenti per stipendi
DROP POLICY IF EXISTS "Admin può gestire tutti gli stipendi" ON stipendi;
CREATE POLICY "Admin può gestire tutti gli stipendi" ON stipendi
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role)
  );

DROP POLICY IF EXISTS "Soci possono gestire tutti gli stipendi" ON stipendi;
CREATE POLICY "Soci possono gestire tutti gli stipendi" ON stipendi
  FOR ALL USING (
    public.has_role(auth.uid(), 'socio'::app_role)
  );

DROP POLICY IF EXISTS "Dipendenti possono visualizzare solo i propri stipendi" ON stipendi;
CREATE POLICY "Dipendenti possono visualizzare solo i propri stipendi" ON stipendi
  FOR SELECT USING (
    (user_id = auth.uid()) AND public.has_role(auth.uid(), 'dipendente'::app_role)
  );

-- 9. Aggiorna RLS policies per pagamenti_stipendi
DROP POLICY IF EXISTS "Admin e soci gestiscono tutti i pagamenti stipendi" ON pagamenti_stipendi;
CREATE POLICY "Admin e soci gestiscono tutti i pagamenti stipendi" ON pagamenti_stipendi
  FOR ALL USING (
    public.has_role(auth.uid(), 'admin'::app_role) OR 
    public.has_role(auth.uid(), 'socio'::app_role)
  );

DROP POLICY IF EXISTS "Dipendenti vedono solo propri pagamenti stipendi" ON pagamenti_stipendi;
CREATE POLICY "Dipendenti vedono solo propri pagamenti stipendi" ON pagamenti_stipendi
  FOR SELECT USING (
    (user_id = auth.uid()) AND public.has_role(auth.uid(), 'dipendente'::app_role)
  );