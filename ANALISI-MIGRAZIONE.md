# Analisi Migrazione TaxiTime - Da Lovable a Vercel

**Data analisi:** 2 Aprile 2026
**Progetto:** taxi-time-nexus-hub
**Obiettivo:** Staccare da Lovable, deployare su Vercel, stabilizzare e ottimizzare

---

## Stack Tecnologico Attuale

| Componente | Tecnologia | Versione |
|------------|-----------|----------|
| Build tool | Vite + SWC | 5.4.1 |
| Framework | React + TypeScript | 18.3.1 / 5.5.3 |
| UI Library | shadcn/ui (Radix UI) | 24 pacchetti |
| Styling | Tailwind CSS | 3.4.11 |
| Routing | React Router | 6.26.2 |
| State | Context API + TanStack React Query | 5.56.2 |
| Forms | React Hook Form + Zod | 7.53.0 / 3.23.8 |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) | 2.49.4 |
| Charts | Recharts | 2.12.7 |
| PDF | jspdf + jspdf-autotable | 3.0.1 / 5.0.2 |

**Dimensioni:** ~960 file, 50k+ righe, 60+ pagine, 50+ hook custom

---

## FASE 1 - Migrazione e Pulizia

### 1.1 Rimuovere dipendenze Lovable

**`package.json`** - Rimuovere:
```
"lovable-tagger": "^1.1.7"  (devDependencies, riga 86)
```

**`vite.config.ts`** - Rimuovere:
```typescript
// Riga 4: import { componentTagger } from "lovable-tagger";
// Righe 14-15: mode === 'development' && componentTagger(),
```

**`index.html`** - Rimuovere/sostituire:
```html
<!-- Riga 9: meta author Lovable -->
<meta name="author" content="Lovable" />

<!-- Riga 13: OG image Lovable -->
<meta property="og:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

<!-- Riga 15-16: Twitter card Lovable -->
<meta name="twitter:site" content="@lovable_dev" />
<meta name="twitter:image" content="https://lovable.dev/opengraph-image-p98pqg.png" />

<!-- Riga 20-21: CRITICO - script GPT Engineer dal CDN -->
<script src="https://cdn.gpteng.co/gptengineer.js" type="module"></script>
```

**Directory `.lovable/`** - Eliminare intera directory.

**`README.md`** - Riscrivere completamente (attualmente contiene link e istruzioni Lovable).

### 1.2 Riferimenti Lovable nel codice

**`src/components/layouts/AuthLayout.tsx` (riga 18)**
```typescript
src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png"
```
- Verificare se l'immagine esiste in `/public/lovable-uploads/`
- Se si, spostarla in `/public/images/` e aggiornare il path
- Se no, scaricarla e salvarla localmente

**`supabase/functions/send-reset-password-email/index.ts` (riga 38)**
```typescript
const siteUrl = email_data.site_url || email_data.redirect_to || "https://taxi-time.lovable.app";
```
- Sostituire URL fallback con il nuovo dominio Vercel

### 1.3 Fix credenziali hardcoded

**`src/lib/supabase.ts`** - Attualmente:
```typescript
const supabaseUrl = "https://iczxhmzwjopfdvbxwzjs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIs...";
```

Sostituire con:
```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

Le variabili `.env` esistono gia:
```
VITE_SUPABASE_PROJECT_ID="iczxhmzwjopfdvbxwzjs"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJ..."
VITE_SUPABASE_URL="https://iczxhmzwjopfdvbxwzjs.supabase.co"
```

Aggiungere `.env` a `.gitignore` se non presente. Creare `.env.example` senza valori reali.

### 1.4 Configurazione Vercel

- Creare progetto Vercel collegato al repo GitHub
- Framework preset: Vite
- Build command: `vite build`
- Output directory: `dist`
- Configurare le variabili d'ambiente su Vercel (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY)
- Aggiornare Supabase Auth redirect URLs con il nuovo dominio Vercel

---

## FASE 1B - Sicurezza e Pulizia Codice

### 1.5 Rimuovere console.log da produzione

**Problema:** 1.090 statement console (635 log + 455 error/warn) in 105 file.

**File piu critici:**
| File | Console statements | Rischio |
|------|-------------------|---------|
| `src/contexts/AuthContext.tsx` | ~60 | Logga user ID, email, ruoli |
| `src/utils/servizioValidation.ts` | ~46 | Logga dati validazione |
| `src/lib/calcoloStipendi.ts` | ~27 | Logga calcoli stipendi |
| `src/hooks/servizio/useServizioSubmit.ts` | ~20 | Logga dati servizio |
| `src/components/AuthGuard.tsx` | ~12 | Logga ruoli e path |

**Soluzione:** Configurare `vite-plugin-strip` o `esbuild.drop` in vite.config.ts per rimuovere automaticamente i console.log in produzione:
```typescript
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],
}
```

### 1.6 Dipendenza inutilizzata

**`@react-pdf/renderer` (^4.3.0)** - Zero import nel codice. Rimuovere da package.json.

Nota: `jspdf` e `jspdf-autotable` sono usati in 2 file, mantenerli.

---

## FASE 2 - Ottimizzazione Performance

### 2.1 Reintrodurre Code Splitting (lazy loading)

**Problema:** Tutte le 60 pagine importate direttamente in `App.tsx` (righe 1-70).
Commento nel codice: "removed lazy loading to fix cache issues".

**Soluzione:** Reintrodurre `React.lazy()` + `Suspense` con strategia di cache corretta:
```typescript
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ServiziPage = React.lazy(() => import('./pages/servizi/ServiziPage'));
// ... per tutte le 60 pagine
```

Il bug di cache si risolve con cache busting nel build (hash nei filename, gia default Vite) + header `Cache-Control` corretti su Vercel.

### 2.2 Ottimizzare configurazione Vite

**Attuale `vite.config.ts`:** Nessuna ottimizzazione build.

**Aggiungere:**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', ...],
        'vendor-query': ['@tanstack/react-query'],
        'vendor-supabase': ['@supabase/supabase-js'],
        'vendor-charts': ['recharts'],
        'vendor-pdf': ['jspdf', 'jspdf-autotable'],
        'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
      }
    }
  },
  chunkSizeWarningLimit: 500,
  sourcemap: false,
},
```

### 2.3 Ottimizzare React Query

**Attuale configurazione (App.tsx righe 79-89):**
```typescript
staleTime: 0,                  // Sempre stale = refetch costante
refetchOnWindowFocus: true,    // Refetch ad ogni cambio tab
refetchOnMount: true,          // Refetch ad ogni mount
```

**Configurazione ottimizzata:**
```typescript
staleTime: 5 * 60 * 1000,      // 5 minuti - dati considerati freschi
gcTime: 10 * 60 * 1000,        // 10 minuti garbage collection
retry: 1,
refetchOnWindowFocus: false,   // No refetch su cambio tab
refetchOnMount: 'always',      // Refetch solo se stale
```

Per le query che necessitano dati real-time (es. lista servizi attivi), impostare `staleTime` piu basso a livello di singola query.

### 2.4 Pagine duplicate da consolidare

Esistono 3 pagine per editare un servizio:
- `EditServizioPage.tsx`
- `ServizioEditPageV2.tsx`
- `ModificaServizioPage.tsx`

Verificare quale sia quella attiva e rimuovere le altre.

---

## FASE 3 - Qualita del Codice (post-migrazione)

### 3.1 Setup Testing

**Stato attuale:** Zero file di test, zero framework di test.

**Azione:**
- Installare `vitest` + `@testing-library/react` + `jsdom`
- Iniziare dai file piu critici:
  - `src/contexts/AuthContext.tsx` (logica auth + impersonazione)
  - `src/lib/calcoloStipendi.ts` (calcoli finanziari)
  - `src/utils/servizioValidation.ts` (validazione servizi)
  - `src/hooks/useServizioStateMachine.ts` (state machine)

### 3.2 Rafforzare TypeScript

**Attuale tsconfig.json:**
```json
"noImplicitAny": false,
"strictNullChecks": false,
"noUnusedLocals": false,
"noUnusedParameters": false
```

**Target:**
```json
"noImplicitAny": true,
"strictNullChecks": true,
"noUnusedLocals": true,
"noUnusedParameters": true
```

**Impatto:** 291 istanze di `any` in 131 file da tipizzare. Procedere incrementalmente.

### 3.3 Componenti da refactorare (dopo aver test)

| File | Righe | Problema |
|------|-------|----------|
| `src/pages/servizi/ServizioCreaPage.tsx` | 2.544 | Logica form + validazione + UI tutto insieme |
| `src/pages/servizi/ServiziPage.tsx` | 1.127 | Lista + filtri + azioni mescolate |
| `src/pages/cliente/NuovoServizioPage.tsx` | 889 | Form complesso monolitico |
| `src/pages/cliente/PasseggeriCliente.tsx` | 713 | Gestione passeggeri sovraccarica |
| `src/pages/stipendi/StipendiDettaglioPage.tsx` | 705 | 10 query Supabase dirette nella pagina |

### 3.4 Hook sovraccarichi da spezzare

| Hook | Righe | Problema |
|------|-------|----------|
| `src/hooks/useSpeseAziendali.ts` | 395 | 13 query Supabase, logica di trasformazione |
| `src/hooks/useServizi.ts` | 370 | 6 mutation diverse, invalidation duplicata |
| `src/hooks/useServizioStateMachine.ts` | 325 | State machine + API call mescolati |

### 3.5 Centralizzare query Supabase

**Problema:** 173 chiamate `.from()` in 79 file con pattern duplicati.

**Soluzione:** Creare layer `src/lib/queries/` con funzioni riutilizzabili:
```typescript
// src/lib/queries/servizi.ts
export const serviziQueries = {
  list: (filters) => supabase.from('servizi').select('*').match(filters),
  detail: (id) => supabase.from('servizi').select('*, passeggeri(*)').eq('id', id),
  // ...
}
```

### 3.6 AuthContext da semplificare

**Problema (406 righe):**
- `user: any` senza tipo
- Logica impersonazione (100+ righe) mescolata con auth normale
- Race condition nel listener auth con dipendenza `isImpersonating`
- `sessionStorage.clear()` cancella tutto, non solo dati auth

**Soluzione:** Estrarre impersonazione in hook/context separato.

### 3.7 Error handling inconsistente

**Problema:** Errori API loggati in console ma mai mostrati all'utente.

**Soluzione:** Wrapper per mutation React Query con toast automatico:
```typescript
const useApiMutation = (mutationFn, options) => {
  return useMutation({
    mutationFn,
    onError: (error) => {
      toast.error(error.message || 'Errore durante l\'operazione');
    },
    ...options,
  });
};
```

---

## TODO Irrisolti nel Codice

| File | Riga | TODO |
|------|------|------|
| `src/components/servizi/ServizioFormFields.tsx` | 180 | `{/* Analysis / TODO */}` |
| `src/hooks/useIncassiContanti.ts` | 86 | Query separata per nome |
| `src/lib/api/stipendi/calcolaServiziUtente.ts` | 29 | Algoritmo calcolo KM |
| `src/pages/ReportPage.tsx` | 110 | Export PDF |
| `src/pages/ReportPage.tsx` | 118 | Share functionality |
| `src/pages/shifts/ShiftReportsPage.tsx` | 122 | API servizi per data |

---

## Checklist Esecuzione

### Fase 1 - Migrazione (priorita immediata)
- [ ] Rimuovere `lovable-tagger` da package.json
- [ ] Pulire `vite.config.ts` (rimuovere import e plugin lovable-tagger)
- [ ] Pulire `index.html` (rimuovere meta Lovable, script GPT Engineer)
- [ ] Eliminare directory `.lovable/`
- [ ] Aggiornare `README.md`
- [ ] Fix `src/lib/supabase.ts` - usare env vars
- [ ] Creare `.env.example`
- [ ] Verificare `.gitignore` per `.env`
- [ ] Spostare immagine da `/lovable-uploads/` a `/public/images/`
- [ ] Aggiornare URL in `send-reset-password-email/index.ts`
- [ ] Configurare progetto Vercel
- [ ] Configurare env vars su Vercel
- [ ] Aggiornare Supabase Auth redirect URLs
- [ ] Deploy e verifica su Vercel

### Fase 1B - Sicurezza e pulizia
- [ ] Configurare `esbuild.drop` per console in produzione
- [ ] Rimuovere `@react-pdf/renderer` da package.json
- [ ] Verificare e consolidare pagine edit servizio duplicate

### Fase 2 - Performance
- [ ] Reintrodurre lazy loading in `App.tsx`
- [ ] Configurare chunk splitting in vite.config.ts
- [ ] Ottimizzare configurazione React Query
- [ ] Verificare build size e analizzare bundle

### Fase 3 - Qualita codice
- [ ] Setup vitest + testing-library
- [ ] Scrivere test per logica critica (auth, calcoli, validazione)
- [ ] Abilitare TypeScript strict incrementalmente
- [ ] Refactoring componenti grandi (con copertura test)
- [ ] Centralizzare query Supabase
- [ ] Estrarre logica impersonazione da AuthContext
- [ ] Standardizzare error handling con toast
