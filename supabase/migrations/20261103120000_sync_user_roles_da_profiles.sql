-- ============================================================================
-- FIX: i clienti creati dopo il 20/07/2026 non riescono a inserire servizi
--      ("new row violates row-level security policy for table servizi").
--
-- CAUSA: dal fix 20260720120000 get_user_role() legge davvero user_roles.
--        Nessuno però scrive in user_roles quando nasce un utente:
--        - la edge function create-user fa upsert solo su profiles
--        - il trigger handle_new_user inserisce solo in profiles
--        Il backfill del 20/07 ha coperto gli utenti esistenti quel giorno;
--        tutti quelli creati dopo hanno get_user_role() = NULL e tutte le
--        policy basate sul ruolo (18 su 10 tabelle) li respingono.
--
-- SOLUZIONE:
--   1. backfill: ogni profilo senza riga in user_roles la riceve
--   2. trigger su profiles (INSERT e UPDATE OF role) che tiene user_roles
--      allineato a profiles.role, che resta la fonte usata dall'interfaccia
--
-- SICUREZZA: il trigger su UPDATE accetta un cambio ruolo solo se arriva da
--   un contesto senza utente finale (service role, SQL editor, trigger auth)
--   oppure da un admin/socio. Un utente che prova a cambiarsi il ruolo da
--   solo riceve un errore: la sincronizzazione non può diventare una scala
--   verso 'admin'.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Step 1: backfill dei profili senza ruolo
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
-- Step 2: funzione di sincronizzazione
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.sync_user_role_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.role IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
      RETURN NEW;
    END IF;

    IF auth.uid() IS NOT NULL
       AND NOT public.has_role(auth.uid(), 'admin'::public.app_role)
       AND NOT public.has_role(auth.uid(), 'socio'::public.app_role) THEN
      RAISE EXCEPTION 'Solo admin e soci possono cambiare il ruolo di un utente'
        USING ERRCODE = '42501';
    END IF;

    -- il ruolo è uno solo: si toglie il vecchio prima di mettere il nuovo,
    -- altrimenti un admin retrocesso resterebbe admin per get_user_role()
    DELETE FROM public.user_roles
    WHERE user_id = NEW.id
      AND role <> NEW.role::public.app_role;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, NEW.role::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

-- ----------------------------------------------------------------------------
-- Step 3: trigger
-- ----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS sync_user_role_on_profile_insert ON public.profiles;
CREATE TRIGGER sync_user_role_on_profile_insert
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_from_profile();

DROP TRIGGER IF EXISTS sync_user_role_on_profile_update ON public.profiles;
CREATE TRIGGER sync_user_role_on_profile_update
AFTER UPDATE OF role ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_role_from_profile();

COMMIT;

-- ============================================================================
-- DIAGNOSI PRIMA (eseguire a mano): quanti profili sono senza ruolo, e chi
--   SELECT p.id, p.first_name, p.last_name, p.email, p.role
--   FROM public.profiles p
--   WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);
--
-- VERIFICA DOPO (eseguire a mano):
--   -- deve restituire 0 righe
--   SELECT p.id FROM public.profiles p
--   WHERE NOT EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id);
--
--   -- deve restituire 0 righe (nessuna discordanza)
--   SELECT p.id, p.role, ur.role
--   FROM public.profiles p
--   JOIN public.user_roles ur ON ur.user_id = p.id
--   WHERE p.role <> ur.role::text;
-- ============================================================================
