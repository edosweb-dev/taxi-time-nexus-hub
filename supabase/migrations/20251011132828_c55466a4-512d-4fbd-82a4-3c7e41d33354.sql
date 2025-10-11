-- Aggiungi campo per ID progressivo ai servizi
ALTER TABLE public.servizi 
ADD COLUMN IF NOT EXISTS id_progressivo TEXT;

-- Funzione per generare ID progressivo formato TT-XXX-YYYY
CREATE OR REPLACE FUNCTION public.generate_servizio_id_progressivo(anno_servizio INTEGER)
RETURNS TEXT AS $$
DECLARE
  next_number INTEGER;
  formatted_id TEXT;
BEGIN
  -- Trova il numero progressivo più alto per l'anno specificato
  SELECT COALESCE(MAX(
    CAST(
      SPLIT_PART(id_progressivo, '-', 2) AS INTEGER
    )
  ), 0) + 1
  INTO next_number
  FROM public.servizi
  WHERE id_progressivo LIKE 'TT-%' 
    AND EXTRACT(YEAR FROM data_servizio) = anno_servizio;
  
  -- Se non ci sono servizi per quest'anno, inizia da 1
  IF next_number IS NULL THEN
    next_number := 1;
  END IF;
  
  -- Formatta come TT-XXX-YYYY
  formatted_id := 'TT-' || LPAD(next_number::TEXT, 3, '0') || '-' || anno_servizio::TEXT;
  
  RETURN formatted_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger per generare automaticamente l'ID progressivo
CREATE OR REPLACE FUNCTION public.set_servizio_id_progressivo()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.id_progressivo IS NULL THEN
    NEW.id_progressivo := generate_servizio_id_progressivo(EXTRACT(YEAR FROM NEW.data_servizio)::INTEGER);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_servizio_id_progressivo ON public.servizi;
CREATE TRIGGER trigger_set_servizio_id_progressivo
BEFORE INSERT ON public.servizi
FOR EACH ROW
EXECUTE FUNCTION set_servizio_id_progressivo();

-- Genera ID progressivi per servizi esistenti usando una procedura
DO $$
DECLARE
  servizio_record RECORD;
  row_num INTEGER;
  anno INTEGER;
  prev_anno INTEGER := NULL;
BEGIN
  row_num := 0;
  
  FOR servizio_record IN 
    SELECT id, data_servizio, EXTRACT(YEAR FROM data_servizio)::INTEGER as anno
    FROM public.servizi
    WHERE id_progressivo IS NULL
    ORDER BY data_servizio, created_at
  LOOP
    anno := servizio_record.anno;
    
    -- Reset counter se cambia anno
    IF prev_anno IS NULL OR prev_anno != anno THEN
      row_num := 1;
      prev_anno := anno;
    ELSE
      row_num := row_num + 1;
    END IF;
    
    UPDATE public.servizi
    SET id_progressivo = 'TT-' || LPAD(row_num::TEXT, 3, '0') || '-' || anno::TEXT
    WHERE id = servizio_record.id;
  END LOOP;
END $$;