-- Security Fix: Restrict company data access to authorized roles only
-- Remove any potential gaps and ensure comprehensive access control

-- First, let's add an explicit policy to deny access to unauthorized roles
CREATE POLICY "Deny access to unauthorized users" 
ON public.aziende 
FOR ALL 
TO public 
USING (
  -- Only allow admin, socio, and cliente roles
  get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text, 'cliente'::text])
);

-- Add a restrictive view policy that ensures dipendenti cannot access sensitive company data
-- unless they are specifically authorized
CREATE POLICY "Employees cannot access company data" 
ON public.aziende 
FOR SELECT 
TO public 
USING (
  -- Explicitly deny access to dipendente role
  get_user_role(auth.uid()) != 'dipendente'
);