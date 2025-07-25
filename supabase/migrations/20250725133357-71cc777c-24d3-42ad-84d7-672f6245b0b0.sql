-- Aggiungere nuovi campi alla tabella passeggeri per supportare il sistema migliorato
ALTER TABLE public.passeggeri 
ADD COLUMN nome TEXT,
ADD COLUMN cognome TEXT,
ADD COLUMN localita TEXT,
ADD COLUMN indirizzo TEXT;

-- Migrazione dei dati esistenti: dividere nome_cognome in nome e cognome
UPDATE public.passeggeri 
SET 
  nome = CASE 
    WHEN nome_cognome LIKE '% %' THEN SPLIT_PART(nome_cognome, ' ', 1)
    ELSE nome_cognome
  END,
  cognome = CASE 
    WHEN nome_cognome LIKE '% %' THEN SUBSTRING(nome_cognome FROM POSITION(' ' IN nome_cognome) + 1)
    ELSE ''
  END;

-- Creare un indice per migliorare le performance di ricerca
CREATE INDEX idx_passeggeri_nome_cognome ON public.passeggeri(nome, cognome);
CREATE INDEX idx_passeggeri_search ON public.passeggeri(nome, cognome, localita, email);

-- Aggiungere commenti per documentare i nuovi campi
COMMENT ON COLUMN public.passeggeri.nome IS 'Nome del passeggero';
COMMENT ON COLUMN public.passeggeri.cognome IS 'Cognome del passeggero';
COMMENT ON COLUMN public.passeggeri.localita IS 'Città o località del passeggero';
COMMENT ON COLUMN public.passeggeri.indirizzo IS 'Indirizzo completo del passeggero (via, numero civico, ecc.)';