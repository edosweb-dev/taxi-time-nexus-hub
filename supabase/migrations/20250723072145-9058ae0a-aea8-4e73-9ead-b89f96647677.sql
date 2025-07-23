-- Aggiungi colonne per array di email e telefoni alla tabella aziende
ALTER TABLE public.aziende 
ADD COLUMN emails TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN telefoni TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Migra i dati esistenti dagli campi singoli agli array
UPDATE public.aziende 
SET emails = CASE 
  WHEN email IS NOT NULL AND email != '' THEN ARRAY[email]
  ELSE ARRAY[]::TEXT[]
END,
telefoni = CASE 
  WHEN telefono IS NOT NULL AND telefono != '' THEN ARRAY[telefono]
  ELSE ARRAY[]::TEXT[]
END;