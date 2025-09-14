-- Security Fix 1: Restrict External Driver Data Access
-- Remove public access to external drivers, require authentication
DROP POLICY IF EXISTS "Tutti possono visualizzare conducenti attivi" ON public.conducenti_esterni;

CREATE POLICY "Authenticated users can view active drivers" 
ON public.conducenti_esterni 
FOR SELECT 
USING (attivo = true AND auth.uid() IS NOT NULL);

-- Security Fix 2: Prevent Role Escalation in Profiles
-- Remove the overly permissive "Allow update own profile" policy and replace with safer version
DROP POLICY IF EXISTS "Allow update own profile" ON public.profiles;

-- Users can update their own profile but NOT their role
CREATE POLICY "Allow update own profile excluding role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  -- Prevent role changes by regular users
  (OLD.role = NEW.role OR EXISTS (
    SELECT 1 FROM profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role = ANY(ARRAY['admin'::text, 'socio'::text])
  ))
);

-- Security Fix 3: Restrict Business Configuration Access
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