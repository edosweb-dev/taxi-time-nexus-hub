-- Migration: Sistema prese intermedie passeggeri con ordine

-- Aggiungi campo ordine_presa alla tabella servizi_passeggeri
ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS ordine_presa integer DEFAULT 1;

-- Aggiungi campo usa_destinazione_personalizzata per coerenza
ALTER TABLE public.servizi_passeggeri 
ADD COLUMN IF NOT EXISTS usa_destinazione_personalizzata boolean DEFAULT false;

-- Crea indice per ottimizzare query ordinate
CREATE INDEX IF NOT EXISTS idx_servizi_passeggeri_ordine 
ON servizi_passeggeri(servizio_id, ordine_presa);

-- Commenti descrittivi
COMMENT ON COLUMN servizi_passeggeri.ordine_presa IS 'Ordine di presa del passeggero nel percorso (1 = primo)';
COMMENT ON COLUMN servizi_passeggeri.usa_destinazione_personalizzata IS 'Se true, il passeggero ha una destinazione diversa da quella del servizio';