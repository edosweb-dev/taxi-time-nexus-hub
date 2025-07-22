
-- Aggiungere i nuovi campi alla tabella feedback
ALTER TABLE public.feedback 
ADD COLUMN status TEXT NOT NULL DEFAULT 'nuovo',
ADD COLUMN admin_comment TEXT,
ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN resolved_by UUID REFERENCES auth.users(id);

-- Creare un constraint per i valori di status
ALTER TABLE public.feedback 
ADD CONSTRAINT feedback_status_check 
CHECK (status IN ('nuovo', 'in_lavorazione', 'risolto', 'chiuso'));

-- Aggiungere policy per permettere agli admin di aggiornare i feedback
CREATE POLICY "Admin and socio can update feedback"
ON public.feedback
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.id = auth.uid() 
  AND profiles.role IN ('admin', 'socio')
));

-- Aggiungere indice per migliorare le performance delle query filtrate per status
CREATE INDEX idx_feedback_status ON public.feedback(status);
CREATE INDEX idx_feedback_created_at ON public.feedback(created_at DESC);
