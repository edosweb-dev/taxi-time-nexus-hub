DROP POLICY IF EXISTS "servizi_select_hybrid_policy" ON servizi;

CREATE POLICY "servizi_select_hybrid_policy"
ON servizi
FOR SELECT
TO authenticated
USING (
  (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'socio'::text]))
  OR
  (
    (get_user_role(auth.uid()) = 'cliente'::text)
    AND (referente_id = auth.uid())
  )
  OR
  (
    (get_user_role(auth.uid()) = 'dipendente'::text)
    AND (assegnato_a = auth.uid())
  )
);