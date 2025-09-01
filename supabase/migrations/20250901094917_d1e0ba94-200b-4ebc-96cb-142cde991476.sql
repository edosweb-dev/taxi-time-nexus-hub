-- Create table for email notification templates
CREATE TABLE public.email_notifiche (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  email text NOT NULL,
  attivo boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  note text
);

-- Enable RLS
ALTER TABLE public.email_notifiche ENABLE ROW LEVEL SECURITY;

-- Create policies for email notifications
CREATE POLICY "Admin e soci possono gestire email notifiche" 
ON public.email_notifiche 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'socio')
  )
);

CREATE POLICY "Tutti possono visualizzare email notifiche attive" 
ON public.email_notifiche 
FOR SELECT 
USING (attivo = true);

-- Create junction table for service-email notifications
CREATE TABLE public.servizi_email_notifiche (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  servizio_id uuid NOT NULL REFERENCES public.servizi(id) ON DELETE CASCADE,
  email_notifica_id uuid NOT NULL REFERENCES public.email_notifiche(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(servizio_id, email_notifica_id)
);

-- Enable RLS
ALTER TABLE public.servizi_email_notifiche ENABLE ROW LEVEL SECURITY;

-- Create policies for service-email junction
CREATE POLICY "Gli utenti possono gestire notifiche dei propri servizi" 
ON public.servizi_email_notifiche 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.servizi s
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE s.id = servizi_email_notifiche.servizio_id 
    AND (
      s.created_by = auth.uid() 
      OR p.role IN ('admin', 'socio')
    )
  )
);