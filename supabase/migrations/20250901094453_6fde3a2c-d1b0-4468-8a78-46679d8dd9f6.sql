-- Add commission fields to aziende table
ALTER TABLE public.aziende 
ADD COLUMN provvigione_tipo text CHECK (provvigione_tipo IN ('fisso', 'percentuale')),
ADD COLUMN provvigione_valore numeric CHECK (provvigione_valore >= 0);