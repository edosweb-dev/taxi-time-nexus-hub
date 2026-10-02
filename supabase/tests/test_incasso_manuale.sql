-- Test del fix 20261002120000_fix_incasso_manuale_bloccato.sql
-- Si esegue dopo la migration su un database di prova:
--   psql -v ON_ERROR_STOP=1 -f test_incasso_manuale.sql
-- Ogni caso fallito interrompe lo script con un'eccezione.

BEGIN;

-- 1. Incasso manuale dal form (socio_id NULL, causale libera): deve passare
INSERT INTO public.spese_aziendali (tipologia, causale, importo, socio_id)
VALUES ('incasso', 'Finanziamento bancario', 15000, NULL);

-- 2. Conversione spesa dipendente (socio_id NULL): deve passare
INSERT INTO public.spese_aziendali (tipologia, causale, importo, socio_id)
VALUES ('incasso', 'Conversione spesa dipendente - carburante', 50, NULL);

-- 3. Incasso automatico da servizio in contanti (con socio): deve passare
INSERT INTO public.spese_aziendali (tipologia, causale, importo, socio_id)
VALUES ('incasso', 'Servizio #abc eseguito in contanti', 80, '00000000-0000-0000-0000-000000000001');

-- 4. Incasso manuale attribuito a un socio: deve essere rifiutato
DO $$
BEGIN
  INSERT INTO public.spese_aziendali (tipologia, causale, importo, socio_id)
  VALUES ('incasso', 'Incasso a mano', 100, '00000000-0000-0000-0000-000000000001');
  RAISE EXCEPTION 'FAIL caso 4: incasso manuale con socio accettato';
EXCEPTION
  WHEN raise_exception THEN
    IF SQLERRM LIKE 'FAIL%' THEN RAISE; END IF;
END $$;

-- 5. Le altre tipologie non sono toccate
INSERT INTO public.spese_aziendali (tipologia, causale, importo, socio_id)
VALUES ('spesa', 'Carburante', 40, NULL),
       ('versamento', 'Versamento socio', 200, '00000000-0000-0000-0000-000000000001');

DO $$ BEGIN RAISE NOTICE 'OK: 5 casi superati'; END $$;

ROLLBACK;
