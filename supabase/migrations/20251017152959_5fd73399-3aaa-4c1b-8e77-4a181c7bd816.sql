-- Aggiungi campo stipendio_fisso alla tabella profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stipendio_fisso NUMERIC DEFAULT 0 CHECK (stipendio_fisso >= 0);

-- Commento per documentazione
COMMENT ON COLUMN profiles.stipendio_fisso IS 
'Stipendio fisso mensile per dipendenti (inserito manualmente da admin/socio)';