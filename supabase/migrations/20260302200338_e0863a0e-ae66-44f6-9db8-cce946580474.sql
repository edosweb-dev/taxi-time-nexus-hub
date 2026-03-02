-- Add is_richiesta_cliente flag to servizi
ALTER TABLE servizi ADD COLUMN IF NOT EXISTS is_richiesta_cliente boolean DEFAULT false;

COMMENT ON COLUMN servizi.is_richiesta_cliente IS 'TRUE se servizio creato da cliente (richiesta da confermare). FALSE se creato da admin/socio.';

CREATE INDEX IF NOT EXISTS idx_servizi_richieste_cliente ON servizi(is_richiesta_cliente) WHERE is_richiesta_cliente = true;