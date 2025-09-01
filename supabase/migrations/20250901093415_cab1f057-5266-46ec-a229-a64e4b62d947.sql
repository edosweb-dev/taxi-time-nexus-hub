-- Add commission field to servizi table
ALTER TABLE public.servizi 
ADD COLUMN applica_provvigione boolean DEFAULT false;