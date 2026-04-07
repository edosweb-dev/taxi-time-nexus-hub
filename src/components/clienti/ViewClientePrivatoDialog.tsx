import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ClientePrivato } from "@/lib/types/servizi";
import { Mail, Phone, MapPin, StickyNote } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ViewClientePrivatoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClientePrivato;
  onEdit: () => void;
}

export function ViewClientePrivatoDialog({ open, onOpenChange, cliente, onEdit }: ViewClientePrivatoDialogProps) {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 pb-6"
            : "w-full sm:max-w-md overflow-y-auto"
        }
      >
        <SheetHeader className={isMobile ? "pb-2" : ""}>
          <SheetTitle className="text-left">{cliente.cognome} {cliente.nome}</SheetTitle>
        </SheetHeader>

        <div className={isMobile ? "space-y-4 py-3" : "space-y-6 py-6"}>
          {(cliente.email || cliente.telefono) && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Contatti</h4>
              {cliente.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`mailto:${cliente.email}`} className="text-primary hover:underline truncate">{cliente.email}</a>
                </div>
              )}
              {cliente.telefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <a href={`tel:${cliente.telefono}`} className="text-primary hover:underline">{cliente.telefono}</a>
                </div>
              )}
            </div>
          )}

          {(cliente.indirizzo || cliente.citta) && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Indirizzo</h4>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <span>{[cliente.indirizzo, cliente.citta].filter(Boolean).join(', ')}</span>
              </div>
            </div>
          )}

          {cliente.note && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Note</h4>
              <div className="flex items-start gap-2 text-sm">
                <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <p className="whitespace-pre-wrap">{cliente.note}</p>
              </div>
            </div>
          )}

          {!cliente.email && !cliente.telefono && !cliente.indirizzo && !cliente.citta && !cliente.note && (
            <p className="text-sm text-muted-foreground italic">Nessun dettaglio aggiuntivo disponibile.</p>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 sm:flex-row pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">Chiudi</Button>
          <Button onClick={onEdit} className="flex-1">Modifica</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
