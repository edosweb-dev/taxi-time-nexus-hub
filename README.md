# TaxiTime Nexus Hub

Gestionale completo per aziende di taxi/NCC: prenotazione servizi, gestione passeggeri, turni dipendenti, calcolo stipendi, flussi di cassa e report.

## Stack

- **Frontend:** Vite + React 18 + TypeScript
- **UI:** Tailwind CSS + shadcn/ui (Radix)
- **State:** TanStack React Query + Context API
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Email:** Resend
- **Deploy:** Vercel

## Setup locale

Requisiti: Node.js >= 20, npm.

```bash
git clone https://github.com/edosweb-dev/taxi-time-nexus-hub.git
cd taxi-time-nexus-hub
cp .env.example .env
# Inserisci i valori reali in .env (vedi sezione Environment Variables)
npm install
npm run dev
```

App disponibile su `http://localhost:8080`.

## Environment Variables

Valori obbligatori in `.env` (NON committare il file):

| Variabile | Descrizione |
|-----------|-------------|
| `VITE_SUPABASE_URL` | URL del progetto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Anon/publishable key Supabase |
| `VITE_SUPABASE_PROJECT_ID` | Project ID Supabase |

I valori si trovano su [supabase.com/dashboard → Project Settings → API](https://supabase.com/dashboard).

Su Vercel vanno configurati tramite `vercel env add` oppure dalla dashboard del progetto.

## Script

| Comando | Descrizione |
|---------|-------------|
| `npm run dev` | Dev server su :8080 |
| `npm run build` | Build produzione in `dist/` |
| `npm run build:dev` | Build in modalità development |
| `npm run preview` | Preview del build |
| `npm run lint` | ESLint |

## Struttura

```
src/
├── components/        # UI components (shadcn + custom)
├── contexts/          # AuthContext, LayoutContext, ShiftContext
├── hooks/             # Custom hooks (React Query)
├── integrations/      # Supabase client e types generati
├── lib/               # Utilities, API, supabase client
├── pages/             # Pagine (routing in App.tsx)
└── styles/            # CSS globali
supabase/
├── functions/         # Edge Functions (Deno)
└── migrations/        # Migrazioni SQL
```

## Ruoli utente

`admin`, `socio`, `dipendente`, `cliente` — isolamento dati via Row Level Security.

## Deploy

Push su `main` → deploy automatico su Vercel (produzione).
Push su altri branch → preview deployment.

## Sicurezza

- `.env` **NON** deve essere committato
- Tutte le credenziali devono passare da env vars
- I `console.log` sono automaticamente rimossi in build di produzione (`esbuild.drop`)
- RLS attivo su tutte le tabelle Supabase
