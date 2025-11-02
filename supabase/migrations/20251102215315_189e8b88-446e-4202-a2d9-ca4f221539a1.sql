-- STEP 1: Trova servizi con IVA errata per metodi senza IVA
-- (Solo per verifica, non modifica)
DO $$
BEGIN
  RAISE NOTICE '🔍 Verifica servizi con IVA errata per metodi cash-based...';
END $$;

-- STEP 2: Fix IVA per servizi con metodo "Contanti"
UPDATE servizi
SET iva = 0
WHERE metodo_pagamento = 'Contanti'
  AND iva IS NOT NULL
  AND iva > 0;

-- STEP 3: Fix IVA per altri metodi senza IVA (Uber, etc.)
UPDATE servizi
SET iva = 0
WHERE metodo_pagamento IN ('Uber', 'Free Now', 'Bolt')
  AND iva IS NOT NULL
  AND iva > 0;

-- STEP 4: Log finale
DO $$
DECLARE
  contanti_fixed INTEGER;
  uber_fixed INTEGER;
BEGIN
  SELECT COUNT(*) INTO contanti_fixed FROM servizi WHERE metodo_pagamento = 'Contanti' AND iva = 0;
  SELECT COUNT(*) INTO uber_fixed FROM servizi WHERE metodo_pagamento IN ('Uber', 'Free Now', 'Bolt') AND iva = 0;
  
  RAISE NOTICE '✅ Servizi "Contanti" corretti: %', contanti_fixed;
  RAISE NOTICE '✅ Servizi "Uber/FreeNow/Bolt" corretti: %', uber_fixed;
END $$;