-- TXT-12 · Spegne il ricalcolo dello stipendio fatto dal database.
--
-- Il trigger trigger_stipendio_on_servizio_change chiamava
-- ricalcola_stipendio_completo, che applica la tabella tariffe ai km TOTALI
-- del mese (non a ogni servizio), usa ore_sosta invece di ore_attesa_socio e
-- una formula del netto diversa da quella del cliente. Scriveva quindi in
-- `stipendi` valori sbagliati, poi sovrascritti dall'app solo in alcuni
-- percorsi.
--
-- Dal ramo fix/txt-12-stipendio-per-servizio l'app ricalcola lo stipendio
-- (ricalcolaStipendioPerServizio, una sola formula per servizio) in ogni
-- percorso che chiude, modifica, annulla o elimina un servizio. Il cliente
-- lavora solo dall'app, quindi il trigger non serve più.
--
-- Da applicare SOLO dopo il rilascio in produzione del ramo TXT-12.
-- La funzione ricalcola_stipendio_completo resta nel database, non chiamata.

drop trigger if exists trigger_stipendio_on_servizio_change on public.servizi;
