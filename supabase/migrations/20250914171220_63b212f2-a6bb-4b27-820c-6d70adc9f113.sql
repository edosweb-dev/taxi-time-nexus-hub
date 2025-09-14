-- Critical Security Fixes for Data Protection - Phase 2: Financial and Salary Data
-- Secure financial movements and salary data access

DO $$
BEGIN
    -- Fix financial data (movimenti_aziendali) - restrict to admin/socio only
    DROP POLICY IF EXISTS "All users can view company movements" ON public.movimenti_aziendali;
    DROP POLICY IF EXISTS "Admins and partners can manage company movements" ON public.movimenti_aziendali;

    -- Create secure policy for financial movements
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'movimenti_aziendali' 
        AND policyname = 'Solo admin e soci possono gestire movimenti aziendali'
    ) THEN
        CREATE POLICY "Solo admin e soci possono gestire movimenti aziendali"
        ON public.movimenti_aziendali
        FOR ALL
        TO public
        USING (
          get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text])
        )
        WITH CHECK (
          get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'socio'::text])
        );
    END IF;

    -- Fix salary data (stipendi) policies for better security
    DROP POLICY IF EXISTS "Dipendenti can view own stipendi" ON public.stipendi;
    DROP POLICY IF EXISTS "Soci can view all stipendi" ON public.stipendi;
    DROP POLICY IF EXISTS "Admin can manage all stipendi" ON public.stipendi;
    DROP POLICY IF EXISTS "Soci can create stipendi" ON public.stipendi;
    DROP POLICY IF EXISTS "Soci can modify stipendi" ON public.stipendi;

    -- Create secure salary policies
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stipendi' 
        AND policyname = 'Admin può gestire tutti gli stipendi'
    ) THEN
        CREATE POLICY "Admin può gestire tutti gli stipendi"
        ON public.stipendi
        FOR ALL
        TO public
        USING (
          get_user_role(auth.uid()) = 'admin'::text
        )
        WITH CHECK (
          get_user_role(auth.uid()) = 'admin'::text
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stipendi' 
        AND policyname = 'Soci possono gestire tutti gli stipendi'
    ) THEN
        CREATE POLICY "Soci possono gestire tutti gli stipendi"
        ON public.stipendi
        FOR ALL
        TO public
        USING (
          get_user_role(auth.uid()) = 'socio'::text
        )
        WITH CHECK (
          get_user_role(auth.uid()) = 'socio'::text
        );
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'stipendi' 
        AND policyname = 'Dipendenti possono visualizzare solo i propri stipendi'
    ) THEN
        CREATE POLICY "Dipendenti possono visualizzare solo i propri stipendi"
        ON public.stipendi
        FOR SELECT
        TO public
        USING (
          user_id = auth.uid() AND get_user_role(auth.uid()) = 'dipendente'::text
        );
    END IF;
END
$$;