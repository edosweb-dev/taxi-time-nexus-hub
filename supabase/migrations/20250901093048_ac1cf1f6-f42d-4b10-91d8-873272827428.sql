-- Check current RLS policies on profiles table
-- Add policy to allow admins and socios to update all profiles

-- First, create a policy that allows admins and socios to update any profile
CREATE POLICY "Admins and socios can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role IN ('admin', 'socio')
  )
);

-- Also allow admins and socios to insert profiles (for user creation)
CREATE POLICY "Admins and socios can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.id = auth.uid() 
    AND admin_profile.role IN ('admin', 'socio')
  )
);