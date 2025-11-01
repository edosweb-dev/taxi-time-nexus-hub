-- Aggiungi colonna tipo a tabella passeggeri per distinguere permanenti da temporanei
ALTER TABLE passeggeri 
ADD COLUMN tipo VARCHAR(20) DEFAULT 'rubrica';

-- Aggiungi commento per documentazione
COMMENT ON COLUMN passeggeri.tipo IS 'Tipo passeggero: rubrica (permanente) o temporaneo (one-shot per singolo servizio)';

-- Crea indice per performance su query filtrate
CREATE INDEX idx_passeggeri_tipo ON passeggeri(tipo);