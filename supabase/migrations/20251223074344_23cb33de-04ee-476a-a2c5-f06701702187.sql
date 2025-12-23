-- 1. Verifica che RLS sia abilitato (dovrebbe già esserlo)
ALTER TABLE veicoli ENABLE ROW LEVEL SECURITY;

-- 2. Policy DELETE - Solo admin e socio possono eliminare definitivamente
CREATE POLICY "Admin and socio can hard delete veicoli"
ON veicoli
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'socio')
  )
);

-- 3. Modifica foreign key su servizi per gestire DELETE
-- Prima rimuovi la constraint esistente (se c'è)
ALTER TABLE servizi 
DROP CONSTRAINT IF EXISTS servizi_veicolo_id_fkey;

-- Ricrea con ON DELETE SET NULL (veicolo rimosso → servizio mantiene storico ma veicolo_id = NULL)
ALTER TABLE servizi
ADD CONSTRAINT servizi_veicolo_id_fkey 
FOREIGN KEY (veicolo_id) 
REFERENCES veicoli(id) 
ON DELETE SET NULL;

-- 4. Commento per documentazione
COMMENT ON POLICY "Admin and socio can hard delete veicoli" ON veicoli IS 
'Permette eliminazione definitiva veicoli inattivi. I servizi storici manterranno veicolo_id = NULL.';