
DROP POLICY IF EXISTS "servizi_select_hybrid_policy" ON servizi;

CREATE POLICY "servizi_select_hybrid_policy" 
ON servizi 
FOR SELECT 
TO authenticated
USING (
  -- Admin/Socio: vedono tutto
  (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'socio'::text]))
  OR
  -- Cliente: vede tutti i servizi aziendali della propria azienda
  (
    (get_user_role(auth.uid()) = 'cliente'::text)
    AND (
      (
        (tipo_cliente = 'azienda'::text)
        AND (azienda_id IN (
          SELECT profiles.azienda_id FROM profiles WHERE profiles.id = auth.uid()
        ))
      )
      OR
      (
        (tipo_cliente = 'privato'::text)
        AND (created_by = auth.uid())
      )
    )
  )
  OR
  -- Dipendente: vede solo servizi assegnati
  (
    (get_user_role(auth.uid()) = 'dipendente'::text)
    AND (assegnato_a = auth.uid())
  )
);
