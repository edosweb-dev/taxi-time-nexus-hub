-- STEP 1: Creare funzione helper che bypassa RLS (CORRETTA)
CREATE OR REPLACE FUNCTION public.get_dipendente_visible_profile_ids(_user_id uuid)
RETURNS TABLE(profile_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT unnest(ARRAY[s.referente_id, s.assegnato_a]) as profile_id
  FROM servizi s
  WHERE (s.assegnato_a = _user_id OR s.referente_id = _user_id)
    AND (s.referente_id IS NOT NULL OR s.assegnato_a IS NOT NULL)
$$;

-- STEP 2: Droppare la policy problematica
DROP POLICY IF EXISTS "Dipendenti can view related profiles" ON profiles;

-- STEP 3: Ricreare la policy usando la funzione helper
CREATE POLICY "Dipendenti can view related profiles" ON profiles
FOR SELECT 
USING (
  has_role(auth.uid(), 'dipendente'::app_role) 
  AND id IN (
    SELECT profile_id 
    FROM get_dipendente_visible_profile_ids(auth.uid())
  )
);

-- STEP 4: Ottimizzare has_role per caching
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    )),
    false
  )
$$;

-- STEP 5: Grant permessi
GRANT EXECUTE ON FUNCTION get_dipendente_visible_profile_ids(uuid) TO authenticated;