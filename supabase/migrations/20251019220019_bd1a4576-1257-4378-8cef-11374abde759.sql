-- ================================================================
-- MIGRATION: Fix totale_netto NULL + Constraint NOT NULL
-- Data: 2025-10-19
-- Issue: BUG #7 - totale_netto può essere NULL, causando stipendi zero
-- Fix: Backfill + Constraint + Trigger validazione automatica
-- ================================================================

-- STEP 1: Backfill tutti i totale_netto = NULL esistenti
UPDATE stipendi
SET totale_netto = COALESCE(totale_lordo, 0) 
                 + COALESCE(totale_spese, 0) 
                 - COALESCE(totale_prelievi, 0) 
                 - COALESCE(incassi_da_dipendenti, 0) 
                 + COALESCE(riporto_mese_precedente, 0),
    updated_at = NOW()
WHERE totale_netto IS NULL;

-- STEP 2: Aggiungi constraint NOT NULL con default
ALTER TABLE stipendi 
ALTER COLUMN totale_netto SET DEFAULT 0;

ALTER TABLE stipendi 
ALTER COLUMN totale_netto SET NOT NULL;

-- STEP 3: Trigger di validazione pre-insert/update
CREATE OR REPLACE FUNCTION validate_stipendio_totale_netto()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Se totale_netto è NULL, calcolalo automaticamente
  IF NEW.totale_netto IS NULL THEN
    NEW.totale_netto := COALESCE(NEW.totale_lordo, 0) 
                      + COALESCE(NEW.totale_spese, 0) 
                      - COALESCE(NEW.totale_prelievi, 0) 
                      - COALESCE(NEW.incassi_da_dipendenti, 0) 
                      + COALESCE(NEW.riporto_mese_precedente, 0);
    
    RAISE NOTICE 'Auto-calcolato totale_netto = % per stipendio user_id=%', NEW.totale_netto, NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_validate_totale_netto ON stipendi;

CREATE TRIGGER trigger_validate_totale_netto
BEFORE INSERT OR UPDATE ON stipendi
FOR EACH ROW
EXECUTE FUNCTION validate_stipendio_totale_netto();

COMMENT ON FUNCTION validate_stipendio_totale_netto() IS
'Trigger di validazione che calcola automaticamente totale_netto se NULL.
Previene inserimenti con totale_netto mancante.
Formula: totale_lordo + totale_spese - totale_prelievi - incassi_da_dipendenti + riporto_mese_precedente';

COMMENT ON COLUMN stipendi.totale_netto IS
'Importo netto finale dello stipendio (OBBLIGATORIO).
Calcolato come: totale_lordo + totale_spese - totale_prelievi - incassi_da_dipendenti + riporto_mese_precedente.
Trigger validate_stipendio_totale_netto lo calcola automaticamente se NULL.';