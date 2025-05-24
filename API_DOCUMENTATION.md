
# TaxiTime - Documentazione API

## Panoramica API

TaxiTime utilizza Supabase come backend, fornendo:
- REST API automatica per tutte le tabelle
- Realtime subscriptions
- Edge Functions per logica custom
- Storage API per file management

## Autenticazione

### Headers Richiesti
```
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
Content-Type: application/json
```

### Ottenere JWT Token
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

const token = data.session?.access_token;
```

## Endpoints Database

### Servizi

#### GET /rest/v1/servizi
Recupera lista servizi con filtri

**Query Parameters:**
- `azienda_id=eq.uuid` - Filtra per azienda
- `referente_id=eq.uuid` - Filtra per referente  
- `stato=eq.stato` - Filtra per stato
- `data_servizio=gte.2024-01-01` - Filtra per data
- `select=*,passeggeri(*)` - Include relazioni
- `order=data_servizio.desc` - Ordinamento

**Response:**
```json
[
  {
    "id": "uuid",
    "azienda_id": "uuid",
    "referente_id": "uuid",
    "data_servizio": "2024-01-15",
    "orario_servizio": "09:30:00",
    "indirizzo_presa": "Via Roma 123",
    "indirizzo_destinazione": "Via Milano 456",
    "stato": "consuntivato",
    "metodo_pagamento": "Contanti",
    "incasso_previsto": 25.00,
    "passeggeri": [
      {
        "nome_cognome": "Mario Rossi",
        "telefono": "+39 123 456 7890"
      }
    ]
  }
]
```

#### POST /rest/v1/servizi
Crea nuovo servizio

**Body:**
```json
{
  "azienda_id": "uuid",
  "referente_id": "uuid",
  "data_servizio": "2024-01-15",
  "orario_servizio": "09:30:00",
  "indirizzo_presa": "Via Roma 123",
  "indirizzo_destinazione": "Via Milano 456",
  "metodo_pagamento": "Contanti",
  "incasso_previsto": 25.00,
  "created_by": "uuid"
}
```

#### PATCH /rest/v1/servizi?id=eq.{id}
Aggiorna servizio esistente

**Body (esempio assegnazione):**
```json
{
  "assegnato_a": "uuid",
  "stato": "assegnato"
}
```

#### DELETE /rest/v1/servizi?id=eq.{id}
Elimina servizio

### Aziende

#### GET /rest/v1/aziende
Recupera lista aziende

**Response:**
```json
[
  {
    "id": "uuid",
    "nome": "Azienda Spa",
    "partita_iva": "12345678901",
    "email": "info@azienda.com",
    "telefono": "+39 123 456 7890",
    "indirizzo": "Via Business 123",
    "firma_digitale_attiva": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /rest/v1/aziende
Crea nuova azienda

**Body:**
```json
{
  "nome": "Nuova Azienda Srl",
  "partita_iva": "98765432101",
  "email": "info@nuovaazienda.com",
  "telefono": "+39 987 654 3210",
  "indirizzo": "Via Nuova 456"
}
```

### Utenti (Profiles)

#### GET /rest/v1/profiles
Recupera profili utenti

**Query Parameters:**
- `role=eq.cliente` - Filtra per ruolo
- `azienda_id=eq.uuid` - Filtra per azienda

**Response:**
```json
[
  {
    "id": "uuid",
    "first_name": "Mario",
    "last_name": "Rossi", 
    "role": "cliente",
    "azienda_id": "uuid"
  }
]
```

### Reports

#### GET /rest/v1/reports
Recupera lista report

**Response:**
```json
[
  {
    "id": "uuid",
    "azienda_id": "uuid",
    "referente_id": "uuid",
    "month": 1,
    "year": 2024,
    "file_path": "azienda-id/2024/1/report.pdf",
    "file_name": "report_azienda_gennaio_2024.pdf",
    "servizi_ids": ["uuid1", "uuid2"],
    "created_at": "2024-01-31T23:59:59Z",
    "created_by": "uuid"
  }
]
```

## Edge Functions

### generate-report

**Endpoint:** `POST /functions/v1/generate-report`

**Descrizione:** Genera report PDF mensile per azienda/referente

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body:**
```json
{
  "aziendaId": "uuid",
  "referenteId": "uuid",
  "month": 1,
  "year": 2024,
  "serviziIds": ["uuid1", "uuid2", "uuid3"],
  "createdBy": "uuid",
  "bucketName": "report_aziende"
}
```

**Response Success:**
```json
{
  "success": true,
  "reportId": "uuid",
  "fileName": "report_azienda_gennaio_2024.pdf",
  "filePath": "azienda-id/2024/1/report_azienda_gennaio_2024.pdf",
  "bucketName": "report_aziende"
}
```

**Response Error:**
```json
{
  "success": false,
  "error": "Messaggio di errore dettagliato"
}
```

**Codici di Errore:**
- `400` - Parametri mancanti o non validi
- `401` - Non autenticato
- `403` - Non autorizzato
- `500` - Errore interno del server

## Storage API

### Upload File

#### POST /storage/v1/object/{bucket_name}/{file_path}

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Example (Upload firma):**
```typescript
const file = new File([signatureBlob], 'firma.png', {
  type: 'image/png'
});

const { data, error } = await supabase.storage
  .from('signatures')
  .upload(`servizi/${servizioId}/firma.png`, file);
```

### Download File

#### GET /storage/v1/object/{bucket_name}/{file_path}

**Response:** File binario

**Example:**
```typescript
const { data, error } = await supabase.storage
  .from('report_aziende')
  .download('azienda-id/2024/1/report.pdf');
```

### Delete File

#### DELETE /storage/v1/object/{bucket_name}/{file_path}

**Example:**
```typescript
const { error } = await supabase.storage
  .from('report_aziende')
  .remove(['azienda-id/2024/1/report.pdf']);
```

## Realtime Subscriptions

### Subscribe to Table Changes

```typescript
const subscription = supabase
  .channel('servizi_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'servizi'
    },
    (payload) => {
      console.log('Change received:', payload);
    }
  )
  .subscribe();
```

### Subscribe to Row Changes

```typescript
const subscription = supabase
  .channel('my_servizio')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public', 
      table: 'servizi',
      filter: `id=eq.${servizioId}`
    },
    (payload) => {
      console.log('Servizio updated:', payload.new);
    }
  )
  .subscribe();
```

## Row Level Security (RLS)

### Policies Principali

#### Servizi
- **SELECT**: Utenti vedono solo servizi della propria azienda
- **INSERT**: Solo admin/socio possono creare servizi
- **UPDATE**: Admin/socio e autista assegnato possono modificare
- **DELETE**: Solo admin possono eliminare

#### Aziende  
- **SELECT**: Tutti gli utenti autenticati
- **INSERT/UPDATE/DELETE**: Solo admin

#### Profiles
- **SELECT**: Tutti gli utenti autenticati  
- **UPDATE**: Utenti possono modificare solo il proprio profilo

## Rate Limiting

### Limiti Attuali
- **Database queries**: 1000/minuto per utente
- **Edge Functions**: 100/minuto per utente  
- **Storage upload**: 10MB per file
- **Storage download**: 100MB/minuto per utente

## Error Handling

### Codici di Errore Standard

#### 400 - Bad Request
```json
{
  "code": "PGRST116",
  "details": "The result contains 0 rows",
  "hint": null,
  "message": "JSON object requested, multiple (or no) rows returned"
}
```

#### 401 - Unauthorized
```json
{
  "message": "Invalid JWT"
}
```

#### 403 - Forbidden
```json
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "new row violates row-level security policy"
}
```

#### 409 - Conflict
```json
{
  "code": "23505",
  "details": "Key (email)=(test@example.com) already exists.",
  "hint": null,
  "message": "duplicate key value violates unique constraint"
}
```

## Best Practices

### Query Optimization

1. **Usa Select Specifico**
   ```typescript
   // ❌ Evita
   .select('*')
   
   // ✅ Preferisci  
   .select('id, nome, email')
   ```

2. **Limita Risultati**
   ```typescript
   .select('*')
   .limit(50)
   .range(0, 49)
   ```

3. **Usa Indici per Filtri**
   ```typescript
   // Assicurati che i campi nel where abbiano indici
   .eq('azienda_id', id)
   .gte('data_servizio', startDate)
   ```

### Gestione Errori

```typescript
const { data, error } = await supabase
  .from('servizi')
  .select('*');

if (error) {
  console.error('Database error:', error);
  
  switch (error.code) {
    case 'PGRST116':
      // Nessun risultato trovato
      break;
    case '42501':
      // Errore RLS
      break;
    default:
      // Errore generico
  }
}
```

### Caching

```typescript
// Usa React Query per caching automatico
const { data: servizi, isLoading } = useQuery({
  queryKey: ['servizi', aziendaId],
  queryFn: () => fetchServizi(aziendaId),
  staleTime: 5 * 60 * 1000, // 5 minuti
});
```

## Testing API

### Setup Test Environment

```bash
# Install dependencies
npm install --save-dev @supabase/supabase-js
```

### Example Test

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
);

describe('Servizi API', () => {
  test('should create new servizio', async () => {
    const { data, error } = await supabase
      .from('servizi')
      .insert({
        azienda_id: 'test-uuid',
        referente_id: 'test-uuid',
        data_servizio: '2024-01-15',
        orario_servizio: '09:30:00',
        indirizzo_presa: 'Test Address',
        indirizzo_destinazione: 'Test Destination',
        metodo_pagamento: 'Contanti',
        created_by: 'test-uuid'
      })
      .select()
      .single();
      
    expect(error).toBeNull();
    expect(data.id).toBeDefined();
  });
});
```

---

## Changelog API

### v1.0.0 (Gennaio 2025)
- Prima release API completa
- Edge Function generate-report
- RLS policies complete
- Storage buckets per report

---

Per domande sull'API o richieste di nuove funzionalità, consultare la documentazione del progetto principale.
