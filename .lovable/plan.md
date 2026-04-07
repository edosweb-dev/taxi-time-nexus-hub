

## Piano: Ottimizzazione mobile clienti privati

### Modifiche — 2 file

#### 1. `src/components/clienti/EditClientePrivatoDialog.tsx`
Convertire da Dialog a Sheet, stesso pattern già usato in `ViewClientePrivatoDialog`:
- Sostituire `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle` con `Sheet`/`SheetContent`/`SheetHeader`/`SheetTitle`
- Importare `useIsMobile` per condizionare `side="bottom"` (mobile) vs `side="right"` (desktop)
- Mobile: `rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 pb-6`
- Desktop: `w-full sm:max-w-md overflow-y-auto`
- Grid form fields: `grid-cols-1` su mobile, `grid-cols-2` su desktop

#### 2. `src/components/clienti/mobile-first/MobileClientiPrivatiList.tsx`
Rimuovere il pulsante "Dettagli" dalla sezione azioni di ogni card (righe 101-108). Lasciare solo "Modifica" e il bottone elimina.

