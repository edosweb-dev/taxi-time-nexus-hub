-- Drop vecchia policy restrittiva che blocca completamente i dipendenti
DROP POLICY IF EXISTS "Employees cannot access company data" ON public.aziende;

-- Crea nuova policy permissiva per servizi assegnati
CREATE POLICY "Employees can read companies of assigned services"
ON public.aziende
FOR SELECT
TO public
USING (
  -- Admin e socio: accesso completo (mantieni comportamento esistente)
  get_user_role(auth.uid()) IN ('admin', 'socio')
  OR
  -- Dipendenti: solo aziende dei servizi assegnati a loro
  (
    get_user_role(auth.uid()) = 'dipendente'
    AND
    id IN (
      SELECT azienda_id 
      FROM servizi 
      WHERE assegnato_a = auth.uid()
    )
  )
);