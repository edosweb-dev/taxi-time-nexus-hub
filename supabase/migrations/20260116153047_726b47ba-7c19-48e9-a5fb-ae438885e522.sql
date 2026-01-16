-- Aggiunge campi località per fermate intermedie personalizzate
ALTER TABLE servizi_passeggeri 
ADD COLUMN IF NOT EXISTS localita_presa_personalizzato text,
ADD COLUMN IF NOT EXISTS localita_destinazione_personalizzato text;

-- Commento per documentazione
COMMENT ON COLUMN servizi_passeggeri.localita_presa_personalizzato IS 'Località/città per fermata presa personalizzata';
COMMENT ON COLUMN servizi_passeggeri.localita_destinazione_personalizzato IS 'Località/città per fermata destinazione personalizzata';