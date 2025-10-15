-- Migration: Fix RLS passeggeri - STRICT filter per isolamento referente
-- Blocca NULL bypass e garantisce isolamento tra clienti stessa azienda

-- Step 1: DROP policies esistenti su passeggeri
DROP POLICY IF EXISTS "Admin e soci possono gestire tutti i passeggeri" ON passeggeri;
DROP POLICY IF EXISTS "Referenti possono gestire solo i propri passeggeri" ON passeggeri;

-- Step 2: CREATE nuove policies con STRICT filtering

-- SELECT: Ogni ruolo vede SOLO i propri passeggeri
CREATE POLICY "passeggeri_select_strict_isolation"
ON passeggeri
FOR SELECT
USING (
  CASE 
    -- Admin/Socio: vedono tutti i passeggeri della loro azienda
    WHEN get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text]) THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
    
    -- Cliente: SOLO passeggeri con referente_id = auth.uid() (NO NULL bypass)
    WHEN get_user_role(auth.uid()) = 'cliente'::text THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
      AND referente_id = auth.uid()
      AND referente_id IS NOT NULL
    
    -- Dipendente: nessun accesso
    ELSE false
  END
);

-- INSERT: Forza referente_id = auth.uid() per clienti
CREATE POLICY "passeggeri_insert_strict_isolation"
ON passeggeri
FOR INSERT
WITH CHECK (
  CASE 
    -- Admin/Socio: possono creare passeggeri per la loro azienda
    WHEN get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text]) THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
    
    -- Cliente: SOLO passeggeri con referente_id = auth.uid() (STRICT)
    WHEN get_user_role(auth.uid()) = 'cliente'::text THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
      AND referente_id = auth.uid()
      AND referente_id IS NOT NULL
    
    -- Dipendente: nessun insert
    ELSE false
  END
);

-- UPDATE: Solo i propri passeggeri
CREATE POLICY "passeggeri_update_strict_isolation"
ON passeggeri
FOR UPDATE
USING (
  CASE 
    -- Admin/Socio: possono modificare tutti i passeggeri della loro azienda
    WHEN get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text]) THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
    
    -- Cliente: SOLO passeggeri con referente_id = auth.uid()
    WHEN get_user_role(auth.uid()) = 'cliente'::text THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
      AND referente_id = auth.uid()
      AND referente_id IS NOT NULL
    
    -- Dipendente: nessun update
    ELSE false
  END
)
WITH CHECK (
  CASE 
    -- Admin/Socio: possono modificare tutto
    WHEN get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text]) THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
    
    -- Cliente: mantiene referente_id = auth.uid()
    WHEN get_user_role(auth.uid()) = 'cliente'::text THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
      AND referente_id = auth.uid()
      AND referente_id IS NOT NULL
    
    -- Dipendente: nessun update
    ELSE false
  END
);

-- DELETE: Solo admin/socio possono eliminare definitivamente, clienti solo i propri
CREATE POLICY "passeggeri_delete_strict_isolation"
ON passeggeri
FOR DELETE
USING (
  CASE 
    -- Admin/Socio: possono eliminare tutti i passeggeri della loro azienda
    WHEN get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text]) THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
    
    -- Cliente: possono eliminare SOLO propri passeggeri
    WHEN get_user_role(auth.uid()) = 'cliente'::text THEN
      azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
      AND referente_id = auth.uid()
      AND referente_id IS NOT NULL
    
    -- Dipendente: nessun delete
    ELSE false
  END
);

-- Step 3: Aggiungi indici per performance
CREATE INDEX IF NOT EXISTS idx_passeggeri_referente_id 
ON passeggeri(referente_id)
WHERE referente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_passeggeri_azienda_referente 
ON passeggeri(azienda_id, referente_id);

-- Step 4: Log migration
DO $$
BEGIN
  RAISE NOTICE 'RLS policies passeggeri aggiornate con STRICT filtering (no NULL bypass)';
  RAISE NOTICE 'Clienti possono vedere SOLO passeggeri con referente_id = auth.uid()';
  RAISE NOTICE 'Indici performance creati: idx_passeggeri_referente_id, idx_passeggeri_azienda_referente';
END $$;