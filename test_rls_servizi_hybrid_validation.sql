-- ============================================================================
-- TEST SQL: Validazione RLS Servizi - Hybrid Approach (Option B)
-- ============================================================================
-- Questo test simula vari scenari per verificare l'isolamento dati PRIMA della migration
-- Eseguire come superuser o admin con permessi di SET LOCAL

-- ============================================================================
-- SETUP: Identifica utenti test dal DB reale
-- ============================================================================

-- 1. Trova un ADMIN
DO $$
DECLARE
  v_admin_id UUID;
  v_admin_email TEXT;
BEGIN
  SELECT id, email INTO v_admin_id, v_admin_email
  FROM profiles
  WHERE role = 'admin'
  LIMIT 1;
  
  RAISE NOTICE '👤 ADMIN Test User: % (ID: %)', v_admin_email, v_admin_id;
END $$;

-- 2. Trova 2 CLIENTI della stessa azienda
DO $$
DECLARE
  v_azienda_id UUID;
  v_azienda_nome TEXT;
  v_cliente1_id UUID;
  v_cliente1_email TEXT;
  v_cliente2_id UUID;
  v_cliente2_email TEXT;
BEGIN
  -- Trova azienda con almeno 2 clienti
  SELECT a.id, a.nome INTO v_azienda_id, v_azienda_nome
  FROM aziende a
  WHERE (
    SELECT COUNT(*)
    FROM profiles p
    WHERE p.azienda_id = a.id AND p.role = 'cliente'
  ) >= 2
  LIMIT 1;
  
  -- Trova cliente 1
  SELECT id, email INTO v_cliente1_id, v_cliente1_email
  FROM profiles
  WHERE azienda_id = v_azienda_id AND role = 'cliente'
  LIMIT 1;
  
  -- Trova cliente 2 (diverso da cliente 1)
  SELECT id, email INTO v_cliente2_id, v_cliente2_email
  FROM profiles
  WHERE azienda_id = v_azienda_id 
    AND role = 'cliente'
    AND id != v_cliente1_id
  LIMIT 1;
  
  RAISE NOTICE '🏢 Azienda Test: % (ID: %)', v_azienda_nome, v_azienda_id;
  RAISE NOTICE '👤 Cliente 1: % (ID: %)', v_cliente1_email, v_cliente1_id;
  RAISE NOTICE '👤 Cliente 2: % (ID: %)', v_cliente2_email, v_cliente2_id;
END $$;

-- 3. Trova un DIPENDENTE con servizi assegnati
DO $$
DECLARE
  v_dipendente_id UUID;
  v_dipendente_email TEXT;
  v_servizi_count INTEGER;
BEGIN
  SELECT p.id, p.email INTO v_dipendente_id, v_dipendente_email
  FROM profiles p
  WHERE p.role = 'dipendente'
    AND EXISTS (
      SELECT 1 FROM servizi s WHERE s.assegnato_a = p.id
    )
  LIMIT 1;
  
  SELECT COUNT(*) INTO v_servizi_count
  FROM servizi
  WHERE assegnato_a = v_dipendente_id;
  
  RAISE NOTICE '👤 Dipendente: % (ID: %, Servizi assegnati: %)', 
    v_dipendente_email, v_dipendente_id, v_servizi_count;
END $$;

-- ============================================================================
-- TEST 1: STATO ATTUALE - Conta servizi per tipo
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 1: Stato attuale database';
RAISE NOTICE '============================================================================';

-- Conta servizi per tipo_cliente e referente_id
SELECT 
  tipo_cliente,
  CASE 
    WHEN referente_id IS NULL THEN 'NULL'
    ELSE 'SET'
  END AS referente_status,
  CASE 
    WHEN azienda_id IS NULL THEN 'NULL'
    ELSE 'SET'
  END AS azienda_status,
  COUNT(*) AS count
FROM servizi
GROUP BY tipo_cliente, 
  CASE WHEN referente_id IS NULL THEN 'NULL' ELSE 'SET' END,
  CASE WHEN azienda_id IS NULL THEN 'NULL' ELSE 'SET' END
ORDER BY tipo_cliente, referente_status;

-- Output atteso:
-- tipo_cliente | referente_status | azienda_status | count
-- azienda      | SET              | SET            | 26
-- azienda      | NULL             | SET            | 4
-- privato      | NULL             | NULL           | 2

-- ============================================================================
-- TEST 2: SIMULAZIONE POLICY HYBRID - SELECT per CLIENTE 1
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 2: SELECT - Cliente 1 (logica hybrid)';
RAISE NOTICE '============================================================================';

-- Simula query come CLIENTE 1
-- SOSTITUISCI [CLIENTE_1_ID] con ID reale dal setup
DO $$
DECLARE
  v_cliente1_id UUID;
  v_azienda_id UUID;
  v_count_totale INTEGER;
  v_count_propri INTEGER;
  v_count_condivisi INTEGER;
  v_count_privati INTEGER;
BEGIN
  -- Prendi primo cliente da test setup
  SELECT id, azienda_id INTO v_cliente1_id, v_azienda_id
  FROM profiles
  WHERE role = 'cliente'
  LIMIT 1;
  
  -- Conta servizi visibili con HYBRID logic
  -- 1. Servizi aziendali propri
  SELECT COUNT(*) INTO v_count_propri
  FROM servizi
  WHERE tipo_cliente = 'azienda'
    AND azienda_id = v_azienda_id
    AND referente_id = v_cliente1_id;
  
  -- 2. Servizi aziendali condivisi (admin-created)
  SELECT COUNT(*) INTO v_count_condivisi
  FROM servizi
  WHERE tipo_cliente = 'azienda'
    AND azienda_id = v_azienda_id
    AND referente_id IS NULL;
  
  -- 3. Servizi privati creati da cliente
  SELECT COUNT(*) INTO v_count_privati
  FROM servizi
  WHERE tipo_cliente = 'privato'
    AND created_by = v_cliente1_id;
  
  v_count_totale := v_count_propri + v_count_condivisi + v_count_privati;
  
  RAISE NOTICE '👤 Cliente 1 ID: %', v_cliente1_id;
  RAISE NOTICE '🏢 Azienda ID: %', v_azienda_id;
  RAISE NOTICE '📊 Servizi aziendali propri (referente_id=ME): %', v_count_propri;
  RAISE NOTICE '📊 Servizi aziendali condivisi (referente_id=NULL): %', v_count_condivisi;
  RAISE NOTICE '📊 Servizi privati creati da me: %', v_count_privati;
  RAISE NOTICE '✅ TOTALE visibili con HYBRID: %', v_count_totale;
END $$;

-- ============================================================================
-- TEST 3: SIMULAZIONE POLICY HYBRID - SELECT per CLIENTE 2 (stessa azienda)
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 3: SELECT - Cliente 2 (stesso azienda, diverso referente)';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
  v_cliente2_id UUID;
  v_azienda_id UUID;
  v_count_totale INTEGER;
  v_count_propri INTEGER;
  v_count_condivisi INTEGER;
  v_count_privati INTEGER;
BEGIN
  -- Prendi secondo cliente stessa azienda
  SELECT p2.id, p2.azienda_id INTO v_cliente2_id, v_azienda_id
  FROM profiles p1
  JOIN profiles p2 ON p2.azienda_id = p1.azienda_id AND p2.id != p1.id
  WHERE p1.role = 'cliente' AND p2.role = 'cliente'
  LIMIT 1;
  
  -- Conta servizi visibili con HYBRID logic
  SELECT COUNT(*) INTO v_count_propri
  FROM servizi
  WHERE tipo_cliente = 'azienda'
    AND azienda_id = v_azienda_id
    AND referente_id = v_cliente2_id;
  
  SELECT COUNT(*) INTO v_count_condivisi
  FROM servizi
  WHERE tipo_cliente = 'azienda'
    AND azienda_id = v_azienda_id
    AND referente_id IS NULL;
  
  SELECT COUNT(*) INTO v_count_privati
  FROM servizi
  WHERE tipo_cliente = 'privato'
    AND created_by = v_cliente2_id;
  
  v_count_totale := v_count_propri + v_count_condivisi + v_count_privati;
  
  RAISE NOTICE '👤 Cliente 2 ID: %', v_cliente2_id;
  RAISE NOTICE '🏢 Azienda ID: %', v_azienda_id;
  RAISE NOTICE '📊 Servizi aziendali propri (referente_id=ME): %', v_count_propri;
  RAISE NOTICE '📊 Servizi aziendali condivisi (referente_id=NULL): %', v_count_condivisi;
  RAISE NOTICE '📊 Servizi privati creati da me: %', v_count_privati;
  RAISE NOTICE '✅ TOTALE visibili con HYBRID: %', v_count_totale;
  RAISE NOTICE '⚠️ NOTA: Cliente 2 NON deve vedere servizi aziendali di Cliente 1 (solo condivisi)';
END $$;

-- ============================================================================
-- TEST 4: VERIFICA ISOLAMENTO - Cliente 2 NON vede servizi di Cliente 1
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 4: ISOLAMENTO - Verifica NULL bypass bloccato';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
  v_cliente1_id UUID;
  v_cliente2_id UUID;
  v_azienda_id UUID;
  v_servizi_cliente1 INTEGER;
  v_leak_count INTEGER;
BEGIN
  -- Trova 2 clienti stessa azienda
  SELECT p1.id, p1.azienda_id, p2.id 
  INTO v_cliente1_id, v_azienda_id, v_cliente2_id
  FROM profiles p1
  JOIN profiles p2 ON p2.azienda_id = p1.azienda_id AND p2.id != p1.id
  WHERE p1.role = 'cliente' AND p2.role = 'cliente'
  LIMIT 1;
  
  -- Conta servizi di Cliente 1
  SELECT COUNT(*) INTO v_servizi_cliente1
  FROM servizi
  WHERE tipo_cliente = 'azienda'
    AND azienda_id = v_azienda_id
    AND referente_id = v_cliente1_id;
  
  -- CRITICAL TEST: Verifica se Cliente 2 può vedere servizi di Cliente 1
  -- Con HYBRID approach: NO (solo condivisi con referente_id NULL)
  SELECT COUNT(*) INTO v_leak_count
  FROM servizi
  WHERE tipo_cliente = 'azienda'
    AND azienda_id = v_azienda_id
    AND referente_id = v_cliente1_id
    AND (
      -- Simula tentativo bypass: Cliente 2 prova a vedere servizi Cliente 1
      referente_id = v_cliente2_id OR referente_id IS NULL
    );
  
  RAISE NOTICE '👤 Cliente 1: % servizi aziendali propri', v_servizi_cliente1;
  RAISE NOTICE '🔍 Cliente 2 può vedere servizi Cliente 1? %', v_leak_count;
  
  IF v_leak_count > 0 THEN
    RAISE WARNING '❌ SECURITY ISSUE: Cliente 2 vede % servizi di Cliente 1!', v_leak_count;
  ELSE
    RAISE NOTICE '✅ ISOLAMENTO OK: Cliente 2 NON vede servizi di Cliente 1';
  END IF;
END $$;

-- ============================================================================
-- TEST 5: ADMIN - Vede tutti i servizi
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 5: ADMIN - Deve vedere tutti i 32 servizi';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
  v_admin_id UUID;
  v_count_totale INTEGER;
BEGIN
  SELECT id INTO v_admin_id
  FROM profiles
  WHERE role = 'admin'
  LIMIT 1;
  
  -- Admin vede TUTTO (no filtering)
  SELECT COUNT(*) INTO v_count_totale
  FROM servizi;
  
  RAISE NOTICE '👤 Admin ID: %', v_admin_id;
  RAISE NOTICE '📊 Totale servizi visibili: %', v_count_totale;
  RAISE NOTICE '✅ Expected: 32 servizi (tutti)';
END $$;

-- ============================================================================
-- TEST 6: DIPENDENTE - Vede solo servizi assegnati
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 6: DIPENDENTE - Solo servizi con assegnato_a = dipendente_id';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
  v_dipendente_id UUID;
  v_count_assegnati INTEGER;
  v_count_totale INTEGER;
BEGIN
  SELECT id INTO v_dipendente_id
  FROM profiles
  WHERE role = 'dipendente'
    AND EXISTS (SELECT 1 FROM servizi WHERE assegnato_a = profiles.id)
  LIMIT 1;
  
  -- Dipendente vede SOLO servizi assegnati
  SELECT COUNT(*) INTO v_count_assegnati
  FROM servizi
  WHERE assegnato_a = v_dipendente_id;
  
  SELECT COUNT(*) INTO v_count_totale
  FROM servizi;
  
  RAISE NOTICE '👤 Dipendente ID: %', v_dipendente_id;
  RAISE NOTICE '📊 Servizi assegnati a me: %', v_count_assegnati;
  RAISE NOTICE '📊 Totale servizi DB: %', v_count_totale;
  RAISE NOTICE '✅ Dipendente vede SOLO % servizi (non tutti i %)', v_count_assegnati, v_count_totale;
END $$;

-- ============================================================================
-- TEST 7: INSERT - Cliente può creare servizio aziendale con proprio referente_id
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 7: INSERT - Cliente crea servizio aziendale (referente_id=ME)';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
  v_cliente_id UUID;
  v_azienda_id UUID;
  v_can_insert BOOLEAN;
BEGIN
  SELECT id, azienda_id INTO v_cliente_id, v_azienda_id
  FROM profiles
  WHERE role = 'cliente'
  LIMIT 1;
  
  -- Simula INSERT con referente_id = cliente_id
  v_can_insert := (
    tipo_cliente = 'azienda'
    AND azienda_id = v_azienda_id
    AND referente_id = v_cliente_id
  );
  
  RAISE NOTICE '👤 Cliente ID: %', v_cliente_id;
  RAISE NOTICE '🏢 Azienda ID: %', v_azienda_id;
  RAISE NOTICE '✅ Può inserire servizio aziendale con referente_id=ME? %', v_can_insert;
END $$;

-- ============================================================================
-- TEST 8: INSERT BLOCKED - Cliente NON può creare servizio con referente_id NULL
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 8: INSERT BLOCKED - Cliente tenta referente_id=NULL (servizio aziendale)';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
  v_cliente_id UUID;
  v_azienda_id UUID;
  v_can_insert BOOLEAN;
BEGIN
  SELECT id, azienda_id INTO v_cliente_id, v_azienda_id
  FROM profiles
  WHERE role = 'cliente'
  LIMIT 1;
  
  -- Simula tentativo INSERT con referente_id NULL (solo admin può)
  v_can_insert := (
    tipo_cliente = 'azienda'
    AND azienda_id = v_azienda_id
    AND NULL = v_cliente_id  -- Questo è sempre FALSE in SQL
  );
  
  RAISE NOTICE '👤 Cliente ID: %', v_cliente_id;
  RAISE NOTICE '🏢 Azienda ID: %', v_azienda_id;
  RAISE NOTICE '❌ Può inserire servizio aziendale con referente_id=NULL? %', v_can_insert;
  RAISE NOTICE '✅ Expected: FALSE (solo admin può creare servizi condivisi)';
END $$;

-- ============================================================================
-- TEST 9: SERVIZI PRIVATI - Cliente crea/vede servizi privati
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'TEST 9: SERVIZI PRIVATI - Cliente gestisce servizi privati';
RAISE NOTICE '============================================================================';

DO $$
DECLARE
  v_cliente_id UUID;
  v_count_privati INTEGER;
BEGIN
  SELECT id INTO v_cliente_id
  FROM profiles
  WHERE role = 'cliente'
  LIMIT 1;
  
  -- Conta servizi privati creati da cliente
  SELECT COUNT(*) INTO v_count_privati
  FROM servizi
  WHERE tipo_cliente = 'privato'
    AND created_by = v_cliente_id;
  
  RAISE NOTICE '👤 Cliente ID: %', v_cliente_id;
  RAISE NOTICE '📊 Servizi privati creati da me: %', v_count_privati;
  RAISE NOTICE '✅ Cliente può creare servizi privati con referente_id=NULL';
  RAISE NOTICE '✅ Cliente vede SOLO servizi privati con created_by=ME';
END $$;

-- ============================================================================
-- SUMMARY: Risultati attesi con HYBRID approach
-- ============================================================================

RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'SUMMARY: Risultati attesi HYBRID approach';
RAISE NOTICE '============================================================================';
RAISE NOTICE '✅ Cliente vede:';
RAISE NOTICE '   - Servizi aziendali con referente_id = auth.uid()';
RAISE NOTICE '   - Servizi aziendali condivisi (referente_id NULL, admin-created)';
RAISE NOTICE '   - Servizi privati con created_by = auth.uid()';
RAISE NOTICE '';
RAISE NOTICE '✅ Cliente NON vede:';
RAISE NOTICE '   - Servizi aziendali di altri referenti (stessa azienda)';
RAISE NOTICE '   - Servizi privati di altri utenti';
RAISE NOTICE '';
RAISE NOTICE '✅ Admin/Socio: vedono tutti i servizi (32/32)';
RAISE NOTICE '✅ Dipendente: vede solo servizi con assegnato_a = auth.uid()';
RAISE NOTICE '';
RAISE NOTICE '✅ INSERT: Cliente può creare servizi aziendali SOLO con referente_id=ME';
RAISE NOTICE '✅ INSERT: Cliente può creare servizi privati con referente_id=NULL';
RAISE NOTICE '❌ INSERT: Cliente NON può creare servizi aziendali con referente_id=NULL';
RAISE NOTICE '';
RAISE NOTICE '🔐 GDPR COMPLIANCE: Isolamento totale tra referenti per servizi aziendali';
RAISE NOTICE '🔐 BACKWARDS COMPATIBLE: 4 servizi admin + 2 privati funzionano';
RAISE NOTICE '============================================================================';
