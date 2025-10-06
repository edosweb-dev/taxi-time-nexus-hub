-- Aggiungi nuovo stato 'bozza' per i servizi
-- Gli stati esistenti erano: 'da_assegnare', 'assegnato', 'completato', 'annullato', 'non_accettato', 'consuntivato'
-- Ora aggiungiamo 'bozza' per inserimenti veloci

-- Modifica il tipo di colonna stato per supportare il nuovo valore
-- In PostgreSQL, se la colonna è TEXT, non serve alterare il tipo
-- Aggiungi un commento per documentare gli stati validi
COMMENT ON COLUMN servizi.stato IS 'Stati validi: bozza, da_assegnare, assegnato, completato, annullato, non_accettato, consuntivato';

-- Crea un indice per velocizzare le query filtrate per stato bozza
CREATE INDEX IF NOT EXISTS idx_servizi_stato_bozza ON servizi(stato) WHERE stato = 'bozza';