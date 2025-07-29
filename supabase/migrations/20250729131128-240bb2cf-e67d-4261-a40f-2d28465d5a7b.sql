-- Crea tabella per audit delle impersonificazioni admin
CREATE TABLE public.admin_impersonation_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_impersonation_log ENABLE ROW LEVEL SECURITY;

-- Politiche RLS - solo admin possono vedere e gestire i log
CREATE POLICY "Solo admin possono vedere log impersonificazioni" 
ON public.admin_impersonation_log 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Solo admin possono creare log impersonificazioni" 
ON public.admin_impersonation_log 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Solo admin possono aggiornare log impersonificazioni" 
ON public.admin_impersonation_log 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));