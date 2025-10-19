-- ================================================================
-- MIGRATION: Aggiungi UNIQUE Constraint su pagamenti_stipendi
-- Data: 2025-10-19
-- Issue: BUG #6 - Manca constraint per prevenire duplicati
-- ================================================================

-- 1. VERIFICA dati esistenti (opzionale safety check)
DO $$
DECLARE
  _duplicati INTEGER;
BEGIN
  -- Conta eventuali duplicati esistenti
  SELECT COUNT(*) INTO _duplicati
  FROM (
    SELECT user_id, mese, anno, COUNT(*) as cnt
    FROM pagamenti_stipendi
    GROUP BY user_id, mese, anno
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF _duplicati > 0 THEN
    RAISE WARNING '⚠️  Trovati % duplicati esistenti in pagamenti_stipendi', _duplicati;
    RAISE WARNING '⚠️  Risolvi duplicati manualmente prima di applicare constraint';
    RAISE EXCEPTION 'Constraint non applicato per presenza duplicati';
  ELSE
    RAISE NOTICE '✅ Nessun duplicato trovato, procedo con constraint';
  END IF;
END $$;

-- 2. AGGIUNGI UNIQUE constraint
ALTER TABLE pagamenti_stipendi 
ADD CONSTRAINT unique_pagamento_user_mese_anno 
UNIQUE (user_id, mese, anno);

COMMENT ON CONSTRAINT unique_pagamento_user_mese_anno ON pagamenti_stipendi IS
'Previene pagamenti duplicati per stesso dipendente, mese e anno.
Defense in depth: API ha già controllo preventivo (createPagamentoStipendio),
ma questo constraint garantisce integrità dati anche se API bypassed o bug.
Errore violazione: "duplicate key value violates unique constraint"';