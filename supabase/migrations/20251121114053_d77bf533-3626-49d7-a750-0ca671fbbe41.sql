-- ============================================
-- DATA MIGRATION: Aggiorna IVA 22% → 10%
-- Data: 2025-01-21
-- Scope: Servizi dal 2025-01-01 con metodi Carta/Bonifico/Contanti
-- ============================================

UPDATE servizi 
SET iva = 10 
WHERE iva = 22 
  AND data_servizio >= '2025-01-01'
  AND metodo_pagamento IN ('Carta', 'Bonifico Bancario', 'Contanti');