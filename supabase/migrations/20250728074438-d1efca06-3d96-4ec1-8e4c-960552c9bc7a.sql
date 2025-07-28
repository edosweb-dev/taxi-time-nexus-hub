-- Add new fields to aziende table
ALTER TABLE public.aziende 
ADD COLUMN sdi TEXT,
ADD COLUMN pec TEXT, 
ADD COLUMN citta TEXT;