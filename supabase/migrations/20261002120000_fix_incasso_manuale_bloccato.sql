-- ============================================================================
-- FIX: «Salva movimento» con tipo «Incasso (entrata cassa)» non salva.
--
-- CAUSA: il trigger prevent_manual_incasso_trigger (ottobre 2025) rifiuta ogni
--        incasso la cui causale non inizia con "Servizio #". Il form Spese
--        aziendali offre però «Incasso» come tipo di movimento: l'INSERT viene
--        sempre respinto con "Gli incassi vengono creati automaticamente dai
--        servizi in contanti". Lo stesso blocco colpisce anche la conversione
--        delle spese dipendenti (causale "Conversione spesa dipendente - ...").
--
-- PERCHÉ IL BLOCCO ESISTEVA: calcola_stipendio somma gli incassi con
--        socio_id = socio come incassi in contanti del socio. Un incasso
--        manuale attribuito a un socio altererebbe il suo stipendio.
--
-- FIX: si blocca solo l'incasso manuale ATTRIBUITO a un socio. Gli incassi
--      non attribuiti (socio_id NULL: finanziamenti, entrate di cassa
--      generiche, conversioni) passano e non toccano gli stipendi.
--      Gli incassi automatici dei servizi ("Servizio #...") passano come prima.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_manual_incasso()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF NEW.tipologia = 'incasso'
     AND NEW.socio_id IS NOT NULL
     AND NEW.causale NOT LIKE 'Servizio #%' THEN
    RAISE EXCEPTION 'Un incasso manuale non può essere attribuito a un socio: gli incassi dei soci vengono creati automaticamente dai servizi in contanti';
  END IF;
  RETURN NEW;
END;
$$;
