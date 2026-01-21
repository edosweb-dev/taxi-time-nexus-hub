-- Rimuove il vecchio constraint
ALTER TABLE spese_aziendali 
DROP CONSTRAINT IF EXISTS spese_aziendali_tipologia_check;

-- Aggiunge il nuovo constraint con 'versamento'
ALTER TABLE spese_aziendali 
ADD CONSTRAINT spese_aziendali_tipologia_check 
CHECK (tipologia IN ('spesa', 'incasso', 'prelievo', 'versamento'));

-- Commento per documentazione
COMMENT ON CONSTRAINT spese_aziendali_tipologia_check ON spese_aziendali 
IS 'Tipologie valide: spesa, incasso, prelievo, versamento';