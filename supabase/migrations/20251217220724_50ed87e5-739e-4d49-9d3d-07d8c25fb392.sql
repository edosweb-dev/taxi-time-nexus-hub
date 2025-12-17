-- FASE 1: Fix DEFAULT IVA da 22 a 10
-- Cambia il DEFAULT della colonna iva da 22 a 10
ALTER TABLE servizi ALTER COLUMN iva SET DEFAULT 10.0;

-- Log per verifica
COMMENT ON COLUMN servizi.iva IS 'Aliquota IVA applicata al servizio. Default: 10%';