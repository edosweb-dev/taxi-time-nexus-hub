-- ================================================================
-- MIGRATION: Fix Riporto Mese Precedente Include Stipendi Bozza
-- Data: 2025-10-19
-- Issue: BUG #3 - Riporto esclude stipendi in 'bozza'
-- ================================================================

-- Aggiorna function ricalcola_stipendio_completo per includere bozze nel riporto
CREATE OR REPLACE FUNCTION public.ricalcola_stipendio_completo(
  _user_id UUID,
  _mese INTEGER,
  _anno INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _totale_km NUMERIC DEFAULT 0;
  _totale_ore_attesa NUMERIC DEFAULT 0;
  _totale_ore_lavorate NUMERIC DEFAULT 0;
  _base_calcolo NUMERIC DEFAULT 0;
  _coefficiente NUMERIC DEFAULT 1.17;
  _tariffa_oraria NUMERIC DEFAULT 15;
  _base_con_aumento NUMERIC DEFAULT 0;
  _importo_ore_attesa NUMERIC DEFAULT 0;
  _totale_lordo NUMERIC DEFAULT 0;
  _totale_spese NUMERIC DEFAULT 0;
  _totale_prelievi NUMERIC DEFAULT 0;
  _incassi_dipendenti NUMERIC DEFAULT 0;
  _incassi_servizi NUMERIC DEFAULT 0;
  _riporto NUMERIC DEFAULT 0;
  _totale_netto NUMERIC DEFAULT 0;
  _data_inizio DATE;
  _data_fine DATE;
  _stipendio_esistente_stato TEXT;
  _km_arrotondati INTEGER;
  _tariffa_oltre_200 NUMERIC;
BEGIN
  -- Calcola date range mese
  _data_inizio := DATE_TRUNC('month', MAKE_DATE(_anno, _mese, 1))::DATE;
  _data_fine := (DATE_TRUNC('month', MAKE_DATE(_anno, _mese, 1)) + INTERVAL '1 month - 1 day')::DATE;
  
  -- Verifica stato stipendio esistente
  SELECT stato INTO _stipendio_esistente_stato
  FROM stipendi
  WHERE user_id = _user_id AND mese = _mese AND anno = _anno;
  
  -- RICALCOLA SOLO se bozza o non esiste
  IF _stipendio_esistente_stato IS NULL OR _stipendio_esistente_stato = 'bozza' THEN
    
    -- 1. CALCOLA TOTALI DA SERVIZI
    SELECT 
      COALESCE(SUM(km_totali), 0),
      COALESCE(SUM(ore_sosta), 0),
      COALESCE(SUM(ore_effettive), 0)
    INTO _totale_km, _totale_ore_attesa, _totale_ore_lavorate
    FROM servizi
    WHERE assegnato_a = _user_id
      AND data_servizio >= _data_inizio
      AND data_servizio <= _data_fine
      AND stato IN ('completato', 'consuntivato');
    
    -- 2. RECUPERA CONFIGURAZIONE ANNO
    SELECT 
      COALESCE(coefficiente_aumento, 1.17),
      COALESCE(tariffa_oraria_attesa, 15),
      COALESCE(tariffa_oltre_200km, 0.25)
    INTO _coefficiente, _tariffa_oraria, _tariffa_oltre_200
    FROM configurazione_stipendi
    WHERE anno = _anno;
    
    -- 3. CALCOLA BASE KM
    IF _totale_km <= 200 THEN
      -- Arrotonda a multiplo di 5
      _km_arrotondati := ROUND(_totale_km / 5.0) * 5;
      _km_arrotondati := GREATEST(12, _km_arrotondati);
      
      -- Lookup tabella tariffe_km_fissi
      SELECT COALESCE(importo_base, 0)
      INTO _base_calcolo
      FROM tariffe_km_fissi
      WHERE anno = _anno 
        AND km = _km_arrotondati
        AND attivo = TRUE
      LIMIT 1;
      
      IF _base_calcolo IS NULL OR _base_calcolo = 0 THEN
        _base_calcolo := 0;
      END IF;
    ELSE
      -- Calcolo lineare oltre 200 km
      _base_calcolo := _totale_km * _tariffa_oltre_200;
    END IF;
    
    -- 4. APPLICA COEFFICIENTE
    _base_con_aumento := _base_calcolo * _coefficiente;
    
    -- 5. CALCOLA ORE ATTESA
    _importo_ore_attesa := _totale_ore_attesa * _tariffa_oraria;
    
    -- 6. TOTALE LORDO
    _totale_lordo := _base_con_aumento + _importo_ore_attesa;
    
    -- 7. RECUPERA DETRAZIONI/ADDIZIONI
    
    -- Spese personali approvate
    SELECT COALESCE(SUM(importo), 0)
    INTO _totale_spese
    FROM spese_dipendenti
    WHERE user_id = _user_id
      AND data_spesa >= _data_inizio
      AND data_spesa <= _data_fine
      AND stato = 'approvata';
    
    -- Prelievi
    SELECT COALESCE(SUM(importo), 0)
    INTO _totale_prelievi
    FROM spese_aziendali
    WHERE socio_id = _user_id
      AND data_movimento >= _data_inizio
      AND data_movimento <= _data_fine
      AND tipologia = 'prelievo';
    
    -- Incassi da dipendenti
    SELECT COALESCE(SUM(importo), 0)
    INTO _incassi_dipendenti
    FROM spese_aziendali
    WHERE socio_id = _user_id
      AND data_movimento >= _data_inizio
      AND data_movimento <= _data_fine
      AND tipologia = 'incasso';
    
    -- Incassi servizi contanti
    SELECT COALESCE(SUM(COALESCE(incasso_ricevuto, incasso_previsto, 0)), 0)
    INTO _incassi_servizi
    FROM servizi
    WHERE assegnato_a = _user_id
      AND data_servizio >= _data_inizio
      AND data_servizio <= _data_fine
      AND metodo_pagamento = 'Contanti'
      AND stato IN ('completato', 'consuntivato');
    
    -- Riporto mese precedente (FIX BUG #3: include anche 'bozza')
    SELECT COALESCE(totale_netto, 0)
    INTO _riporto
    FROM stipendi
    WHERE user_id = _user_id
      AND mese = CASE WHEN _mese = 1 THEN 12 ELSE _mese - 1 END
      AND anno = CASE WHEN _mese = 1 THEN _anno - 1 ELSE _anno END
      AND stato IN ('bozza', 'confermato', 'pagato')
    ORDER BY 
      CASE stato 
        WHEN 'pagato' THEN 1
        WHEN 'confermato' THEN 2
        WHEN 'bozza' THEN 3
      END ASC,
      updated_at DESC
    LIMIT 1;
    
    -- 8. CALCOLO TOTALE NETTO
    _totale_netto := _totale_lordo 
      + _totale_spese 
      - _totale_prelievi 
      - _incassi_dipendenti 
      - _incassi_servizi 
      + _riporto;
    
    -- 9. UPSERT STIPENDIO BOZZA
    INSERT INTO stipendi (
      user_id, mese, anno, tipo_calcolo, stato,
      totale_km, totale_ore_lavorate, totale_ore_attesa,
      base_calcolo, coefficiente_applicato,
      totale_lordo, totale_spese, totale_prelievi,
      incassi_da_dipendenti, riporto_mese_precedente,
      totale_netto,
      created_by, created_at, updated_at
    ) VALUES (
      _user_id, _mese, _anno, 'socio', 'bozza',
      _totale_km, _totale_ore_lavorate, _totale_ore_attesa,
      _base_calcolo, _coefficiente,
      _totale_lordo, _totale_spese, _totale_prelievi,
      _incassi_dipendenti, _riporto,
      _totale_netto,
      _user_id, NOW(), NOW()
    )
    ON CONFLICT (user_id, mese, anno)
    DO UPDATE SET
      totale_km = EXCLUDED.totale_km,
      totale_ore_lavorate = EXCLUDED.totale_ore_lavorate,
      totale_ore_attesa = EXCLUDED.totale_ore_attesa,
      base_calcolo = EXCLUDED.base_calcolo,
      coefficiente_applicato = EXCLUDED.coefficiente_applicato,
      totale_lordo = EXCLUDED.totale_lordo,
      totale_spese = EXCLUDED.totale_spese,
      totale_prelievi = EXCLUDED.totale_prelievi,
      incassi_da_dipendenti = EXCLUDED.incassi_da_dipendenti,
      riporto_mese_precedente = EXCLUDED.riporto_mese_precedente,
      totale_netto = EXCLUDED.totale_netto,
      updated_at = NOW()
    WHERE stipendi.stato = 'bozza';
    
  END IF;
END;
$function$;

COMMENT ON FUNCTION public.ricalcola_stipendio_completo IS 
'Ricalcola stipendio completo includendo riporto da mese precedente.
AGGIORNAMENTO 2025-10-19 (FIX BUG #3): Riporto ora include anche stipendi in stato "bozza" 
per garantire continuità saldi anche se admin non ha confermato mese precedente.
Priorità: pagato > confermato > bozza (usa il più affidabile disponibile).';