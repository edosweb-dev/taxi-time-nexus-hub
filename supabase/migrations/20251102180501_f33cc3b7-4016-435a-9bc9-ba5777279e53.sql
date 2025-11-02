-- ============================================
-- SEMPLIFICAZIONE RADICALE CAMPI ORE
-- UN SOLO CAMPO: ore_sosta
-- ============================================

-- STEP 1: Backup completo pre-migrazione
CREATE TABLE IF NOT EXISTS servizi_ore_backup_final AS 
SELECT 
  id, 
  ore_lavorate,
  ore_effettive, 
  ore_fatturate, 
  ore_finali,
  ore_sosta, 
  ore_sosta_fatturate,
  created_at,
  stato
FROM servizi;

-- STEP 2: Unifica tutti i campi in ore_sosta
-- Strategia: priorità basata sul campo più affidabile
UPDATE servizi 
SET ore_sosta = COALESCE(
  ore_sosta,              -- Priorità 1: valore esistente
  ore_sosta_fatturate,    -- Priorità 2: ore fatturate
  ore_finali,             -- Priorità 3: ore finali
  ore_effettive           -- Priorità 4: ore effettive
)
WHERE ore_sosta IS NULL;

-- STEP 3: Verifica migrazione con report
DO $$
DECLARE
  tot INT;
  con_sosta INT;
  servizi_consuntivati INT;
  servizi_completati INT;
  servizi_senza_ore INT;
BEGIN
  SELECT COUNT(*) INTO tot FROM servizi;
  SELECT COUNT(*) INTO con_sosta 
    FROM servizi WHERE ore_sosta IS NOT NULL;
  SELECT COUNT(*) INTO servizi_consuntivati 
    FROM servizi WHERE stato = 'consuntivato';
  SELECT COUNT(*) INTO servizi_completati 
    FROM servizi WHERE stato = 'completato';
  SELECT COUNT(*) INTO servizi_senza_ore
    FROM servizi WHERE stato IN ('consuntivato', 'completato') AND ore_sosta IS NULL;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'MIGRAZIONE COMPLETATA';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Servizi totali: %', tot;
  RAISE NOTICE 'Con ore_sosta popolato: %', con_sosta;
  RAISE NOTICE 'Servizi consuntivati: %', servizi_consuntivati;
  RAISE NOTICE 'Servizi completati: %', servizi_completati;
  RAISE NOTICE 'Servizi senza ore (ATTENZIONE): %', servizi_senza_ore;
  RAISE NOTICE '========================================';
END $$;

-- NOTA: Non droppiamo colonne per sicurezza
-- Le deprecheremo nel codice TypeScript