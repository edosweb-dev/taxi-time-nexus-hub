-- Rendi il campo referente_id opzionale nella tabella passeggeri
ALTER TABLE public.passeggeri ALTER COLUMN referente_id DROP NOT NULL;

-- Aggiorna la policy per permettere l'inserimento di passeggeri anche senza referente
DROP POLICY IF EXISTS "Gli utenti possono inserire passeggeri per la propria azienda" ON public.passeggeri;

CREATE POLICY "Gli utenti possono inserire passeggeri per la propria azienda" 
ON public.passeggeri 
FOR INSERT 
WITH CHECK (
  -- Admin e soci possono sempre inserire passeggeri
  (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'socio'::text]))) 
  OR 
  -- Oppure se c'è un referente, deve essere l'utente corrente
  (referente_id = auth.uid())
  OR
  -- Oppure se non c'è referente (è NULL), l'utente autenticato può inserire
  (referente_id IS NULL AND auth.uid() IS NOT NULL)
);

-- Aggiorna anche la policy di aggiornamento per essere consistente
DROP POLICY IF EXISTS "Gli utenti possono aggiornare i passeggeri della propria aziend" ON public.passeggeri;

CREATE POLICY "Gli utenti possono aggiornare i passeggeri della propria azienda" 
ON public.passeggeri 
FOR UPDATE 
USING (
  -- Admin e soci possono sempre aggiornare passeggeri
  (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'socio'::text]))) 
  OR 
  -- Oppure se c'è un referente, deve essere l'utente corrente
  (referente_id = auth.uid())
  OR
  -- Oppure se non c'è referente (è NULL), l'utente autenticato può aggiornare
  (referente_id IS NULL AND auth.uid() IS NOT NULL)
);

-- Aggiorna la policy di visualizzazione per includere passeggeri senza referente
DROP POLICY IF EXISTS "Gli utenti possono visualizzare i passeggeri della propria azie" ON public.passeggeri;

CREATE POLICY "Gli utenti possono visualizzare i passeggeri della propria azienda" 
ON public.passeggeri 
FOR SELECT 
USING (
  -- Admin e soci possono vedere tutti i passeggeri
  (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = ANY (ARRAY['admin'::text, 'socio'::text]))) 
  OR 
  -- Oppure se c'è un referente, deve essere l'utente corrente
  (referente_id = auth.uid())
  OR
  -- Oppure se non c'è referente, tutti gli utenti autenticati possono vedere
  (referente_id IS NULL AND auth.uid() IS NOT NULL)
  OR
  -- Oppure se l'azienda è accessibile all'utente
  (azienda_id IN ( SELECT aziende.id FROM aziende WHERE aziende.id = passeggeri.azienda_id))
);