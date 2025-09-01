-- Add azienda_id to email_notifiche table
ALTER TABLE public.email_notifiche 
ADD COLUMN azienda_id uuid NOT NULL REFERENCES public.aziende(id) ON DELETE CASCADE;

-- Update RLS policies to include azienda_id filtering
DROP POLICY "Tutti possono visualizzare email notifiche attive" ON public.email_notifiche;

CREATE POLICY "Utenti possono vedere email della propria azienda" 
ON public.email_notifiche 
FOR SELECT 
USING (
  attivo = true AND (
    -- Admin e soci possono vedere tutte
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('admin', 'socio')
    )
    OR
    -- Altri utenti vedono solo quelle della loro azienda
    azienda_id IN (
      SELECT azienda_id FROM public.profiles 
      WHERE id = auth.uid()
    )
  )
);