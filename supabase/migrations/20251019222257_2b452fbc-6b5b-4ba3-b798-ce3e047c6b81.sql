-- ================================================================
-- MIGRATION: Forza ricalcolo stipendio Andrea Di Gregorio
-- Data: 2025-10-19
-- Issue: BUG #8 - Stipendio confermato non viene ricalcolato
-- Fix: Imposta stato bozza, forza ricalcolo, ripristina confermato
-- ================================================================

DO $$
DECLARE
  _user_id UUID := '23fa3d09-513d-40c6-aea5-b9a12677041f';
  _mese INT := 10;
  _anno INT := 2025;
  _stato_originale TEXT;
BEGIN
  -- Salva stato originale
  SELECT stato INTO _stato_originale
  FROM stipendi
  WHERE user_id = _user_id AND mese = _mese AND anno = _anno;
  
  RAISE NOTICE 'Stato originale: %', _stato_originale;
  
  -- STEP 1: Cambia stato a bozza per permettere ricalcolo
  UPDATE stipendi
  SET stato = 'bozza',
      updated_at = NOW()
  WHERE user_id = _user_id
    AND mese = _mese
    AND anno = _anno;
  
  RAISE NOTICE 'Stato cambiato a bozza per permettere ricalcolo';
  
  -- STEP 2: Forza ricalcolo completo
  PERFORM ricalcola_stipendio_completo(_user_id, _mese, _anno);
  
  RAISE NOTICE 'Ricalcolo completo eseguito';
  
  -- STEP 3: Ripristina stato originale (se era confermato)
  IF _stato_originale = 'confermato' THEN
    UPDATE stipendi
    SET stato = 'confermato',
        updated_at = NOW()
    WHERE user_id = _user_id
      AND mese = _mese
      AND anno = _anno;
    
    RAISE NOTICE 'Stato ripristinato a confermato';
  END IF;
  
  -- Log risultato finale
  RAISE NOTICE 'Fix completato per Andrea Di Gregorio - Stipendio ottobre 2025';
  
END $$;

-- Verifica risultato
SELECT 
  p.first_name || ' ' || p.last_name as nome,
  s.mese,
  s.anno,
  s.totale_km,
  s.totale_ore_attesa,
  s.base_calcolo,
  s.totale_lordo,
  s.totale_netto,
  s.stato
FROM stipendi s
JOIN profiles p ON p.id = s.user_id
WHERE s.user_id = '23fa3d09-513d-40c6-aea5-b9a12677041f'
  AND s.mese = 10
  AND s.anno = 2025;

COMMENT ON FUNCTION ricalcola_stipendio_completo(UUID, INTEGER, INTEGER) IS
'NOTA BUG #8: Questa funzione ricalcola SOLO stipendi in stato bozza.
Se stipendio è confermato/pagato, non viene aggiornato automaticamente.
Fix temporaneo: cambiare stato a bozza prima di chiamare la funzione.';