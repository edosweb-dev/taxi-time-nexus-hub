## Diagnosi

**1. Salvataggio nel DB: OK**

Nel database `impostazioni.email_notifiche_admin` contiene:

```
["giuseppe.famiani@edos.it", "info@taxitime.it"]
```

Quindi la pagina `/impostazioni` sta scrivendo correttamente entrambe le email.

**2. Comportamento reale: solo una delle due viene usata**

Analizzando `email_logs` per gli invii `richiesta_cliente_completo` recenti:

- 29/04 08:30 → admin presente: solo `giuseppe.famiani@edos.it`
- 28/04 12:38 → presenti `info@taxitime.it`, `houstonman@libero.it`, `taxitime@virgilio.it`, `giuseppe.famiani@edos.it` (qui `info@taxitime.it` arrivava però dalle "email notifiche" del servizio, non dall'admin config)
- 28/04 08:40 → admin presente: solo `giuseppe.famiani@edos.it`

In **nessuna richiesta recente** `info@taxitime.it` è stata aggiunta come "Admin notification". È sempre soltanto `giuseppe.famiani@edos.it`.

**3. Causa probabile**

Il codice della edge function (`send-notification/index.ts` righe 675-683) è corretto: legge l'array e cicla aggiungendo tutti gli elementi. Quindi le ipotesi sono:

- (a) La edge function deployata in produzione è una versione precedente che leggeva il campo come stringa singola.
- (b) `info@taxitime.it` è stata aggiunta solo recentemente al DB e dopo il salvataggio non è ancora stata triggerata una nuova `richiesta_cliente_completo`. (Plausibile: `impostazioni.updated_at` è 2025-05-14, quindi il trigger su `updated_at` non scatta — non si può datare l'aggiunta).

In entrambi i casi la fix è la stessa: ridepliare la edge function (già aggiornata nel codice) e poi fare un test.

## Fix proposto

1. **Re-deploy `send-notification`** (basta una piccola edit/no-op del file per forzare il deploy).
2. **Aggiungere log diagnostico** prima della sezione admin per stampare `config.email_notifiche_admin` ricevuto, così la prossima volta che capita possiamo verificare in 5 secondi.
3. **Aggiungere un trigger `updated_at`** sulla tabella `impostazioni` (oggi non si aggiorna), così possiamo tracciare quando i campi cambiano.
4. **Test pratico**: inviare un'email di test "admin notification" usando il bottone già esistente in pagina Impostazioni → tab "Notifiche Admin", per verificare che entrambe le email ricevano.

## Modifiche tecniche

- `supabase/functions/send-notification/index.ts` — aggiungo log:
  ```ts
  console.log('[SEND-EMAIL] Config admin emails raw:', JSON.stringify(config.email_notifiche_admin));
  ```
  prima del blocco a riga 675.

- Migration SQL: trigger `BEFORE UPDATE ON impostazioni` che setta `updated_at = now()` (riusa la funzione `update_updated_at_column()` già presente).

## Verifica dopo il fix

1. Apri `/impostazioni` → tab "Notifiche Admin" → click "📧 Invia email di test" → entrambe le caselle ricevono.
2. Crea (come cliente) una nuova richiesta servizio → controllo `email_logs` filtrando `template_slug = 'richiesta_cliente_completo'` e l'ultimo gruppo ora include sia `giuseppe.famiani@edos.it` che `info@taxitime.it`.
3. Modifica il campo in Impostazioni → `updated_at` cambia.