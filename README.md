# Taxi Time — Gestionale

Applicazione gestionale per servizi NCC/taxi: servizi, aziende clienti, passeggeri,
turni, stipendi soci, spese e reportistica.

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui
- **Dati e auth**: Supabase (PostgreSQL, RLS, Edge Functions)
- **Deploy**: Vercel (build da `main`)

## Sviluppo locale

Prerequisiti: Node.js 18+ e npm.

```sh
npm install
npm run dev      # server di sviluppo su http://localhost:8080
```

Altri script:

```sh
npm run build    # build di produzione in dist/
npm run preview  # anteprima locale del build
npm run lint     # ESLint
```

## Variabili d'ambiente

Il client Supabase usa le seguenti variabili (prefisso `VITE_`, quindi incluse
nel bundle: sono la URL del progetto e la chiave anon, pubbliche per design):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_SUPABASE_PROJECT_ID=
```

In locale vanno in un file `.env` (non versionato). Su Vercel vanno impostate
nelle Environment Variables del progetto.

## Supabase

- **Migrazioni**: `supabase/migrations/`
- **Edge Functions**: `supabase/functions/` — si deployano con
  `supabase functions deploy <nome> --project-ref <ref>`

## Deploy

Il push su `main` innesca il build e la pubblicazione su Vercel.
La configurazione del build (rewrite SPA incluso) sta in `vercel.json`.
