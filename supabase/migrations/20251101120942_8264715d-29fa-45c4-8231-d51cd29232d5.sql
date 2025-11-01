-- Drop policy SELECT restrittiva su passeggeri
DROP POLICY IF EXISTS "Users can view azienda passeggeri" ON public.passeggeri;

-- Crea nuova policy SELECT che include dipendenti assegnati a servizi
CREATE POLICY "Users can view azienda passeggeri"
ON public.passeggeri
FOR SELECT
TO authenticated
USING (
  -- Admin e socio: accesso completo
  get_user_role(auth.uid()) IN ('admin', 'socio')
  OR
  -- Referenti: propri passeggeri
  referente_id = auth.uid()
  OR
  -- Utenti con azienda_id: passeggeri della propria azienda
  azienda_id IN (
    SELECT profiles.azienda_id
    FROM profiles
    WHERE profiles.id = auth.uid()
  )
  OR
  -- FIX: Dipendenti vedono passeggeri di servizi assegnati
  id IN (
    SELECT sp.passeggero_id
    FROM servizi_passeggeri sp
    JOIN servizi s ON s.id = sp.servizio_id
    WHERE s.assegnato_a = auth.uid()
  )
);