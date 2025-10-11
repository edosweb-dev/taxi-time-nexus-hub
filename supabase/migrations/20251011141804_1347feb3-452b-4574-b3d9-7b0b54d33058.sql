-- Migration: add_clienti_privati_support
-- Aggiunge supporto per clienti privati nei servizi

-- Step 1: Crea tabella clienti_privati
CREATE TABLE IF NOT EXISTS public.clienti_privati (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cognome text NOT NULL,
  email text,
  telefono text,
  indirizzo text,
  citta text,
  note text,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Trigger updated_at
CREATE TRIGGER set_updated_at_clienti_privati
  BEFORE UPDATE ON public.clienti_privati
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Indexes
CREATE INDEX idx_clienti_privati_nome_cognome 
  ON public.clienti_privati(nome, cognome);
CREATE INDEX idx_clienti_privati_created_by 
  ON public.clienti_privati(created_by);
CREATE INDEX idx_clienti_privati_email
  ON public.clienti_privati(email) WHERE email IS NOT NULL;

-- RLS
ALTER TABLE public.clienti_privati ENABLE ROW LEVEL SECURITY;

-- Policy: Admin e soci full access
CREATE POLICY "Admin e soci possono gestire tutti i clienti privati"
  ON public.clienti_privati FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'socio')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'socio')
    )
  );

-- Policy: Users can view clienti they created
CREATE POLICY "Utenti vedono clienti privati creati da loro"
  ON public.clienti_privati FOR SELECT
  TO authenticated
  USING (created_by = auth.uid());

-- Step 2: Modifica tabella servizi
ALTER TABLE public.servizi
  ADD COLUMN IF NOT EXISTS tipo_cliente text DEFAULT 'azienda' 
    CHECK (tipo_cliente IN ('azienda', 'privato'));

ALTER TABLE public.servizi
  ADD COLUMN IF NOT EXISTS cliente_privato_id uuid REFERENCES clienti_privati(id) ON DELETE SET NULL;

ALTER TABLE public.servizi
  ADD COLUMN IF NOT EXISTS cliente_privato_nome text;

ALTER TABLE public.servizi
  ADD COLUMN IF NOT EXISTS cliente_privato_cognome text;

-- Rendi azienda_id nullable (era NOT NULL)
ALTER TABLE public.servizi 
  ALTER COLUMN azienda_id DROP NOT NULL;

-- Constraint: Assicura che o azienda_id o cliente_privato sia valorizzato
ALTER TABLE public.servizi
  DROP CONSTRAINT IF EXISTS check_cliente_required;

ALTER TABLE public.servizi
  ADD CONSTRAINT check_cliente_required CHECK (
    (tipo_cliente = 'azienda' AND azienda_id IS NOT NULL) OR
    (tipo_cliente = 'privato' AND (
      cliente_privato_id IS NOT NULL OR 
      (cliente_privato_nome IS NOT NULL AND cliente_privato_cognome IS NOT NULL)
    ))
  );

-- Index per performance
CREATE INDEX IF NOT EXISTS idx_servizi_cliente_privato_id 
  ON public.servizi(cliente_privato_id) WHERE cliente_privato_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_servizi_tipo_cliente
  ON public.servizi(tipo_cliente);

-- Commenti per documentazione
COMMENT ON TABLE clienti_privati IS 'Anagrafica clienti privati (non aziende)';
COMMENT ON COLUMN servizi.tipo_cliente IS 'Tipo di cliente: azienda o privato';
COMMENT ON COLUMN servizi.cliente_privato_id IS 'FK a clienti_privati se salvato in anagrafica';
COMMENT ON COLUMN servizi.cliente_privato_nome IS 'Nome cliente privato se non salvato in anagrafica';
COMMENT ON COLUMN servizi.cliente_privato_cognome IS 'Cognome cliente privato se non salvato in anagrafica';