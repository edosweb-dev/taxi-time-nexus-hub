-- ============================================
-- MIGRATION: Passeggeri associati ad Azienda
-- Data: 2025-11-12
-- ============================================

-- Step 1: Drop vecchia policy
DROP POLICY IF EXISTS "Referenti can manage own" ON passeggeri;

-- Step 2: Crea nuova policy (filtro per azienda)
CREATE POLICY "Referenti can manage company passengers" ON passeggeri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'cliente'
      AND profiles.azienda_id = passeggeri.azienda_id
    )
  );

-- Step 3: Rinomina campo per chiarezza (tracking only)
ALTER TABLE passeggeri 
  RENAME COLUMN referente_id TO created_by_referente_id;

-- Step 4: Aggiungi commento esplicativo
COMMENT ON COLUMN passeggeri.created_by_referente_id IS 
  'Referente che ha creato il passeggero (solo tracking storico, non usato per filtri)';

-- Step 5: Verifica struttura finale
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'passeggeri' 
ORDER BY ordinal_position;