

## BUG-64: Notifiche email nuova richiesta servizio cliente — COMPLETATO

### Modifiche effettuate

#### 1. Migration DB
- Aggiunta colonna `email_notifiche_admin` (jsonb, default `[]`) a `impostazioni`

#### 2. Tipi TypeScript (`src/lib/types/impostazioni.ts`)
- Aggiunto `email_notifiche_admin: string[]` a `Impostazioni` e `ImpostazioniFormData`

#### 3. API Impostazioni
- `getImpostazioni.ts` — parsing del nuovo campo jsonb → `string[]`
- `updateImpostazioni.ts` — validazione Zod + salvataggio del campo

#### 4. UI Impostazioni admin
- Nuovo componente `EmailNotificheAdminForm.tsx`
- Nuovo tab "Notifiche Admin" in `ImpostazioniForm.tsx` (visibile solo per admin)

#### 5. Edge Function `send-notification`
- Carica `email_notifiche_admin` dalla config
- Per template `richiesta_cliente*`, aggiunge queste email come destinatari

#### 6. Pre-selezione email in `NuovoServizioPage.tsx`
- `useEffect` che pre-seleziona tutte le email notifiche dell'azienda

#### 7. Alert mancanza email
- Toast non bloccante se `emailNotificheIds.length === 0` al submit
