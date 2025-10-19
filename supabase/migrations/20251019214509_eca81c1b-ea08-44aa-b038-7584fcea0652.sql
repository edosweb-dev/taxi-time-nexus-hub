-- ================================================================
-- MIGRATION: Fix Trigger Annullamento/Modifica Servizi Consuntivati
-- Data: 2025-10-19
-- Issue: BUG #5 - Servizi annullati NON ricalcolano stipendi
-- ================================================================

-- 1. Aggiorna function trigger per gestire anche annullamenti
CREATE OR REPLACE FUNCTION public.trigger_update_stipendio_on_servizio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _mese INTEGER;
  _anno INTEGER;
  _should_recalculate BOOLEAN := FALSE;
BEGIN
  -- Determina se ricalcolare lo stipendio
  IF TG_OP = 'INSERT' THEN
    -- INSERT: ricalcola solo se nuovo servizio è completato/consuntivato
    _should_recalculate := NEW.stato IN ('completato', 'consuntivato');
  ELSIF TG_OP = 'UPDATE' THEN
    -- UPDATE: ricalcola se:
    -- A) Servizio diventa completato/consuntivato
    -- B) Servizio era completato/consuntivato e cambia stato (FIX BUG #5)
    _should_recalculate := 
      NEW.stato IN ('completato', 'consuntivato')
      OR 
      (OLD.stato IN ('completato', 'consuntivato') AND NEW.stato NOT IN ('completato', 'consuntivato'));
  END IF;
  
  -- Ricalcola se necessario e se utente è admin/socio
  IF _should_recalculate THEN
    IF has_role(NEW.assegnato_a, 'admin'::app_role) OR has_role(NEW.assegnato_a, 'socio'::app_role) THEN
      _mese := EXTRACT(MONTH FROM NEW.data_servizio)::INTEGER;
      _anno := EXTRACT(YEAR FROM NEW.data_servizio)::INTEGER;
      
      PERFORM ricalcola_stipendio_completo(NEW.assegnato_a, _mese, _anno);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 2. DROP e RICREA trigger senza WHEN condition (logica spostata in function)
DROP TRIGGER IF EXISTS trigger_stipendio_on_servizio_change ON servizi;
CREATE TRIGGER trigger_stipendio_on_servizio_change
AFTER INSERT OR UPDATE OF stato, km_totali, ore_sosta ON servizi
FOR EACH ROW
EXECUTE FUNCTION trigger_update_stipendio_on_servizio();

COMMENT ON TRIGGER trigger_stipendio_on_servizio_change ON servizi IS 
'Ricalcola stipendio automaticamente quando:
1. Servizio diventa completato/consuntivato (INSERT o UPDATE)
2. Servizio precedentemente completato/consuntivato viene annullato o modificato (UPDATE stato)
Garantisce che stipendi riflettano sempre lo stato reale dei servizi.';