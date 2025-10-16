-- Migration: add_consuntivazione_fields
-- Aggiunge campi per ore sosta e km totali alla tabella servizi

ALTER TABLE servizi 
ADD COLUMN IF NOT EXISTS ore_sosta numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS ore_sosta_fatturate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS km_totali numeric;

-- Commenti sui nuovi campi
COMMENT ON COLUMN servizi.ore_sosta IS 'Ore di sosta effettuate durante il servizio';
COMMENT ON COLUMN servizi.ore_sosta_fatturate IS 'Ore di sosta addebitate al cliente';
COMMENT ON COLUMN servizi.km_totali IS 'Chilometri totali percorsi durante il servizio';