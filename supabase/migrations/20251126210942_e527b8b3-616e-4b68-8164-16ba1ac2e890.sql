-- Aggiungi campi per firma individuale dei passeggeri
ALTER TABLE servizi_passeggeri 
ADD COLUMN firma_url text,
ADD COLUMN firma_timestamp timestamp with time zone;

-- Commenti esplicativi
COMMENT ON COLUMN servizi_passeggeri.firma_url IS 'URL della firma digitale del passeggero';
COMMENT ON COLUMN servizi_passeggeri.firma_timestamp IS 'Timestamp della firma del passeggero';