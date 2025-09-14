-- Critical Security Fixes for Data Protection - Phase 3: Service and Expense Data
-- Secure service records and expense data access

DO $$
BEGIN
    -- Fix service records (servizi) - tighten access controls
    DROP POLICY IF EXISTS "Gli utenti possono visualizzare i propri servizi" ON public.servizi;
    DROP POLICY IF EXISTS "Gli utenti possono creare i propri servizi" ON public.servizi;
    DROP POLICY IF EXISTS "I clienti possono aggiornare solo i propri servizi" ON public.servizi;
    DROP POLICY IF EXISTS "Admin e soci possono aggiornare tutti i servizi" ON public.servizi;

    -- Create secure service policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'servizi' 
        AND policyname = 'Admin e soci possono gestire tutti i servizi'
    ) THEN
        CREATE POLICY "Admin e soci possono gestire tutti i servizi"
        ON public.servizi
        FOR ALL
        TO public
        USING (
          get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text])
        )
        WITH CHECK (
          get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text])
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'servizi' 
        AND policyname = 'Clienti possono gestire solo i propri servizi'
    ) THEN
        CREATE POLICY "Clienti possono gestire solo i propri servizi"
        ON public.servizi
        FOR ALL
        TO public
        USING (
          (created_by = auth.uid() OR referente_id = auth.uid()) AND 
          get_user_role(auth.uid()) = 'cliente'::text
        )
        WITH CHECK (
          (created_by = auth.uid() OR referente_id = auth.uid()) AND 
          get_user_role(auth.uid()) = 'cliente'::text
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'servizi' 
        AND policyname = 'Dipendenti possono visualizzare servizi assegnati'
    ) THEN
        CREATE POLICY "Dipendenti possono visualizzare servizi assegnati"
        ON public.servizi
        FOR SELECT
        TO public
        USING (
          assegnato_a = auth.uid() AND get_user_role(auth.uid()) = 'dipendente'::text
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'servizi' 
        AND policyname = 'Dipendenti possono aggiornare servizi assegnati'
    ) THEN
        CREATE POLICY "Dipendenti possono aggiornare servizi assegnati"
        ON public.servizi
        FOR UPDATE
        TO public
        USING (
          assegnato_a = auth.uid() AND get_user_role(auth.uid()) = 'dipendente'::text
        );
    END IF;

    -- Fix expense data (spese_dipendenti) - ensure proper access control
    DROP POLICY IF EXISTS "Admin e socio possono vedere tutte le spese" ON public.spese_dipendenti;
    DROP POLICY IF EXISTS "Dipendenti possono inserire le proprie spese" ON public.spese_dipendenti;
    DROP POLICY IF EXISTS "Dipendenti possono vedere le proprie spese" ON public.spese_dipendenti;
    DROP POLICY IF EXISTS "spese_dipendenti_delete_policy" ON public.spese_dipendenti;
    DROP POLICY IF EXISTS "spese_dipendenti_insert_policy" ON public.spese_dipendenti;
    DROP POLICY IF EXISTS "spese_dipendenti_select_policy" ON public.spese_dipendenti;
    DROP POLICY IF EXISTS "spese_dipendenti_update_policy" ON public.spese_dipendenti;

    -- Create secure expense policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spese_dipendenti' 
        AND policyname = 'Admin e soci possono gestire tutte le spese dipendenti'
    ) THEN
        CREATE POLICY "Admin e soci possono gestire tutte le spese dipendenti"
        ON public.spese_dipendenti
        FOR ALL
        TO public
        USING (
          get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text])
        )
        WITH CHECK (
          get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text])
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'spese_dipendenti' 
        AND policyname = 'Dipendenti possono gestire le proprie spese'
    ) THEN
        CREATE POLICY "Dipendenti possono gestire le proprie spese"
        ON public.spese_dipendenti
        FOR ALL
        TO public
        USING (
          user_id = auth.uid() AND get_user_role(auth.uid()) = 'dipendente'::text
        )
        WITH CHECK (
          user_id = auth.uid() AND get_user_role(auth.uid()) = 'dipendente'::text
        );
    END IF;
END
$$;