

## Fix: Sidebar completa per ruolo cliente

### Stato attuale
Le modifiche precedenti hanno aggiunto Dashboard, Servizi e Report per il cliente. Mancano ancora **Nuovo Servizio** e **Passeggeri**. Le rotte esistono gia in `App.tsx`.

C'e anche un problema nel **grouping** della sidebar desktop: il codice raggruppa le voci per titolo (`['Dashboard', 'Servizi', 'Turni']`), quindi voci con titoli nuovi come "Nuovo Servizio" e "Passeggeri" non apparirebbero in nessun gruppo.

### Modifiche previste

#### 1. `src/components/layouts/sidebar/SidebarNavLinks.tsx`
- Aggiungere 2 nuove voci nell'array `navItems` per il ruolo `cliente`:
  - **Nuovo Servizio** (`/dashboard-cliente/nuovo-servizio`, icona `FileText`)
  - **Passeggeri** (`/dashboard-cliente/passeggeri`, icona `Users`)
- Aggiornare la logica di grouping (riga 146) per includere i nuovi titoli nel gruppo `main`:
  - Da: `['Dashboard', 'Servizi', 'Turni']`
  - A: `['Dashboard', 'Servizi', 'Turni', 'Nuovo Servizio', 'Passeggeri', 'Report']`

#### 2. `src/components/mobile/MobileSidebar.tsx`
- Aggiungere 2 nuove voci nella sezione "Principale" (riga 43-50):
  - **Nuovo Servizio** (`/dashboard-cliente/nuovo-servizio`, roles: `['cliente']`)
  - **Passeggeri** (`/dashboard-cliente/passeggeri`, roles: `['cliente']`)

#### 3. `src/components/mobile/BottomNavigation.tsx`
- Aggiungere 2 nuove voci nell'array `allNavItems`:
  - **Nuovo** (`/dashboard-cliente/nuovo-servizio`, roles: `['cliente']`)
  - **Passeggeri** (`/dashboard-cliente/passeggeri`, roles: `['cliente']`)

### Risultato per cliente
- **Desktop sidebar**: 5 voci (Dashboard, Servizi, Nuovo Servizio, Passeggeri, Report)
- **Mobile sidebar**: 5 voci (stesse)
- **Bottom nav**: 5 icone (Dashboard, Servizi, Nuovo, Passeggeri, Report)

### Nessuna modifica a
- Voci menu esistenti per admin/socio/dipendente
- Routing, AuthGuard, logica business, database

