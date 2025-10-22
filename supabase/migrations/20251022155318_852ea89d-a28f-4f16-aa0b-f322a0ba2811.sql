-- Aggiunta colonna salva_in_database alla tabella servizi_passeggeri
-- Questa colonna indica se il passeggero deve essere salvato in anagrafica permanente

ALTER TABLE public.servizi_passeggeri 
ADD COLUMN salva_in_database boolean NOT NULL DEFAULT true;

-- Commento descrittivo sulla colonna
COMMENT ON COLUMN public.servizi_passeggeri.salva_in_database IS 'Se true, il passeggero viene salvato in tabella passeggeri. Se false, dati salvati solo in servizi_passeggeri (one-time use)';