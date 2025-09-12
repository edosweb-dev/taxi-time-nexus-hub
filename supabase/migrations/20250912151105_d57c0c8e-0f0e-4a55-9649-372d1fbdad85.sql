-- Modifica la colonna referente_id per permettere valori NULL
-- Questo permette la creazione di servizi senza referente specifico

ALTER TABLE public.servizi 
ALTER COLUMN referente_id DROP NOT NULL;

-- Aggiungiamo un commento per documentare il cambiamento
COMMENT ON COLUMN public.servizi.referente_id IS 'ID del referente aziendale (opzionale). Se NULL, il servizio è collegato direttamente all''azienda senza referente specifico.';