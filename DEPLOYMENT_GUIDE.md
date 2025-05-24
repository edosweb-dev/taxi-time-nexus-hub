
# TaxiTime - Guida al Deployment

## Panoramica

Questa guida descrive come deployare TaxiTime in produzione utilizzando diverse strategie e piattaforme.

## Indice

- [Prerequisiti](#prerequisiti)
- [Setup Supabase Produzione](#setup-supabase-produzione)
- [Build e Deploy Frontend](#build-e-deploy-frontend)
- [Deploy Edge Functions](#deploy-edge-functions)
- [Configurazione Dominio](#configurazione-dominio)
- [Monitoring e Backup](#monitoring-e-backup)
- [Troubleshooting](#troubleshooting)

## Prerequisiti

### Software Richiesto
- Node.js 18+ 
- npm/yarn
- Git
- Supabase CLI

### Account Necessari
- Account Supabase (Pro plan consigliato per produzione)
- Account provider hosting (Vercel/Netlify/CloudFlare Pages)
- Dominio personalizzato (opzionale)

### Installazione Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (con Scoop)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
npm install -g @supabase/cli
```

## Setup Supabase Produzione

### 1. Crea Progetto Produzione

1. Vai su [supabase.com](https://supabase.com)
2. Crea nuovo progetto per produzione
3. Annota:
   - Project URL
   - Anon Key
   - Service Role Key

### 2. Configurazione Database

#### Esegui Migrazioni SQL

Copia e esegui questi script nel SQL Editor di Supabase:

```sql
-- 1. Creazione tabelle (vedi DOCUMENTAZIONE_PROGETTO.md per schema completo)

-- 2. Abilitazione RLS
ALTER TABLE aziende ENABLE ROW LEVEL SECURITY;
ALTER TABLE servizi ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE passeggeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- 3. Policies RLS (vedi sezione RLS in documentazione)

-- 4. Trigger per aggiornamento timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('report_aziende', 'report_aziende', false);

INSERT INTO storage.buckets (id, name, public)
VALUES ('signatures', 'signatures', false);
```

#### Configurazione Storage Policies

```sql
-- Policies per bucket report_aziende
CREATE POLICY "Authenticated users can upload reports" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'report_aziende');

CREATE POLICY "Authenticated users can read reports" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'report_aziende');

CREATE POLICY "Authenticated users can delete reports" ON storage.objects
FOR DELETE TO authenticated USING (bucket_id = 'report_aziende');

-- Policies per bucket signatures
CREATE POLICY "Authenticated users can upload signatures" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'signatures');

CREATE POLICY "Authenticated users can read signatures" ON storage.objects
FOR SELECT TO authenticated USING (bucket_id = 'signatures');
```

### 3. Configurazione Auth

1. **Email Templates**: Personalizza template email
2. **Providers**: Configura provider di autenticazione
3. **URLs**: Imposta redirect URLs per produzione
4. **Security**: Abilita RLS e configura JWT

## Build e Deploy Frontend

### 1. Preparazione Build

#### Crea file di configurazione produzione

```bash
# .env.production
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Build di produzione

```bash
# Installa dipendenze
npm ci

# Build ottimizzato
npm run build

# Test build locale (opzionale)
npm run preview
```

### 2. Deploy su Vercel

#### Setup automatico

```bash
# Installa Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Configurazione vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "build": {
    "env": {
      "VITE_SUPABASE_URL": "@supabase_url", 
      "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
    }
  }
}
```

#### Configurazione Environment Variables

1. Vai su Vercel Dashboard
2. Seleziona progetto > Settings > Environment Variables
3. Aggiungi:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 3. Deploy su Netlify

#### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

#### Deploy automatico

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### 4. Deploy su CloudFlare Pages

1. Connetti repository GitHub
2. Configura build:
   - **Build command**: `npm run build`
   - **Build output**: `dist`
   - **Node.js version**: `18`
3. Aggiungi environment variables
4. Deploy automatico

## Deploy Edge Functions

### 1. Configurazione Locale

```bash
# Login a Supabase
supabase login

# Link al progetto produzione
supabase link --project-ref your-project-ref
```

### 2. Deploy Functions

```bash
# Deploy tutte le functions
supabase functions deploy

# Deploy function specifica
supabase functions deploy generate-report
```

### 3. Configurazione Secrets

```bash
# Se necessario, configura secrets per le functions
supabase secrets set OPENAI_API_KEY=your-key
supabase secrets set STRIPE_SECRET_KEY=your-key
```

### 4. Verifica Deploy

```bash
# Lista functions deployate
supabase functions list

# Log function
supabase functions logs generate-report
```

## Configurazione Dominio

### 1. Dominio Custom Frontend

#### Vercel
1. Project Settings > Domains
2. Aggiungi dominio
3. Configura DNS records

#### Netlify
1. Site Settings > Domain management
2. Add custom domain
3. Configure DNS

### 2. Dominio Custom Supabase (Pro Plan)

1. Project Settings > Custom domains
2. Aggiungi dominio per API
3. Configura certificato SSL
4. Aggiorna frontend URLs

## Monitoring e Backup

### 1. Monitoring Frontend

#### Vercel Analytics
```bash
# Installa package
npm install @vercel/analytics

# Aggiungi al main.tsx
import { Analytics } from '@vercel/analytics/react';

// In App component
<Analytics />
```

#### Error Tracking
```typescript
// Esempio con Sentry
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-dsn",
  environment: "production"
});
```

### 2. Monitoring Supabase

1. **Dashboard Metrics**: CPU, Memory, Storage
2. **Logs**: Database e Edge Functions
3. **Alerts**: Configura alert per usage limits

### 3. Backup Strategy

#### Database Backup
```sql
-- Backup automatici giornalieri (Pro plan)
-- Backup manuali via Dashboard

-- Export dati specifici
COPY (SELECT * FROM servizi WHERE created_at >= '2024-01-01') 
TO 'backup_servizi_2024.csv' CSV HEADER;
```

#### Storage Backup
```bash
# Script backup files
#!/bin/bash
DATE=$(date +%Y%m%d)
mkdir -p backups/$DATE

# Download tutti i file
supabase storage cp --recursive report_aziende/ ./backups/$DATE/reports/
supabase storage cp --recursive signatures/ ./backups/$DATE/signatures/
```

## Checklist Pre-Produzione

### Database
- [ ] Tutte le tabelle create
- [ ] RLS abilitato su tutte le tabelle
- [ ] Policies RLS configurate
- [ ] Storage buckets creati
- [ ] Backup automatici attivi

### Frontend
- [ ] Build di produzione testato
- [ ] Environment variables configurate
- [ ] CDN configurato
- [ ] SSL certificato attivo
- [ ] Dominio custom configurato

### Edge Functions
- [ ] Functions deployate
- [ ] Secrets configurati
- [ ] Logs funzionanti
- [ ] Rate limiting configurato

### Security
- [ ] API keys sicure
- [ ] CORS configurato
- [ ] JWT configurato
- [ ] RLS testato
- [ ] Input validation attiva

### Performance
- [ ] Lazy loading attivo
- [ ] Image optimization
- [ ] Bundle size ottimizzato
- [ ] Caching configurato
- [ ] CDN attivo

## Troubleshooting

### Problemi Comuni

#### 1. Edge Function Non Risponde
```bash
# Check logs
supabase functions logs generate-report --follow

# Verifica secrets
supabase secrets list

# Re-deploy
supabase functions deploy generate-report
```

#### 2. RLS Blocking Queries
```sql
-- Disabilita temporaneamente per debug
ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;

-- Testa query
SELECT * FROM table_name WHERE condition;

-- Riabilita
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

#### 3. CORS Errors
```typescript
// Verifica headers in Edge Function
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Handle OPTIONS
if (req.method === 'OPTIONS') {
  return new Response(null, { headers: corsHeaders });
}
```

#### 4. Build Failures
```bash
# Pulisci cache
rm -rf node_modules package-lock.json
npm install

# Verifica dependencies
npm audit

# Build con debug
npm run build -- --debug
```

### Log Monitoring

#### Frontend Errors
```typescript
// Aggiungi error boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Frontend error:', error, errorInfo);
    // Send to monitoring service
  }
}
```

#### Database Monitoring
```sql
-- Query lenti
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Connessioni attive
SELECT count(*) FROM pg_stat_activity;
```

## Maintenance

### Updates Routine

#### Weekly
- [ ] Check Supabase dashboard metrics
- [ ] Review error logs
- [ ] Update dependencies sicure
- [ ] Test backup restore

#### Monthly  
- [ ] Update major dependencies
- [ ] Review security settings
- [ ] Performance audit
- [ ] Capacity planning

#### Quarterly
- [ ] Security audit completo
- [ ] Disaster recovery test
- [ ] User access review
- [ ] Documentation update

---

## Contact & Support

Per problemi di deploy contattare:
- Team sviluppo per issues codice
- Supabase Support per problemi backend
- Provider hosting per problemi infrastruttura

**Ultimo aggiornamento**: Gennaio 2025
