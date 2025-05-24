
# TaxiTime - Sistema di Gestione Servizi Taxi

## Panoramica del Progetto

TaxiTime è un'applicazione web completa per la gestione di servizi taxi aziendali, sviluppata con React, TypeScript, Tailwind CSS e Supabase. Il sistema permette la gestione di aziende clienti, servizi, autisti, report e molto altro.

## Indice

- [Architettura Tecnica](#architettura-tecnica)
- [Funzionalità Principali](#funzionalità-principali)
- [Struttura del Database](#struttura-del-database)
- [Autenticazione e Autorizzazione](#autenticazione-e-autorizzazione)
- [Moduli del Sistema](#moduli-del-sistema)
- [Generazione Report PDF](#generazione-report-pdf)
- [API e Edge Functions](#api-e-edge-functions)
- [Installazione e Setup](#installazione-e-setup)
- [Utilizzo](#utilizzo)

## Architettura Tecnica

### Stack Tecnologico

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **State Management**: TanStack Query (React Query)
- **Form Management**: React Hook Form con Zod validation
- **PDF Generation**: jsPDF con autoTable per report
- **Routing**: React Router DOM
- **Icons**: Lucide React

### Struttura del Progetto

```
src/
├── components/           # Componenti riutilizzabili
│   ├── ui/              # Componenti UI base (shadcn/ui)
│   ├── layouts/         # Layout dell'applicazione
│   ├── aziende/         # Gestione aziende
│   ├── servizi/         # Gestione servizi
│   ├── users/           # Gestione utenti
│   ├── shifts/          # Gestione turni
│   └── ...
├── hooks/               # Custom hooks
├── lib/                 # Utilities e tipi
├── pages/               # Pagine dell'applicazione
├── contexts/            # React contexts
└── integrations/        # Integrazioni esterne (Supabase)

supabase/
├── functions/           # Edge Functions
└── config.toml         # Configurazione Supabase
```

## Funzionalità Principali

### 1. Gestione Utenti e Ruoli

Il sistema supporta diversi ruoli utente:

- **Admin**: Accesso completo al sistema
- **Socio**: Gestione servizi e report
- **Cliente**: Visualizzazione servizi personali
- **Dipendente**: Gestione servizi assegnati

### 2. Gestione Aziende Clienti

- Anagrafica completa aziende
- Gestione referenti per azienda
- Impostazioni personalizzate per firma digitale
- Associazione servizi e report

### 3. Gestione Servizi

#### Stati del Servizio
- **Da Assegnare**: Servizio creato, in attesa di assegnazione
- **Assegnato**: Servizio assegnato a un autista
- **In Corso**: Servizio in esecuzione
- **Completato**: Servizio terminato, in attesa di consuntivazione
- **Consuntivato**: Servizio fatturato e chiuso

#### Flusso di Lavoro
1. **Creazione**: Admin/Socio crea nuovo servizio
2. **Assegnazione**: Assegnazione a dipendente interno o esterno
3. **Esecuzione**: Autista completa il servizio
4. **Firma Digitale**: Raccolta firma cliente (opzionale)
5. **Consuntivazione**: Inserimento dati finali e fatturazione

### 4. Sistema di Report PDF

Generazione automatica di report mensili in formato PDF con:
- Dettaglio servizi per azienda/referente
- Riepilogo ore e importi
- Firma digitale inclusa
- Storage sicuro in Supabase Storage

### 5. Gestione Turni

- Pianificazione turni dipendenti
- Vista calendario con filtri
- Gestione ferie e permessi
- Turni giornalieri, mattutini, pomeridiani

## Struttura del Database

### Tabelle Principali

#### `profiles`
```sql
- id (uuid, FK auth.users)
- first_name (text)
- last_name (text)
- role (text)
- azienda_id (uuid, FK aziende)
```

#### `aziende`
```sql
- id (uuid, PK)
- nome (text)
- partita_iva (text)
- email (text)
- telefono (text)
- indirizzo (text)
- firma_digitale_attiva (boolean)
```

#### `servizi`
```sql
- id (uuid, PK)
- azienda_id (uuid, FK aziende)
- referente_id (uuid, FK profiles)
- data_servizio (date)
- orario_servizio (time)
- indirizzo_presa (text)
- indirizzo_destinazione (text)
- assegnato_a (uuid, FK profiles)
- stato (text)
- metodo_pagamento (text)
- incasso_previsto (numeric)
- incasso_ricevuto (numeric)
- firma_url (text)
- note (text)
- ...
```

#### `passeggeri`
```sql
- id (uuid, PK)
- servizio_id (uuid, FK servizi)
- nome_cognome (text)
- telefono (text)
- email (text)
- usa_indirizzo_personalizzato (boolean)
- luogo_presa_personalizzato (text)
- destinazione_personalizzato (text)
```

#### `reports`
```sql
- id (uuid, PK)
- azienda_id (uuid, FK aziende)
- referente_id (uuid, FK profiles)
- month (integer)
- year (integer)
- file_path (text)
- file_name (text)
- servizi_ids (uuid[])
- bucket_name (text)
- created_by (uuid, FK profiles)
```

### Row Level Security (RLS)

Tutte le tabelle implementano RLS per garantire:
- Isolamento dati per azienda
- Accesso basato su ruolo utente
- Sicurezza a livello di riga

## Autenticazione e Autorizzazione

### Sistema di Autenticazione
- Supabase Auth con email/password
- JWT tokens per API calls
- Refresh token automatico

### Controllo Accessi
```typescript
// Esempio di hook per controllo permessi
const useAuth = () => {
  const { user, profile } = useAuthContext();
  
  const isAdmin = profile?.role === 'admin';
  const isSocio = profile?.role === 'socio';
  const isAdminOrSocio = isAdmin || isSocio;
  
  return { user, profile, isAdmin, isSocio, isAdminOrSocio };
};
```

## Moduli del Sistema

### 1. Dashboard
- Panoramica servizi
- Statistiche giornaliere/mensili
- Azioni rapide

### 2. Gestione Servizi (`/servizi`)
- Lista servizi con filtri avanzati
- Creazione nuovo servizio
- Dettaglio servizio con tabs:
  - Informazioni generali
  - Passeggeri
  - Firma digitale
- Dialoghi per:
  - Assegnazione autista
  - Completamento servizio
  - Consuntivazione

### 3. Gestione Aziende (`/aziende`)
- Anagrafica aziende
- Gestione referenti
- Impostazioni per azienda

### 4. Report (`/reports`)
- Generazione report PDF
- Lista report esistenti
- Download e eliminazione report

### 5. Gestione Utenti (`/users`)
- CRUD utenti
- Assegnazione ruoli
- Gestione permessi

### 6. Turni (`/shifts`)
- Calendario turni
- Creazione/modifica turni
- Vista mensile/giornaliera

### 7. Impostazioni (`/impostazioni`)
- Configurazioni globali
- Metodi di pagamento
- Aliquote IVA
- Informazioni azienda

## Generazione Report PDF

### Processo di Generazione

1. **Selezione Parametri**
   ```typescript
   interface ReportParams {
     aziendaId: string;
     referenteId: string;
     month: number;
     year: number;
   }
   ```

2. **Filtro Servizi**
   - Query servizi "consuntivati"
   - Filtro per periodo e azienda/referente
   - Conteggio passeggeri

3. **Generazione PDF**
   - Edge Function `generate-report`
   - jsPDF con tabelle formattate
   - Include firme digitali se presenti

4. **Storage e Catalogazione**
   - Upload in Supabase Storage bucket `report_aziende`
   - Record in tabella `reports`
   - Path strutturato: `{aziendaId}/{year}/{month}/{filename}`

### Componenti Report

```typescript
// Hook per generazione report
const useGenerateReport = () => {
  const generateReport = async (params: GenerateReportParams) => {
    // Validazione parametri
    // Chiamata Edge Function
    // Gestione errori
  };
  
  return { generateReport };
};
```

### Sicurezza Report
- RLS policies su tabella `reports`
- Storage policies per bucket
- Autenticazione richiesta per download

## API e Edge Functions

### Edge Function: `generate-report`

**Endpoint**: `/functions/v1/generate-report`

**Input**:
```json
{
  "aziendaId": "uuid",
  "referenteId": "uuid", 
  "month": 1-12,
  "year": 2024,
  "serviziIds": ["uuid1", "uuid2"],
  "createdBy": "uuid",
  "bucketName": "report_aziende"
}
```

**Output**:
```json
{
  "success": true,
  "reportId": "uuid",
  "fileName": "report_nome_gennaio_2024.pdf",
  "filePath": "azienda-id/2024/1/report_nome_gennaio_2024.pdf"
}
```

**Processo**:
1. Validazione parametri
2. Fetch dati servizi, azienda, referente
3. Generazione PDF con jsPDF
4. Upload a Supabase Storage
5. Creazione record in tabella reports

### Gestione Errori
- Validazione input completa
- Messaggi di errore specifici
- Logging dettagliato per debug
- Toast notifications per l'utente

## Installazione e Setup

### Prerequisiti
- Node.js 18+
- Account Supabase
- Git

### Setup Locale

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd taxitime
   ```

2. **Installazione Dipendenze**
   ```bash
   npm install
   ```

3. **Configurazione Supabase**
   ```bash
   # Crea file .env.local
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Setup Database**
   - Esegui migrazioni SQL in Supabase Dashboard
   - Configura RLS policies
   - Crea storage bucket `report_aziende`

5. **Avvio Sviluppo**
   ```bash
   npm run dev
   ```

### Deploy

1. **Build Produzione**
   ```bash
   npm run build
   ```

2. **Deploy Edge Functions**
   ```bash
   supabase functions deploy generate-report
   ```

## Utilizzo

### Per Amministratori

1. **Setup Iniziale**
   - Configurare impostazioni azienda
   - Creare aziende clienti
   - Aggiungere utenti e assegnare ruoli

2. **Gestione Quotidiana**
   - Creare servizi
   - Assegnare autisti
   - Monitorare completamenti
   - Generare report mensili

### Per Clienti

1. **Accesso Sistema**
   - Login con credenziali fornite
   - Dashboard personalizzata

2. **Visualizzazione Servizi**
   - Servizi del mese corrente
   - Storico servizi
   - Download report mensili

### Per Autisti

1. **Gestione Servizi**
   - Vista servizi assegnati
   - Completamento servizi
   - Raccolta firme digitali

## Monitoraggio e Manutenzione

### Logging
- Console logs estensivi in development
- Error tracking con toast notifications
- Supabase logs per Edge Functions

### Performance
- React Query per caching
- Lazy loading componenti
- Ottimizzazione bundle con Vite

### Sicurezza
- RLS su tutte le tabelle
- Input validation con Zod
- CORS headers corretti
- Sanitizzazione dati utente

## Roadmap Future

### Funzionalità Pianificate
- [ ] App mobile React Native
- [ ] Integrazione sistemi di pagamento
- [ ] API esterne per geocoding
- [ ] Dashboard analytics avanzata
- [ ] Notifiche push
- [ ] Integrazione calendari esterni

### Miglioramenti Tecnici
- [ ] Test suite completa
- [ ] CI/CD pipeline
- [ ] Monitoring APM
- [ ] Backup automatici
- [ ] Disaster recovery

---

## Contatti e Support

Per domande o supporto tecnico, consultare la documentazione del codice o contattare il team di sviluppo.

**Versione Documentazione**: 1.0  
**Ultimo Aggiornamento**: Gennaio 2025
