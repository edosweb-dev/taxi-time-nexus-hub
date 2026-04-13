-- Drop policy esistente
DROP POLICY IF EXISTS "Gli utenti possono aggiornare collegamenti passeggeri-servizi" 
ON servizi_passeggeri;

-- Ricrea con assegnato_a incluso
CREATE POLICY "Gli utenti possono aggiornare collegamenti passeggeri-servizi"
ON servizi_passeggeri
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM servizi s 
    WHERE s.id = servizi_passeggeri.servizio_id 
    AND (
      s.referente_id = auth.uid() 
      OR s.created_by = auth.uid()
      OR s.assegnato_a = auth.uid()
    )
  )
);