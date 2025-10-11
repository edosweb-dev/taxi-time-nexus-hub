-- Fix security warnings: imposta search_path per le funzioni

-- Funzione per generare ID progressivo formato TT-XXX-YYYY
CREATE OR REPLACE FUNCTION public.generate_servizio_id_progressivo(anno_servizio INTEGER)
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Trigger per generare automaticamente l'ID progressivo
CREATE OR REPLACE FUNCTION public.set_servizio_id_progressivo()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.id_progressivo IS NULL THEN
    NEW.id_progressivo := generate_servizio_id_progressivo(EXTRACT(YEAR FROM NEW.data_servizio)::INTEGER);
  END IF;
  RETURN NEW;
END;
$$;