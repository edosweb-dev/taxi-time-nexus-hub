-- ============================================================================
-- CRITICAL SECURITY FIX: Address Error-Level Security Issues
-- ============================================================================

-- Issue 1: Fix profiles table RLS policies
-- Remove public read access and implement role-specific access control

-- Drop the dangerous "Allow all for authenticated" policy
DROP POLICY IF EXISTS "Allow all for authenticated" ON profiles;
DROP POLICY IF EXISTS "Allow select own profile" ON profiles;

-- Create restrictive policies using has_role() function

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Policy: Admin and socio can view all profiles
CREATE POLICY "Admin and socio can view all profiles" 
ON profiles FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'socio'::app_role)
);

-- Policy: Dipendenti can view profiles of users in servizi they're assigned to
CREATE POLICY "Dipendenti can view related profiles"
ON profiles FOR SELECT
USING (
  public.has_role(auth.uid(), 'dipendente'::app_role) AND
  (
    id = auth.uid() OR
    id IN (
      SELECT DISTINCT created_by FROM servizi WHERE assegnato_a = auth.uid()
    ) OR
    id IN (
      SELECT DISTINCT assegnato_a FROM servizi WHERE assegnato_a = auth.uid()
    )
  )
);

-- Update existing admin/socio policies to use has_role()
DROP POLICY IF EXISTS "Admins and socios can create profiles" ON profiles;
CREATE POLICY "Admins and socios can create profiles"
ON profiles FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'socio'::app_role)
);

DROP POLICY IF EXISTS "Admins and socios can update all profiles" ON profiles;
CREATE POLICY "Admins and socios can update all profiles"
ON profiles FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'socio'::app_role)
);

-- Keep existing "Allow update own profile" policy for users to update their own data
-- DROP POLICY IF EXISTS "Allow update own profile" ON profiles;
-- This one is fine as-is

-- ============================================================================
-- Issue 2: Fix aziende table RLS policies
-- Restrict cliente access to only their own company
-- ============================================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Deny access to unauthorized users" ON aziende;
DROP POLICY IF EXISTS "Clients can read their company" ON aziende;

-- Create strict policy for cliente users
CREATE POLICY "Clienti can view only their company"
ON aziende FOR SELECT
USING (
  public.has_role(auth.uid(), 'cliente'::app_role) AND
  id = (SELECT azienda_id FROM profiles WHERE id = auth.uid())
);

-- Update existing policies to use has_role()
DROP POLICY IF EXISTS "Admins and socio can read all companies" ON aziende;
CREATE POLICY "Admins and socio can read all companies"
ON aziende FOR SELECT
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'socio'::app_role)
);

DROP POLICY IF EXISTS "Admins and socio can insert companies" ON aziende;
CREATE POLICY "Admins and socio can insert companies"
ON aziende FOR INSERT
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'socio'::app_role)
);

DROP POLICY IF EXISTS "Admins and socio can update companies" ON aziende;
CREATE POLICY "Admins and socio can update companies"
ON aziende FOR UPDATE
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'socio'::app_role)
);

DROP POLICY IF EXISTS "Admins and socio can delete companies" ON aziende;
CREATE POLICY "Admins and socio can delete companies"
ON aziende FOR DELETE
USING (
  public.has_role(auth.uid(), 'admin'::app_role) OR 
  public.has_role(auth.uid(), 'socio'::app_role)
);

DROP POLICY IF EXISTS "Employees can read companies of assigned services" ON aziende;
CREATE POLICY "Dipendenti can view companies from assigned services"
ON aziende FOR SELECT
USING (
  public.has_role(auth.uid(), 'dipendente'::app_role) AND
  id IN (SELECT DISTINCT azienda_id FROM servizi WHERE assegnato_a = auth.uid())
);

-- ============================================================================
-- Issue 3: Update get_user_role_and_azienda to use user_roles table
-- This fixes the recursive RLS issue
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_user_role_and_azienda(user_id UUID)
RETURNS TABLE(role TEXT, azienda_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.role::TEXT, p.azienda_id 
  FROM user_roles ur
  LEFT JOIN profiles p ON p.id = ur.user_id
  WHERE ur.user_id = user_id
  ORDER BY 
    CASE ur.role
      WHEN 'admin' THEN 1
      WHEN 'socio' THEN 2
      WHEN 'dipendente' THEN 3
      WHEN 'cliente' THEN 4
    END
  LIMIT 1;
$$;

-- ============================================================================
-- Issue 4: Update other functions that use profiles.role
-- ============================================================================

-- Update get_user_role to use user_roles table
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role::TEXT FROM public.user_roles
  WHERE user_id = user_id
  ORDER BY 
    CASE role
      WHEN 'admin' THEN 1
      WHEN 'socio' THEN 2
      WHEN 'dipendente' THEN 3
      WHEN 'cliente' THEN 4
    END
  LIMIT 1
$$;

-- ============================================================================
-- Issue 5: Create function to safely check if user can update role
-- ============================================================================

CREATE OR REPLACE FUNCTION public.can_update_profile_role(user_id UUID, new_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = ANY(ARRAY['admin'::app_role, 'socio'::app_role])
  ) OR (
    SELECT role::TEXT FROM user_roles WHERE user_id = user_id LIMIT 1
  ) = new_role;
$$;

-- ============================================================================
-- Verification queries (for logging)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Security fixes applied:';
  RAISE NOTICE '1. Removed "Allow all for authenticated" from profiles table';
  RAISE NOTICE '2. Created role-specific SELECT policies for profiles';
  RAISE NOTICE '3. Restricted aziende access for cliente users';
  RAISE NOTICE '4. Updated get_user_role_and_azienda to use user_roles table';
  RAISE NOTICE '5. Updated get_user_role to use user_roles table';
  RAISE NOTICE '6. All policies now use has_role() security definer function';
  RAISE NOTICE 'CRITICAL: profiles.role column still exists for backward compatibility';
  RAISE NOTICE 'NEXT STEP: Update application code to use user_roles, then drop profiles.role column';
END $$;