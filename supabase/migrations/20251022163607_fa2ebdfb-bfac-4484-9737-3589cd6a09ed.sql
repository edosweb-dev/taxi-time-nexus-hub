-- Drop tutte le policies esistenti sulla tabella passeggeri
DROP POLICY IF EXISTS "passeggeri_delete_strict_isolation" ON public.passeggeri;
DROP POLICY IF EXISTS "passeggeri_insert_strict_isolation" ON public.passeggeri;
DROP POLICY IF EXISTS "passeggeri_select_strict_isolation" ON public.passeggeri;
DROP POLICY IF EXISTS "passeggeri_update_strict_isolation" ON public.passeggeri;
DROP POLICY IF EXISTS "Admin e soci possono inserire passeggeri" ON public.passeggeri;
DROP POLICY IF EXISTS "Referenti possono inserire propri passeggeri" ON public.passeggeri;
DROP POLICY IF EXISTS "Admin e soci full access passeggeri" ON public.passeggeri;
DROP POLICY IF EXISTS "Referenti possono gestire propri passeggeri" ON public.passeggeri;
DROP POLICY IF EXISTS "Users can view passeggeri" ON public.passeggeri;
DROP POLICY IF EXISTS "Users can view azienda passeggeri" ON public.passeggeri;

-- Policy 1: Admin e Soci - Full Access (ALL operations)
CREATE POLICY "Admin e soci full access passeggeri"
ON public.passeggeri
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'socio')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'socio')
  )
);

-- Policy 2: Referenti (clienti) - Possono gestire solo i propri passeggeri
CREATE POLICY "Referenti possono gestire propri passeggeri"
ON public.passeggeri
FOR ALL
TO authenticated
USING (
  referente_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'socio')
  )
)
WITH CHECK (
  referente_id = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'socio')
  )
);

-- Policy 3: Tutti gli utenti autenticati possono vedere passeggeri della propria azienda
CREATE POLICY "Users can view azienda passeggeri"
ON public.passeggeri
FOR SELECT
TO authenticated
USING (
  -- Admin/Soci vedono tutto
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'socio')
  )
  OR
  -- Referenti vedono solo propri passeggeri
  referente_id = auth.uid()
  OR
  -- Utenti vedono passeggeri della loro azienda
  azienda_id IN (
    SELECT azienda_id FROM public.profiles
    WHERE id = auth.uid()
  )
);

-- Assicurati che RLS sia abilitato
ALTER TABLE public.passeggeri ENABLE ROW LEVEL SECURITY;