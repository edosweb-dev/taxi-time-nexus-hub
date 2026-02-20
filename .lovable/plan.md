
# Fix: Transizione stato da "richiesta_cliente" a "da_assegnare"

## Causa Root

Il file `ServizioCreaPage.tsx` (linea 977) include `'richiesta_cliente'` nell'array `statiBloccati`. Quando l'admin modifica un servizio in edit mode, lo stato viene forzato a rimanere `'richiesta_cliente'` e scritto direttamente su Supabase (linea 1076), bypassando completamente `useServizi.ts` e `updateServizio.ts`.

## Il flusso attuale (DIFETTOSO)

```text
Admin apre servizio "richiesta_cliente"
  -> ModificaServizioPage
    -> ServizioCreaPage (mode="edit")
      -> Admin aggiunge metodo_pagamento, salva
        -> onSubmit() [linea 910]
          -> statiBloccati include 'richiesta_cliente' [linea 977]
          -> statoServizio = 'richiesta_cliente' (BLOCCATO!)
          -> supabase.update({stato: 'richiesta_cliente'}) [linea 1076]
          -> Stato NON cambia mai
```

## Modifica necessaria

**File**: `src/pages/servizi/ServizioCreaPage.tsx`
**Linea 977**: Rimuovere `'richiesta_cliente'` dall'array `statiBloccati`

Da:
```text
const statiBloccati = ['completato', 'consuntivato', 'annullato', 'non_accettato', 'richiesta_cliente'];
```

A:
```text
const statiBloccati = ['completato', 'consuntivato', 'annullato', 'non_accettato'];
```

Con questa modifica, quando admin modifica un servizio in `richiesta_cliente`, il codice cade nel ramo `else` (linee 983-998) che ricalcola lo stato in base alla presenza dell'autista:
- Se autista assegnato: stato = `'assegnato'`
- Se nessun autista: stato = `'da_assegnare'`

## Flusso post-fix

```text
Admin apre servizio "richiesta_cliente"
  -> onSubmit()
    -> statiBloccati NON include 'richiesta_cliente'
    -> Ramo else (linea 983): ricalcola stato
    -> Se ha autista -> 'assegnato'
    -> Se no autista -> 'da_assegnare'
    -> supabase.update({stato: 'da_assegnare'})
    -> Servizio esce da "Richieste Clienti" e va in "Da Assegnare"
```

## Scope

- **1 file, 1 riga** da modificare
- `src/pages/servizi/ServizioCreaPage.tsx` linea 977

Nessun altro file da toccare. Le fix precedenti su `useServizi.ts` e `updateServizio.ts` non fanno male (sono corrette per altri flussi) ma non sono coinvolte in questo percorso specifico.
