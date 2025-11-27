-- ============================================
-- MIGRATION: Fix Shifts Foreign Keys
-- Cambia FK da auth.users → profiles (best practice)
-- ============================================

-- Step 1: Drop vecchie foreign keys che puntano a auth.users
ALTER TABLE shifts 
  DROP CONSTRAINT IF EXISTS shifts_user_id_fkey;

ALTER TABLE shifts 
  DROP CONSTRAINT IF EXISTS shifts_created_by_fkey;

ALTER TABLE shifts 
  DROP CONSTRAINT IF EXISTS shifts_updated_by_fkey;

-- Step 2: Crea nuove foreign keys verso profiles
ALTER TABLE shifts 
  ADD CONSTRAINT shifts_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES profiles(id)
  ON DELETE CASCADE;

ALTER TABLE shifts 
  ADD CONSTRAINT shifts_created_by_fkey 
  FOREIGN KEY (created_by) 
  REFERENCES profiles(id)
  ON DELETE SET NULL;

ALTER TABLE shifts 
  ADD CONSTRAINT shifts_updated_by_fkey 
  FOREIGN KEY (updated_by) 
  REFERENCES profiles(id)
  ON DELETE SET NULL;

-- Step 3: Crea indici per performance (se non esistono già)
CREATE INDEX IF NOT EXISTS idx_shifts_user_id 
  ON shifts(user_id);

CREATE INDEX IF NOT EXISTS idx_shifts_date_user 
  ON shifts(shift_date, user_id);

-- Step 4: Verifica nuovi constraints
SELECT 
  conname as constraint_name,
  a.attname as column_name,
  confrelid::regclass as references_table
FROM pg_constraint c
JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = ANY(c.conkey)
WHERE conrelid = 'shifts'::regclass
  AND contype = 'f'
ORDER BY conname;