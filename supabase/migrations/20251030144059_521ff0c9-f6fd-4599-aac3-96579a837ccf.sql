-- MIGRATION: Supporto Passeggeri Temporanei
-- Descrizione: Rende nullable passeggero_id e aggiunge campi inline

-- 1. Rendi passeggero_id nullable
ALTER TABLE public.servizi_passeggeri 
ALTER COLUMN passeggero_id DROP NOT NULL;

-- 2. Rimuovi e ricrea foreign key per permettere NULL
ALTER TABLE public.servizi_passeggeri 
DROP CONSTRAINT IF EXISTS servizi_passeggeri_passeggero_id_fkey;

ALTER TABLE public.servizi_passeggeri 
ADD CONSTRAINT servizi_passeggeri_passeggero_id_fkey 
FOREIGN KEY (passeggero_id) 
REFERENCES public.passeggeri(id) 
ON DELETE CASCADE;

-- 3. Aggiungi campo flag per distinguere tipo passeggero
ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS salva_in_database boolean DEFAULT true;

-- 4. Aggiungi campi inline per dati passeggeri temporanei
ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS nome_cognome_inline text;

ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS email_inline text;

ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS telefono_inline text;

ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS localita_inline text;

ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS indirizzo_inline text;

-- 5. Retrocompatibilità: aggiorna record esistenti
UPDATE public.servizi_passeggeri 
SET salva_in_database = true 
WHERE salva_in_database IS NULL;

-- 6. Check constraint per garantire coerenza
ALTER TABLE public.servizi_passeggeri 
DROP CONSTRAINT IF EXISTS check_temporary_passenger;

ALTER TABLE public.servizi_passeggeri 
ADD CONSTRAINT check_temporary_passenger 
CHECK (
  (salva_in_database = true AND passeggero_id IS NOT NULL) OR
  (salva_in_database = false AND passeggero_id IS NULL AND nome_cognome_inline IS NOT NULL)
);

-- 7. Indici per performance
CREATE INDEX IF NOT EXISTS idx_servizi_passeggeri_salva_db 
ON public.servizi_passeggeri(salva_in_database);

CREATE INDEX IF NOT EXISTS idx_servizi_passeggeri_servizio 
ON public.servizi_passeggeri(servizio_id);

-- 8. Documentazione schema
COMMENT ON COLUMN public.servizi_passeggeri.salva_in_database IS 
'Flag: true = passeggero permanente (in rubrica), false = passeggero temporaneo (ospite)';

COMMENT ON COLUMN public.servizi_passeggeri.passeggero_id IS 
'ID riferimento tabella passeggeri. NULL se passeggero temporaneo (ospite)';

COMMENT ON COLUMN public.servizi_passeggeri.nome_cognome_inline IS 
'Dati inline passeggero temporaneo (usato SOLO se salva_in_database = false)';