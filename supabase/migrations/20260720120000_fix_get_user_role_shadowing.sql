-- ============================================================================
-- FIX: get_user_role() e get_user_role_and_azienda() restituiscono 'admin'
--      a qualunque utente autenticato.
--
-- CAUSA: il parametro si chiama `user_id` come la colonna `user_roles.user_id`.
--        In una funzione LANGUAGE SQL PostgreSQL dà precedenza alla COLONNA,
--        quindi `WHERE user_id = user_id` diventa una tautologia
--        (`ur.user_id = ur.user_id`) e l'ORDER BY per priorità restituisce
--        sempre 'admin'.
--
-- IMPATTO: 18 policy su 10 tabelle (servizi, stipendi, movimenti_aziendali,
--          passeggeri, reports, tariffe_km, configurazione_stipendi,
--          spese_dipendenti, servizi_passeggeri) valutano il ruolo tramite
--          queste funzioni. Oggi ogni utente autenticato le supera.
--
-- ATTENZIONE — perché lo Step 1 è obbligatorio:
--   Al momento della scrittura, `user_roles` contiene 11 righe contro 39
--   profili: 29 utenti (23 cliente, 4 dipendente, 2 admin) NON hanno alcun
--   ruolo assegnato. La funzione rotta lo stava mascherando.
--   Correggere la funzione SENZA il backfill farebbe restituire NULL per
--   quei 29 utenti, chiudendoli fuori dall'applicazione.
--   Verificato prima della stesura: 0 profili con role NULL, 0 discordanze
--   fra profiles.role e user_roles.role dove entrambi esistono.
--
-- Nota tecnica: il parametro NON può essere rinominato in `_user_id`.
--   CREATE OR REPLACE rifiuta il cambio di nome di un parametro, e DROP
--   fallirebbe per le 18 policy dipendenti. Si disambigua quindi
--   qualificando il parametro col nome della funzione: `get_user_role.user_id`.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Step 1: allinea user_roles a profiles.role (fonte di verità attuale)
-- ----------------------------------------------------------------------------
INSERT INTO public.user_roles (user_id, role)
SELECT p.id, p.role::public.app_role
FROM public.profiles p
WHERE p.role IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
  )
ON CONFLICT DO NOTHING;

-- ----------------------------------------------------------------------------
-- Step 2: corregge lo shadowing parametro/colonna
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ur.role::TEXT
  FROM public.user_roles ur
  WHERE ur.user_id = get_user_role.user_id
  ORDER BY
    CASE ur.role
      WHEN 'admin' THEN 1
      WHEN 'socio' THEN 2
      WHEN 'dipendente' THEN 3
      WHEN 'cliente' THEN 4
    END
  LIMIT 1
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role_and_azienda(user_id uuid)
RETURNS TABLE(role text, azienda_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT ur.role::TEXT, p.azienda_id
  FROM public.user_roles ur
  LEFT JOIN public.profiles p ON p.id = ur.user_id
  WHERE ur.user_id = get_user_role_and_azienda.user_id
  ORDER BY
    CASE ur.role
      WHEN 'admin' THEN 1
      WHEN 'socio' THEN 2
      WHEN 'dipendente' THEN 3
      WHEN 'cliente' THEN 4
    END
  LIMIT 1
$function$;

COMMIT;

-- ============================================================================
-- VERIFICA POST-APPLICAZIONE (eseguire manualmente, non fa parte della migration)
--
--   -- deve restituire NULL, non 'admin':
--   SELECT public.get_user_role('00000000-0000-0000-0000-000000000000'::uuid);
--
--   -- deve restituire 39 e 39 (nessun profilo scoperto):
--   SELECT (SELECT count(*) FROM public.profiles) AS profili,
--          (SELECT count(DISTINCT user_id) FROM public.user_roles) AS con_ruolo;
--
--   -- deve restituire 0 righe (nessuna discordanza):
--   SELECT p.id, p.role, ur.role
--   FROM public.profiles p
--   JOIN public.user_roles ur ON ur.user_id = p.id
--   WHERE p.role <> ur.role::text;
-- ============================================================================
