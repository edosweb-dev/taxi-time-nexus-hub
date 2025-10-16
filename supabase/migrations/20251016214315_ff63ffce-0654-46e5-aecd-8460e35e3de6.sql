-- 1. Aggiungi colonna tipo_causale con CHECK constraint
ALTER TABLE spese_aziendali 
ADD COLUMN IF NOT EXISTS tipo_causale text 
DEFAULT 'generica'
CHECK (tipo_causale IN ('generica', 'f24', 'stipendio'));

-- 2. Aggiungi FK dipendente per stipendi
ALTER TABLE spese_aziendali
ADD COLUMN IF NOT EXISTS dipendente_id uuid 
REFERENCES profiles(id) ON DELETE SET NULL;

-- 3. Constraint: stipendio richiede dipendente_id
ALTER TABLE spese_aziendali
ADD CONSTRAINT check_stipendio_dipendente 
CHECK (
  (tipo_causale = 'stipendio' AND dipendente_id IS NOT NULL) OR
  (tipo_causale != 'stipendio')
);

-- 4. Trigger: blocca creazione manuale incassi (solo da servizi)
CREATE OR REPLACE FUNCTION prevent_manual_incasso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Consenti incassi solo se causale inizia con "Servizio #" (automatici)
  IF NEW.tipologia = 'incasso' AND NEW.causale NOT LIKE 'Servizio #%' THEN
    RAISE EXCEPTION 'Gli incassi vengono creati automaticamente dai servizi in contanti';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_manual_incasso_trigger
  BEFORE INSERT ON spese_aziendali
  FOR EACH ROW EXECUTE FUNCTION prevent_manual_incasso();

-- 5. Aggiungi Bonifico se non esiste
INSERT INTO modalita_pagamenti (nome, attivo)
SELECT 'Bonifico', true
WHERE NOT EXISTS (
  SELECT 1 FROM modalita_pagamenti WHERE nome = 'Bonifico'
);

-- 6. Commento sulle colonne per documentazione
COMMENT ON COLUMN spese_aziendali.tipo_causale IS 'Tipo di causale strutturata: generica, f24, stipendio';
COMMENT ON COLUMN spese_aziendali.dipendente_id IS 'Dipendente associato (obbligatorio se tipo_causale=stipendio)';