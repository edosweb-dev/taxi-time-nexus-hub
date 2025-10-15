-- ============================================================================
-- Migration: Update RLS policies email_notifiche per isolamento referente
-- Priorità: P0 - Security/GDPR compliance
-- ============================================================================

-- Step 1: Crea security definer function (evita recursione RLS)
CREATE OR REPLACE FUNCTION public.get_user_role_and_azienda(user_id UUID)
RETURNS TABLE(role TEXT, azienda_id UUID)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role, azienda_id 
  FROM profiles 
  WHERE id = user_id;
$$;

-- Step 2: DROP policies esistenti
DROP POLICY IF EXISTS "Admin e soci possono gestire email notifiche" ON email_notifiche;
DROP POLICY IF EXISTS "Utenti possono vedere email della propria azienda" ON email_notifiche;

-- Step 3: CREATE nuove policies con filtro referente_id

-- SELECT: Isolamento per referente
CREATE POLICY "email_notifiche_select_policy"
ON email_notifiche
FOR SELECT
TO authenticated
USING (
  -- Admin/Socio: vedono tutto della loro azienda
  (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) IN ('admin', 'socio')
  AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
  
  OR
  
  -- Cliente: vede solo proprie email + condivise (NULL)
  (
    (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) = 'cliente'
    AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
    AND (referente_id = auth.uid() OR referente_id IS NULL)
  )
);

-- INSERT: Isolamento per referente
CREATE POLICY "email_notifiche_insert_policy"
ON email_notifiche
FOR INSERT
TO authenticated
WITH CHECK (
  -- Admin/Socio: possono creare per la loro azienda
  (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) IN ('admin', 'socio')
  AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
  
  OR
  
  -- Cliente: possono creare solo con proprio referente_id
  (
    (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) = 'cliente'
    AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
    AND referente_id = auth.uid()
  )
);

-- UPDATE: Isolamento per referente
CREATE POLICY "email_notifiche_update_policy"
ON email_notifiche
FOR UPDATE
TO authenticated
USING (
  -- Admin/Socio: possono modificare tutto della loro azienda
  (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) IN ('admin', 'socio')
  AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
  
  OR
  
  -- Cliente: possono modificare solo proprie email
  (
    (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) = 'cliente'
    AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
    AND referente_id = auth.uid()
  )
)
WITH CHECK (
  -- Same logic for WITH CHECK
  (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) IN ('admin', 'socio')
  AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
  
  OR
  
  (
    (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) = 'cliente'
    AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
    AND referente_id = auth.uid()
  )
);

-- DELETE: Isolamento per referente
CREATE POLICY "email_notifiche_delete_policy"
ON email_notifiche
FOR DELETE
TO authenticated
USING (
  -- Admin/Socio: possono eliminare tutto della loro azienda
  (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) IN ('admin', 'socio')
  AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
  
  OR
  
  -- Cliente: possono eliminare solo proprie email
  (
    (SELECT role FROM public.get_user_role_and_azienda(auth.uid())) = 'cliente'
    AND azienda_id = (SELECT get_user_role_and_azienda.azienda_id FROM public.get_user_role_and_azienda(auth.uid()))
    AND referente_id = auth.uid()
  )
);

-- Step 4: Log migration
DO $$
BEGIN
  RAISE NOTICE 'RLS policies email_notifiche aggiornate con isolamento referente';
  RAISE NOTICE 'Security definer function creata: get_user_role_and_azienda()';
  RAISE NOTICE 'Policies create: SELECT, INSERT, UPDATE, DELETE con filtro referente_id';
END $$;