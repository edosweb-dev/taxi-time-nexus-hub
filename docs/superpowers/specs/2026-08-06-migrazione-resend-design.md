# Migrazione delle notifiche email da SMTP Aruba a Resend

Data: 2026-08-06

## Problema

`send-notification` perde notifiche in modo intermittente. Il cliente ha segnalato TT-1207, TT-1212, TT-1215, TT-1222, TT-1223, TT-1224; il database conferma tutti e sei.

### Causa radice (confermata dai log runtime)

L'edge function apre la connessione SMTP verso `smtps.aruba.it:465` **dentro il worker Supabase**, che dispone di circa 2 secondi di CPU per invocazione. Quando Aruba non accetta la connessione immediatamente, il budget si esaurisce e il worker viene terminato con `CPU Time exceeded` (HTTP 546) **prima di inviare la prima mail e prima di scrivere qualsiasi riga in `email_logs`**.

Nei log runtime l'ultima riga prima della morte è sempre `[SEND-EMAIL] UNIFIED render for: <slug>`, mai un `✅ Sent`.

Il comportamento è **binario, non graduale**. Misurando `email_logs` su 45 giorni, quando l'invio funziona il tempo per mail è sempre compreso fra 0,28 e 0,61 secondi, ogni singolo giorno, senza degrado. Quando non funziona, la connessione non si apre affatto. Non esiste una via di mezzo: non è "Aruba lenta", è "Aruba che rifiuta la connessione in quell'istante".

Il guasto arriva a raffiche di minuti. Il 2026-08-06, fra le 11:20:45 e le 11:27:06, sono morti 9 tentativi su 9 relativi a tre servizi diversi.

### Prova che non dipende dal payload

TT-1224, stesso servizio, stesso template, stessi dati:

```
11:14:20  START richiesta_cliente_completo → 11:14:25  CPU Time exceeded
11:14:27  START richiesta_cliente_completo → 11:14:28  ✅✅✅ COMPLETE
```

Tre secondi di distanza, esito opposto.

### Piste escluse con evidenza

| Sospetto | Prova dell'esclusione |
|---|---|
| Note modificate prima della conferma | TT-1212 ha perso la richiesta cliente, creata dal cliente senza toccare le note |
| Tipo di mail (richiesta vs presa in carico) | Il 06/08 alle 10:48 e 10:49 due prese in carico riuscite; il 05/08 alle 16:14 una richiesta morta |
| Azienda | Colpite CARLO SALVI, OMET, HSM e NH indifferentemente |
| Numero di destinatari | Falliti con 3, 4 e 5; riusciti con 3, 4, 5, 6 e 7 |
| Regex di render e minify | Tutte lineari; il render gira in meno di un secondo quando l'invio riesce |

### Impatto misurato

- Ultime 24 ore: 16 POST, **11 morti (69%)**, 5 riusciti.
- Ultimi 30 giorni: **11 richieste su 55** e **11 prese in carico su 55** senza mail (20% ciascuna).

## Obiettivo

Eliminare la causa radice sostituendo l'invio SMTP con una chiamata HTTP all'API di Resend. `fetch` non addebita al worker l'handshake TLS, quindi il fusibile della CPU non scatta.

Obiettivo secondario, che segue automaticamente: poiché il worker sopravvive sempre, **ogni esito viene registrato in `email_logs`**, anche il fallimento. Oggi una notifica persa non lascia alcuna traccia.

## Decisioni

| Decisione | Scelta | Motivo |
|---|---|---|
| Dominio mittente | `noreply@taxitime.app` | Sull'account Resend da centralizzare è verificato solo `taxitime.app`, non `taxitime.it` |
| Indirizzo di risposta | `reply_to: info@taxitime.it` | Il mittente visibile cambia dominio, ma le risposte dei clienti continuano ad arrivare sulla casella già presidiata |
| Ambito della pulizia | Rimozione completa dell'SMTP | Nessuna schermata deve fingere di configurare un canale non più usato |
| Origine del mittente | Scritto nel codice | Resend accetta solo domini verificati: un indirizzo digitato a mano dal pannello può fermare tutti gli invii con un errore di battitura. È il pattern già usato da `send-reset-password-email` |
| Colonne `smtp_` in `impostazioni` | Non cancellate ora | La cancellazione distrugge in modo irreversibile la password Aruba cifrata. Si rimuove la lettura e l'interfaccia; il drop si valuta dopo alcuni giorni di invii puliti |
| Invio | Endpoint batch | Una sola richiesta HTTP per tutti i destinatari |
| Fallback SMTP | Nessuno | Reintrodurrebbe nel worker esattamente l'handshake che fa saltare il fusibile, proprio nei momenti di guasto |

## Architettura

**Prima:** `send-notification` → `denomailer` → handshake TLS verso `smtps.aruba.it:465` dentro il worker → fusibile CPU 2s → morte.

**Dopo:** `send-notification` → una `fetch` POST a `https://api.resend.com/emails/batch` → nessun handshake a carico del worker.

L'endpoint batch accetta fino a 100 messaggi per richiesta, supporta `html`, `text` e `reply_to`, e restituisce `{ "data": [ { "id": ... }, ... ] }` con gli id **nello stesso ordine dei messaggi inviati**. Questo permette di conservare una riga di `email_logs` per destinatario con una sola chiamata. Il limite di frequenza è di 10 richieste al secondo per team, quindi non vincolante. Gli allegati non sono supportati dall'endpoint batch: non ne usiamo.

## Componenti

### `supabase/functions/send-notification/index.ts`

- Rimuovere `import { SMTPClient }` e la funzione `withTimeout` (nata per contenere il problema SMTP; senza SMTP non serve più).
- Rimuovere dalle query su `impostazioni` i campi `smtp_host`, `smtp_port`, `smtp_secure`, `smtp_user`, `smtp_password_encrypted`, `smtp_from_name`, `smtp_from_email`. **Restano** `email_enabled` e `email_notifiche_admin`, che non sono configurazione SMTP: il primo è l'interruttore generale delle notifiche, il secondo la lista degli indirizzi amministrativi.
- Rimuovere il controllo "SMTP not configured" e la decifratura `atob(smtp_password_encrypted)`.
- **Attenzione alle guardie di ingresso.** Le tre select su `impostazioni` si trovano intorno alle righe 490, 585 e 674. Quella del ramo `test_mode` unificato condiziona l'esecuzione a `!smtpCfg.email_enabled || !smtpCfg.smtp_password_encrypted`: la seconda condizione va rimossa, altrimenti, sparita la password SMTP, l'invio di test si bloccherebbe sempre con "SMTP non configurato". Deve restare il solo controllo su `email_enabled`.
- Introdurre un helper unico, usato da tutti e tre i punti di invio attuali (invio reale e i due rami `test_mode`), che riceve la lista dei messaggi ed esegue la POST batch.
- Il mittente diventa `TaxiTime <noreply@taxitime.app>`, con `reply_to: info@taxitime.it`.

I passi 1-3 dell'attuale flusso — autenticazione, caricamento di configurazione, template, servizio e destinatari, render HTML — restano **invariati**: funzionano e non sono implicati nel guasto.

### `supabase/functions/send-reset-password-email/index.ts`

Cambio obbligato del mittente da `noreply@taxitime.it` a `noreply@taxitime.app`. Non è opzionale: quando il secret `RESEND_API_KEY` viene sostituito con la chiave del nuovo account, `taxitime.it` non risulta verificato e questa function smetterebbe di funzionare.

### `supabase/functions/test-smtp-connection/`

Eliminata. Il suo unico chiamante è `SmtpConfigForm.tsx`, che viene sostituito.

### `src/components/impostazioni/SmtpConfigForm.tsx`

400 righe che gestiscono i sette campi SMTP, `email_enabled` e un pulsante di test della connessione. Sostituito da un componente che conserva **solo** `email_enabled` e indica che l'invio avviene tramite Resend. Il punto di montaggio è `ImpostazioniForm.tsx:274`.

### Secret `RESEND_API_KEY`

Già presente nel progetto Supabase e già usato da `send-reset-password-email`. Va aggiornato con la chiave del nuovo account su cui si centralizza.

## Flusso dati

1. Autenticazione del chiamante (invariata).
2. Caricamento di configurazione, template, servizio, destinatari (invariato).
3. Render dell'HTML unificato (invariato).
4. **Nuovo:** costruzione di un array di N messaggi, uno per destinatario, e una sola POST all'endpoint batch.
5. La risposta restituisce gli id nello stesso ordine: `data[i]` corrisponde al destinatario `i`. Si scrive una riga di `email_logs` per destinatario, con l'id Resend nella colonna `smtp_message_id`, che oggi ospita il message-id SMTP. La colonna mantiene il nome per non rompere le letture esistenti.
6. Se la POST fallisce, tutte le righe vengono scritte con stato `failed` e il messaggio d'errore restituito da Resend.

## Gestione degli errori

È il guadagno principale oltre alla fine dei 546. Oggi un guasto uccide il worker e non lascia traccia: la notifica persa non esiste da nessuna parte. Con `fetch` il worker sopravvive in ogni caso, quindi qualunque esito finisce in `email_logs`. Nel caso peggiore resta una riga `failed` con il motivo, invece del nulla attuale.

`invokeWithRetry.ts` resta invariato. I suoi tre tentativi ravvicinati erano inefficaci contro raffiche di minuti; con Resend diventeranno quasi sempre un tentativo solo.

## Fuori scope

Interventi separati e indipendenti, da affrontare subito dopo:

- Il popup "CONFERMA DI PRESA IN CARICO INVIATA" viene mostrato sempre, anche quando non parte nulla: `sendEmailNotification` inghiotte gli errori, quindi il ramo `toast.warning` in `useConfermaPCar.ts` è codice morto.
- Il pulsante verde di conferma non ha `disabled` né stato di caricamento in `ServizioSidebar.tsx` e `MobileServizioOptimized.tsx`; un secondo click rilancia l'intera operazione e può produrre invii doppi.
- Controllo periodico delle notifiche attese rispetto a `email_logs`, con rispedizione dei buchi.
- Validazione del formato email nei form dei referenti.

## Criteri di accettazione

1. Nessuna risposta `546` su `send-notification` nei log delle invocazioni.
2. Ogni invocazione produce righe in `email_logs`, con stato `sent` o `failed`: nessuna invocazione senza traccia.
3. Le mail arrivano da `noreply@taxitime.app` e rispondendo si scrive a `info@taxitime.it`.
4. Il reset password continua a funzionare.
5. Nessun riferimento residuo a `SMTPClient`, `smtp_host` o `test-smtp-connection` nel codice.

## Piano di verifica

Prerequisito già eseguito: allineamento del repo locale a `origin/main` (era 36 commit indietro).

- Invio in `test_mode` verso un indirizzo di prova, sui template `richiesta_cliente_completo` e `conferma_presa_carico_completo`.
- Controllo dei log delle invocazioni e di `email_logs`: assenza di 546, presenza degli id Resend.
- Prova del flusso di reset password, dato che la relativa function viene modificata.

## Rischi

| Rischio | Mitigazione |
|---|---|
| Il cambio di dominio mittente può far finire le prime mail in spam presso i clienti | Volumi bassi (media 18 mail al giorno, picco 50) verso destinatari stabili. Sorvegliare la prima settimana |
| Le mail escono dai thread esistenti dei clienti | Conseguenza accettata della scelta sul dominio; `reply_to` mantiene il punto di contatto invariato |
| Il drop futuro delle colonne `smtp_` cancella la password Aruba | Rinviato: si valuta dopo alcuni giorni di invii puliti |
| La chiave Resend e il token Supabase sono stati esposti in chat | Vanno ruotati a fine lavoro |
