-- Creare la tabella conducenti_esterni
CREATE TABLE public.conducenti_esterni (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_cognome TEXT NOT NULL,
  email TEXT,
  telefono TEXT,
  note TEXT,
  attivo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- Aggiungere indice per ricerche veloci
CREATE INDEX idx_conducenti_esterni_nome ON public.conducenti_esterni(nome_cognome);
CREATE INDEX idx_conducenti_esterni_attivo ON public.conducenti_esterni(attivo);

-- Aggiungere foreign key alla tabella servizi
ALTER TABLE public.servizi 
ADD COLUMN conducente_esterno_id UUID REFERENCES public.conducenti_esterni(id);

-- Abilitare RLS
ALTER TABLE public.conducenti_esterni ENABLE ROW LEVEL SECURITY;

-- Policy per permettere a tutti di visualizzare conducenti attivi (per assegnazione servizi)
CREATE POLICY "Tutti possono visualizzare conducenti attivi" 
ON public.conducenti_esterni 
FOR SELECT 
USING (attivo = true);

-- Policy per permettere solo ad admin e soci di gestire conducenti
CREATE POLICY "Solo admin e soci possono gestire conducenti" 
ON public.conducenti_esterni 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'socio')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() 
  AND role IN ('admin', 'socio')
));

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_conducenti_esterni_updated_at
BEFORE UPDATE ON public.conducenti_esterni
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();