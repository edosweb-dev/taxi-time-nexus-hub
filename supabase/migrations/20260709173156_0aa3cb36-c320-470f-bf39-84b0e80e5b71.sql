CREATE OR REPLACE FUNCTION public.create_incasso_for_contanti_service()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  _modalita_pagamento_id UUID;
  _causale TEXT;
BEGIN
  IF NEW.metodo_pagamento = 'Contanti' AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = NEW.assegnato_a AND role = 'socio'
  ) THEN
    _causale := 'Servizio #' || NEW.id || ' eseguito in contanti';

    IF EXISTS (
      SELECT 1 FROM public.spese_aziendali
      WHERE tipologia = 'incasso' AND causale = _causale
    ) THEN
      RETURN NEW;
    END IF;

    SELECT id INTO _modalita_pagamento_id
    FROM public.modalita_pagamenti WHERE nome = 'Contanti';

    INSERT INTO public.spese_aziendali (
      data_movimento, importo, causale, tipologia,
      modalita_pagamento_id, stato_pagamento, socio_id, created_by
    ) VALUES (
      NEW.data_servizio,
      COALESCE(NEW.incasso_ricevuto, NEW.incasso_previsto, 0),
      _causale,
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

DROP TRIGGER IF EXISTS create_incasso_on_contanti_service ON public.servizi;
DROP TRIGGER IF EXISTS create_incasso_on_insert_completato ON public.servizi;

CREATE TRIGGER create_incasso_on_insert_completato
AFTER INSERT ON public.servizi
FOR EACH ROW
WHEN (NEW.stato = 'completato')
EXECUTE FUNCTION public.create_incasso_for_contanti_service();