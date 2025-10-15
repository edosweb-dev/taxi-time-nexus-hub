-- ============================================================================
-- Migration: Fix RLS servizi - Hybrid Approach (Option B)
-- Priorità: P0 - Security/GDPR compliance
-- ============================================================================

-- CONTEXT:
-- Implementa isolamento dati tra referenti per servizi aziendali
-- Mantiene flessibilità per servizi privati e servizi admin-created condivisi

-- Step 1: DROP policies esistenti su servizi
DROP POLICY IF EXISTS "Admin e soci possono gestire tutti i servizi" ON servizi;
DROP POLICY IF EXISTS "Clienti possono gestire solo i propri servizi" ON servizi;
DROP POLICY IF EXISTS "Dipendenti possono aggiornare servizi assegnati" ON servizi;
DROP POLICY IF EXISTS "Dipendenti possono visualizzare servizi assegnati" ON servizi;

-- Step 2: CREATE nuove policies con HYBRID filtering

-- ============================================================================
-- SELECT: Isolamento ibrido
-- ============================================================================
CREATE POLICY "servizi_select_hybrid_policy"
ON servizi
FOR SELECT
TO authenticated
USING (
  -- Admin/Socio: vedono tutti i servizi
  get_user_role(auth.uid()) IN ('admin', 'socio')
  
  OR
  
  -- Cliente: vedono servizi secondo logica ibrida
  (
    get_user_role(auth.uid()) = 'cliente'
    AND (
      -- 1. Servizi aziendali propri (referente_id = auth.uid())
      (
        tipo_cliente = 'azienda'
        AND azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
        AND referente_id = auth.uid()
      )
      OR
      -- 2. Servizi aziendali condivisi (admin-created, referente_id IS NULL)
      (
        tipo_cliente = 'azienda'
        AND azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
        AND referente_id IS NULL
      )
      OR
      -- 3. Servizi privati creati da loro
      (
        tipo_cliente = 'privato'
        AND created_by = auth.uid()
      )
    )
  )
  
  OR
  
  -- Dipendente: solo servizi a loro assegnati
  (
    get_user_role(auth.uid()) = 'dipendente'
    AND assegnato_a = auth.uid()
  )
);

-- ============================================================================
-- INSERT: Forza referente_id corretto per clienti
-- ============================================================================
CREATE POLICY "servizi_insert_hybrid_policy"
ON servizi
FOR INSERT
TO authenticated
WITH CHECK (
  -- Admin/Socio: possono creare qualsiasi servizio
  get_user_role(auth.uid()) IN ('admin', 'socio')
  
  OR
  
  -- Cliente: possono creare servizi secondo logica ibrida
  (
    get_user_role(auth.uid()) = 'cliente'
    AND (
      -- 1. Servizi aziendali con proprio referente_id
      (
        tipo_cliente = 'azienda'
        AND azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
        AND referente_id = auth.uid()
      )
      OR
      -- 2. Servizi privati (referente_id può essere NULL)
      (
        tipo_cliente = 'privato'
        AND created_by = auth.uid()
      )
    )
  )
);

-- ============================================================================
-- UPDATE: Isolamento ibrido
-- ============================================================================
CREATE POLICY "servizi_update_hybrid_policy"
ON servizi
FOR UPDATE
TO authenticated
USING (
  -- Admin/Socio: possono modificare tutti i servizi
  get_user_role(auth.uid()) IN ('admin', 'socio')
  
  OR
  
  -- Cliente: possono modificare solo servizi secondo logica ibrida
  (
    get_user_role(auth.uid()) = 'cliente'
    AND (
      -- 1. Servizi aziendali propri
      (
        tipo_cliente = 'azienda'
        AND azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
        AND referente_id = auth.uid()
      )
      OR
      -- 2. Servizi privati creati da loro
      (
        tipo_cliente = 'privato'
        AND created_by = auth.uid()
      )
    )
  )
  
  OR
  
  -- Dipendente: possono aggiornare solo servizi assegnati (limitato)
  (
    get_user_role(auth.uid()) = 'dipendente'
    AND assegnato_a = auth.uid()
  )
)
WITH CHECK (
  -- Same logic as USING (mantiene vincoli dopo modifica)
  get_user_role(auth.uid()) IN ('admin', 'socio')
  
  OR
  
  (
    get_user_role(auth.uid()) = 'cliente'
    AND (
      (
        tipo_cliente = 'azienda'
        AND azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
        AND referente_id = auth.uid()
      )
      OR
      (
        tipo_cliente = 'privato'
        AND created_by = auth.uid()
      )
    )
  )
  
  OR
  
  (
    get_user_role(auth.uid()) = 'dipendente'
    AND assegnato_a = auth.uid()
  )
);

-- ============================================================================
-- DELETE: Solo admin/socio e clienti per BOZZE proprie
-- ============================================================================
CREATE POLICY "servizi_delete_hybrid_policy"
ON servizi
FOR DELETE
TO authenticated
USING (
  -- Admin/Socio: possono eliminare tutti i servizi
  get_user_role(auth.uid()) IN ('admin', 'socio')
  
  OR
  
  -- Cliente: possono eliminare solo BOZZE proprie
  (
    get_user_role(auth.uid()) = 'cliente'
    AND stato = 'bozza'
    AND (
      -- Bozze aziendali proprie
      (
        tipo_cliente = 'azienda'
        AND azienda_id IN (SELECT azienda_id FROM profiles WHERE id = auth.uid())
        AND referente_id = auth.uid()
      )
      OR
      -- Bozze private proprie
      (
        tipo_cliente = 'privato'
        AND created_by = auth.uid()
      )
    )
  )
);

-- Step 3: Create indices for performance
CREATE INDEX IF NOT EXISTS idx_servizi_tipo_cliente ON servizi(tipo_cliente);
CREATE INDEX IF NOT EXISTS idx_servizi_referente_tipo ON servizi(referente_id, tipo_cliente);
CREATE INDEX IF NOT EXISTS idx_servizi_azienda_referente_tipo ON servizi(azienda_id, referente_id, tipo_cliente);

-- Step 4: Log migration
DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies servizi aggiornate con HYBRID APPROACH (Option B)';
  RAISE NOTICE '✅ Clienti isolati per servizi aziendali (referente_id = auth.uid())';
  RAISE NOTICE '✅ Servizi aziendali admin-created (referente_id IS NULL) condivisi';
  RAISE NOTICE '✅ Servizi privati (tipo_cliente=privato) mantengono flessibilità';
  RAISE NOTICE '✅ Indices creati per performance';
END $$;