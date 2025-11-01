-- Drop policy SELECT restrittiva su servizi_passeggeri
DROP POLICY IF EXISTS "Gli utenti possono visualizzare i collegamenti passeggeri-servi" ON public.servizi_passeggeri;

-- Crea nuova policy SELECT che include dipendenti assegnati
CREATE POLICY "Utenti possono visualizzare collegamenti passeggeri dei propri servizi"
ON public.servizi_passeggeri
FOR SELECT
TO public
USING (
  -- Admin e socio: accesso completo
  get_user_role(auth.uid()) IN ('admin', 'socio')
  OR
  -- Utenti: vedono solo passeggeri di servizi dove:
  -- - Sono referenti (referente_id)
  -- - Hanno creato il servizio (created_by)
  -- - Sono assegnati al servizio (assegnato_a) ← FIX CRITICO
  EXISTS (
    SELECT 1 
    FROM servizi s
    WHERE s.id = servizi_passeggeri.servizio_id
      AND (
        s.referente_id = auth.uid()
        OR s.created_by = auth.uid()
        OR s.assegnato_a = auth.uid()
      )
  )
);