-- Rimuovi vecchio constraint
ALTER TABLE spese_aziendali DROP CONSTRAINT IF EXISTS spese_aziendali_tipo_causale_check;

-- Crea nuovo constraint con tutti i valori usati nel form
ALTER TABLE spese_aziendali ADD CONSTRAINT spese_aziendali_tipo_causale_check 
CHECK (tipo_causale = ANY (ARRAY[
  'generica'::text, 
  'f24'::text, 
  'stipendio'::text,
  'pagamento_fornitori'::text,
  'spese_gestione'::text,
  'multe'::text,
  'fattura_conducenti_esterni'::text
]));