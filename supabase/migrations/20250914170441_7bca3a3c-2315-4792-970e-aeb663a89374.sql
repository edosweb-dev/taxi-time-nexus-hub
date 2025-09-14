-- Security Fix 1: Restrict External Driver Data Access
-- Remove public access to external drivers, require authentication
DROP POLICY IF EXISTS "Tutti possono visualizzare conducenti attivi" ON public.conducenti_esterni;

CREATE POLICY "Authenticated users can view active drivers" 
ON public.conducenti_esterni 
FOR SELECT 
USING (attivo = true AND auth.uid() IS NOT NULL);

-- Security Fix 2: Restrict Business Configuration Access
-- Require authentication for business configuration tables
DROP POLICY IF EXISTS "Tutti possono visualizzare le categorie spese" ON public.spese_categorie;
DROP POLICY IF EXISTS "Tutti possono visualizzare i metodi pagamento spese" ON public.metodi_pagamento_spese;

CREATE POLICY "Authenticated users can view expense categories" 
ON public.spese_categorie 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view payment methods" 
ON public.metodi_pagamento_spese 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Security Fix 3: Create function to safely handle profile role updates
CREATE OR REPLACE FUNCTION public.can_update_profile_role(user_id uuid, new_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = ANY(ARRAY['admin'::text, 'socio'::text])
  ) OR (
    SELECT role FROM profiles WHERE id = user_id
  ) = new_role;
$$;