-- Critical Security Fixes for Data Protection - Phase 1: Passenger Data
-- Check and recreate passenger policies with proper access control

-- Only drop policies that actually exist and recreate with secure access
DO $$
BEGIN
    -- Drop existing passenger policies if they exist
    DROP POLICY IF EXISTS "Gli utenti possono visualizzare i passeggeri della propria azie" ON public.passeggeri;
    DROP POLICY IF EXISTS "Gli utenti possono inserire passeggeri per la propria azienda" ON public.passeggeri;
    DROP POLICY IF EXISTS "Gli utenti possono aggiornare i passeggeri della propria aziend" ON public.passeggeri;
    
    -- Create secure passenger policies if they don't exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'passeggeri' 
        AND policyname = 'Admin e soci possono gestire tutti i passeggeri'
    ) THEN
        CREATE POLICY "Admin e soci possono gestire tutti i passeggeri"
        ON public.passeggeri
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
        WHERE tablename = 'passeggeri' 
        AND policyname = 'Referenti possono gestire solo i propri passeggeri'
    ) THEN
        CREATE POLICY "Referenti possono gestire solo i propri passeggeri"
        ON public.passeggeri
        FOR ALL
        TO public
        USING (
          referente_id = auth.uid() AND get_user_role(auth.uid()) = 'cliente'::text
        )
        WITH CHECK (
          referente_id = auth.uid() AND get_user_role(auth.uid()) = 'cliente'::text
        );
    END IF;
END
$$;