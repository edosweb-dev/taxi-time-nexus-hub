import React, { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { completaServizio } from "@/lib/api/servizi";
import { toast } from "@/components/ui/sonner";
import { Servizio } from "@/lib/types/servizi";

interface CompletaBonificoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizio: Servizio;
  onComplete: () => void;
}

export function CompletaBonificoDialog({
  open,
  onOpenChange,
  servizio,
  onComplete,
}: CompletaBonificoDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleCompleta() {
    try {
      setIsLoading(true);

      // VALIDAZIONE: Check firma cliente se obbligatoria
      if (servizio?.aziende?.firma_digitale_attiva && !servizio?.firma_url) {
        toast.error("Firma cliente mancante", {
          description: "Richiedi prima la firma del cliente prima di completare il servizio."
        });
        return;
      }

      const result = await completaServizio({
        id: servizio.id,
        metodo_pagamento: servizio.metodo_pagamento,
        // NO incasso_ricevuto, NO consegna_contanti_a
      });

      if (result.error) {
        throw result.error;
      }

      toast.success("Servizio completato con successo", {
        description: "L'importo verrà registrato in consuntivazione."
      });
      onOpenChange(false);
      onComplete();
    } catch (error: any) {
      toast.error(`Errore: ${error.message || "Si è verificato un errore"}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Completa Servizio</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <div>
              Metodo di pagamento: <strong>{servizio.metodo_pagamento}</strong>
            </div>
            <div className="text-muted-foreground">
              L'importo verrà registrato in fase di consuntivazione dall'amministratore.
              <br />
              Non è necessario inserire alcun dato.
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Annulla</AlertDialogCancel>
          <AlertDialogAction onClick={handleCompleta} disabled={isLoading}>
            {isLoading ? "Completamento..." : "Completa Servizio"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
