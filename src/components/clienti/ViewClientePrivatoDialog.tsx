import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClientePrivato } from "@/lib/types/servizi";
import { Mail, Phone, MapPin, StickyNote } from "lucide-react";

interface ViewClientePrivatoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cliente: ClientePrivato;
  onEdit: () => void;
}

export function ViewClientePrivatoDialog({ open, onOpenChange, cliente, onEdit }: ViewClientePrivatoDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{cliente.cognome} {cliente.nome}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {(cliente.email || cliente.telefono) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Contatti</h4>
              {cliente.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${cliente.email}`} className="text-primary hover:underline">{cliente.email}</a>
                </div>
              )}
              {cliente.telefono && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${cliente.telefono}`} className="text-primary hover:underline">{cliente.telefono}</a>
                </div>
              )}
            </div>
          )}

          {(cliente.indirizzo || cliente.citta) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Indirizzo</h4>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{[cliente.indirizzo, cliente.citta].filter(Boolean).join(', ')}</span>
              </div>
            </div>
          )}

          {cliente.note && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Note</h4>
              <div className="flex items-start gap-2 text-sm">
                <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5" />
                <p className="whitespace-pre-wrap">{cliente.note}</p>
              </div>
            </div>
          )}

          {!cliente.email && !cliente.telefono && !cliente.indirizzo && !cliente.citta && !cliente.note && (
            <p className="text-sm text-muted-foreground italic">Nessun dettaglio aggiuntivo disponibile.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Chiudi</Button>
          <Button onClick={onEdit}>Modifica</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
