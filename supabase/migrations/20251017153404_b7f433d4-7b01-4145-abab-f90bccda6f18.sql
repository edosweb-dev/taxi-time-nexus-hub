-- Crea tabella pagamenti_stipendi
CREATE TABLE IF NOT EXISTS pagamenti_stipendi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  mese INTEGER NOT NULL CHECK (mese BETWEEN 1 AND 12),
  anno INTEGER NOT NULL CHECK (anno >= 2020),
  importo NUMERIC NOT NULL CHECK (importo >= 0),
  data_pagamento DATE NOT NULL DEFAULT CURRENT_DATE,
  modalita_pagamento_id UUID NOT NULL REFERENCES modalita_pagamenti(id) ON DELETE RESTRICT,
  spesa_aziendale_id UUID REFERENCES spese_aziendali(id) ON DELETE SET NULL,
  stato TEXT NOT NULL DEFAULT 'pagato' CHECK (stato IN ('pagato', 'annullato')),
  note TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, mese, anno)
);

-- Commenti per documentazione
COMMENT ON TABLE pagamenti_stipendi IS 'Registra i pagamenti effettivi degli stipendi ai dipendenti/soci';
COMMENT ON COLUMN pagamenti_stipendi.spesa_aziendale_id IS 'ID della spesa aziendale creata automaticamente dal trigger';
COMMENT ON COLUMN pagamenti_stipendi.stato IS 'Stato del pagamento: pagato (default) o annullato (per storni)';

-- Abilita RLS
ALTER TABLE pagamenti_stipendi ENABLE ROW LEVEL SECURITY;

-- Policy 1: Admin e soci possono fare tutto
CREATE POLICY "Admin e soci gestiscono tutti i pagamenti stipendi"
ON pagamenti_stipendi
FOR ALL
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

-- Policy 2: Dipendenti possono vedere solo i propri pagamenti
CREATE POLICY "Dipendenti vedono solo propri pagamenti stipendi"
ON pagamenti_stipendi
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'dipendente'
  )
);

-- Funzione che crea automaticamente spesa_aziendale quando si inserisce un pagamento
CREATE OR REPLACE FUNCTION create_spesa_for_pagamento_stipendio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dipendente_nome TEXT;
  _dipendente_cognome TEXT;
  _spesa_id UUID;
  _mese_nome TEXT;
BEGIN
  -- Fetch nome dipendente
  SELECT first_name, last_name 
  INTO _dipendente_nome, _dipendente_cognome
  FROM profiles
  WHERE id = NEW.user_id;
  
  -- Converti numero mese in nome italiano
  _mese_nome := CASE NEW.mese
    WHEN 1 THEN 'Gennaio'
    WHEN 2 THEN 'Febbraio'
    WHEN 3 THEN 'Marzo'
    WHEN 4 THEN 'Aprile'
    WHEN 5 THEN 'Maggio'
    WHEN 6 THEN 'Giugno'
    WHEN 7 THEN 'Luglio'
    WHEN 8 THEN 'Agosto'
    WHEN 9 THEN 'Settembre'
    WHEN 10 THEN 'Ottobre'
    WHEN 11 THEN 'Novembre'
    WHEN 12 THEN 'Dicembre'
  END;
  
  -- Crea spesa aziendale solo se stato = 'pagato'
  IF NEW.stato = 'pagato' THEN
    INSERT INTO spese_aziendali (
      data_movimento,
      importo,
      causale,
      tipologia,
      modalita_pagamento_id,
      stato_pagamento,
      tipo_causale,
      dipendente_id,
      note,
      created_by
    ) VALUES (
      NEW.data_pagamento,
      NEW.importo,
      'Stipendio ' || COALESCE(_dipendente_nome, '') || ' ' || COALESCE(_dipendente_cognome, '') || ' - ' || _mese_nome || ' ' || NEW.anno,
      'spesa',
      NEW.modalita_pagamento_id,
      'completato',
      'stipendio',
      NEW.user_id,
      'Pagamento automatico da pagamenti_stipendi ID: ' || NEW.id,
      NEW.created_by
    )
    RETURNING id INTO _spesa_id;
    
    -- Aggiorna pagamento con ID spesa creata
    UPDATE pagamenti_stipendi
    SET spesa_aziendale_id = _spesa_id
    WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger che si attiva AFTER INSERT su pagamenti_stipendi
CREATE TRIGGER trigger_create_spesa_pagamento_stipendio
  AFTER INSERT ON pagamenti_stipendi
  FOR EACH ROW
  EXECUTE FUNCTION create_spesa_for_pagamento_stipendio();

-- Trigger per aggiornare automaticamente updated_at
CREATE TRIGGER set_updated_at_pagamenti_stipendi
  BEFORE UPDATE ON pagamenti_stipendi
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Indici per performance
CREATE INDEX idx_pagamenti_stipendi_user_id ON pagamenti_stipendi(user_id);
CREATE INDEX idx_pagamenti_stipendi_anno_mese ON pagamenti_stipendi(anno, mese);
CREATE INDEX idx_pagamenti_stipendi_spesa_aziendale_id ON pagamenti_stipendi(spesa_aziendale_id);
CREATE INDEX idx_pagamenti_stipendi_stato ON pagamenti_stipendi(stato);