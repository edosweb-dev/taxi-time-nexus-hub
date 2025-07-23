-- Abilita RLS sulle tabelle mancanti
ALTER TABLE public.spese_categorie ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metodi_pagamento_spese ENABLE ROW LEVEL SECURITY;

-- Crea policy base per spese_categorie - tutti possono leggere
CREATE POLICY "Tutti possono visualizzare le categorie spese" 
ON public.spese_categorie 
FOR SELECT 
USING (true);

-- Solo admin possono gestire le categorie
CREATE POLICY "Solo admin possono gestire categorie spese" 
ON public.spese_categorie 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::text))
WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::text));

-- Crea policy base per metodi_pagamento_spese - tutti possono leggere
CREATE POLICY "Tutti possono visualizzare i metodi pagamento spese" 
ON public.metodi_pagamento_spese 
FOR SELECT 
USING (true);

-- Solo admin possono gestire i metodi pagamento
CREATE POLICY "Solo admin possono gestire metodi pagamento spese" 
ON public.metodi_pagamento_spese 
FOR ALL 
USING (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::text))
WITH CHECK (EXISTS ( SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'::text));