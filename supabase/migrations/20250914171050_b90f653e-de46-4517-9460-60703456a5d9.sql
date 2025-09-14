-- Critical Security Fixes for Data Protection
-- Fix 1: Secure passenger data (passeggeri) - only authorized personnel can access PII
DROP POLICY IF EXISTS "Gli utenti possono visualizzare i passeggeri della propria azie" ON public.passeggeri;
DROP POLICY IF EXISTS "Gli utenti possono inserire passeggeri per la propria azienda" ON public.passeggeri;
DROP POLICY IF EXISTS "Gli utenti possono aggiornare i passeggeri della propria aziend" ON public.passeggeri;
DROP POLICY IF EXISTS "Admin e soci possono aggiornare tutti i passeggeri" ON public.passeggeri;

-- New secure policies for passeggeri - restrict to admin/socio and specific referente only
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

-- Fix 2: Secure salary data (stipendi) - only admin/socio and the specific employee
DROP POLICY IF EXISTS "Dipendenti can view own stipendi" ON public.stipendi;
DROP POLICY IF EXISTS "Soci can view all stipendi" ON public.stipendi;
DROP POLICY IF EXISTS "Admin can manage all stipendi" ON public.stipendi;
DROP POLICY IF EXISTS "Soci can create stipendi" ON public.stipendi;
DROP POLICY IF EXISTS "Soci can modify stipendi" ON public.stipendi;

-- New secure policies for stipendi
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

CREATE POLICY "Dipendenti possono visualizzare solo i propri stipendi"
ON public.stipendi
FOR SELECT
TO public
USING (
  user_id = auth.uid() AND get_user_role(auth.uid()) = 'dipendente'::text
);

-- Fix 3: Secure financial data (movimenti_aziendali) - only admin/socio
DROP POLICY IF EXISTS "All users can view company movements" ON public.movimenti_aziendali;
DROP POLICY IF EXISTS "Admins and partners can manage company movements" ON public.movimenti_aziendali;

-- New secure policies for movimenti_aziendali - restrict to admin and socio only
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

-- Fix 4: Secure service records (servizi) - tighten access controls
DROP POLICY IF EXISTS "Gli utenti possono visualizzare i propri servizi" ON public.servizi;
DROP POLICY IF EXISTS "Gli utenti possono creare i propri servizi" ON public.servizi;
DROP POLICY IF EXISTS "I clienti possono aggiornare solo i propri servizi" ON public.servizi;
DROP POLICY IF EXISTS "Admin e soci possono aggiornare tutti i servizi" ON public.servizi;

-- New secure policies for servizi
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

CREATE POLICY "Dipendenti possono visualizzare servizi assegnati"
ON public.servizi
FOR SELECT
TO public
USING (
  assegnato_a = auth.uid() AND get_user_role(auth.uid()) = 'dipendente'::text
);

CREATE POLICY "Dipendenti possono aggiornare servizi assegnati"
ON public.servizi
FOR UPDATE
TO public
USING (
  assegnato_a = auth.uid() AND get_user_role(auth.uid()) = 'dipendente'::text
);

-- Fix 5: Secure expense data (spese_dipendenti) - ensure proper access control
DROP POLICY IF EXISTS "Admin e socio possono vedere tutte le spese" ON public.spese_dipendenti;
DROP POLICY IF EXISTS "Dipendenti possono inserire le proprie spese" ON public.spese_dipendenti;
DROP POLICY IF EXISTS "Dipendenti possono vedere le proprie spese" ON public.spese_dipendenti;
DROP POLICY IF EXISTS "spese_dipendenti_delete_policy" ON public.spese_dipendenti;
DROP POLICY IF EXISTS "spese_dipendenti_insert_policy" ON public.spese_dipendenti;
DROP POLICY IF EXISTS "spese_dipendenti_select_policy" ON public.spese_dipendenti;
DROP POLICY IF EXISTS "spese_dipendenti_update_policy" ON public.spese_dipendenti;

-- New secure policies for spese_dipendenti
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