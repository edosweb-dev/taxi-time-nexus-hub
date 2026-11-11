-- Fix numerazione servizi bloccata su TT-100-2026.
--
-- Causa: LPAD(x, 3, '0') in Postgres TRONCA quando x supera i 3 caratteri.
-- Superato TT-999-2026 (25/05/2026), next_number valeva 1000 e LPAD restituiva
-- '100' -> ogni nuovo servizio riceveva TT-100-2026, e il MAX() continuava a
-- leggere 999 come massimo. 180 servizi hanno condiviso lo stesso identificativo.
--
-- Backup delle righe interessate: public.backup_id_progressivo_20260709

-- 1. Generatore che allarga invece di troncare oltre le 3 cifre.
CREATE OR REPLACE FUNCTION public.generate_servizio_id_progressivo(anno_servizio INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  next_number INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SPLIT_PART(id_progressivo, '-', 2) AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.servizi
  WHERE id_progressivo LIKE 'TT-%'
    AND EXTRACT(YEAR FROM data_servizio) = anno_servizio;

  RETURN 'TT-' || LPAD(next_number::TEXT, GREATEST(3, LENGTH(next_number::TEXT)), '0')
              || '-' || anno_servizio::TEXT;
END;
$fn$;

-- 2. Rinumerazione dei 180 duplicati (il piu' vecchio, legittimo, resta TT-100-2026).
WITH da_correggere AS (
  SELECT id, 999 + ROW_NUMBER() OVER (ORDER BY created_at, id) AS nuovo
  FROM public.servizi
  WHERE id_progressivo = 'TT-100-2026'
    AND created_at > (SELECT min(created_at) FROM public.servizi WHERE id_progressivo = 'TT-100-2026')
)
UPDATE public.servizi s
SET id_progressivo = 'TT-' || d.nuovo::TEXT || '-2026'
FROM da_correggere d
WHERE s.id = d.id;

-- 3. Il database rifiuta i duplicati da qui in avanti.
CREATE UNIQUE INDEX IF NOT EXISTS servizi_id_progressivo_unique ON public.servizi (id_progressivo);
