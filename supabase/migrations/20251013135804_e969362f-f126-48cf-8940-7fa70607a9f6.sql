-- Aggiungi policy DELETE per servizi_passeggeri
CREATE POLICY "Gli utenti possono eliminare collegamenti passeggeri-servizi"
ON servizi_passeggeri
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM servizi s
    WHERE s.id = servizi_passeggeri.servizio_id
    AND (s.referente_id = auth.uid() OR s.created_by = auth.uid())
  )
);

-- Aggiungi policy UPDATE per servizi_passeggeri
CREATE POLICY "Gli utenti possono aggiornare collegamenti passeggeri-servizi"
ON servizi_passeggeri
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM servizi s
    WHERE s.id = servizi_passeggeri.servizio_id
    AND (s.referente_id = auth.uid() OR s.created_by = auth.uid())
  )
);

-- Policy per admin e soci per gestire tutti i collegamenti
CREATE POLICY "Admin e soci possono gestire tutti i collegamenti"
ON servizi_passeggeri
FOR ALL
USING (
  get_user_role(auth.uid()) IN ('admin', 'socio')
);