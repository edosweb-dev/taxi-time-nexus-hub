-- Aggiungi colonne inline per dati passeggeri temporanei
ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS nome_cognome_inline text,
ADD COLUMN IF NOT EXISTS email_inline text,
ADD COLUMN IF NOT EXISTS telefono_inline text,
ADD COLUMN IF NOT EXISTS localita_inline text,
ADD COLUMN IF NOT EXISTS indirizzo_inline text;

COMMENT ON COLUMN public.servizi_passeggeri.nome_cognome_inline IS 'Dati passeggero inline se salva_in_database = false';