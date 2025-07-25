-- Fix search_path security issue in database functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_incasso_for_contanti_service()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  _modalita_pagamento_id UUID;
BEGIN
  -- Verifica se è un pagamento contanti e assegnato a un socio
  IF NEW.metodo_pagamento = 'Contanti' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.assegnato_a AND role = 'socio'
  ) THEN
    -- Ottieni l'ID della modalità pagamento "Contanti"
    SELECT id INTO _modalita_pagamento_id FROM public.modalita_pagamenti WHERE nome = 'Contanti';
    
    -- Crea un nuovo movimento aziendale di incasso
    INSERT INTO public.spese_aziendali (
      data_movimento, 
      importo, 
      causale, 
      tipologia, 
      modalita_pagamento_id, 
      stato_pagamento, 
      socio_id, 
      created_by
    ) VALUES (
      NEW.data_servizio,
      COALESCE(NEW.incasso_ricevuto, NEW.incasso_previsto, 0),
      'Servizio #' || NEW.id || ' eseguito in contanti',
      'incasso',
      _modalita_pagamento_id,
      'completato',
      NEW.assegnato_a,
      NEW.created_by
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
    SELECT role FROM public.profiles WHERE id = user_id;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
begin
  insert into public.profiles (id, first_name, last_name, role)
  values (new.id, '', '', 'cliente');
  return new;
end;
$function$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;