import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { completaServizio } from "@/lib/api/servizi";
import { checkAllPasseggeriSigned } from "@/lib/api/servizi/firmaPasseggero";
import { toast } from "@/components/ui/sonner";
import { Servizio } from "@/lib/types/servizi";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  async function handleCompleta() {
    try {
      setIsLoading(true);

      // VALIDAZIONE: Check firma cliente/passeggeri se obbligatoria
      if (servizio?.aziende?.firma_digitale_attiva) {
        const firmaCheck = await checkAllPasseggeriSigned(servizio.id);
        
        // Se ci sono passeggeri, controlla che tutti abbiano firmato
        if (firmaCheck.totalPasseggeri > 0 && !firmaCheck.allSigned) {
          toast.error("Firme passeggeri mancanti", {
            description: `${firmaCheck.firmati}/${firmaCheck.totalPasseggeri} passeggeri hanno firmato`
          });
          return;
        }
        
        // Fallback per servizi senza passeggeri (usa firma singola)
        if (firmaCheck.totalPasseggeri === 0 && !servizio?.firma_url) {
          toast.error("Firma cliente mancante", {
            description: "Richiedi prima la firma del cliente prima di completare il servizio."
          });
          return;
        }
      }

      const result = await completaServizio({
        id: servizio.id,
        metodo_pagamento: servizio.metodo_pagamento,
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "rounded-t-2xl max-h-[85vh] overflow-y-auto px-6 pb-8"
            : "sm:max-w-[500px] overflow-y-auto"
        }
      >
        {/* Handle bar mobile */}
        {isMobile && (
          <div className="flex justify-center pt-2 pb-4">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        <SheetHeader>
          <SheetTitle>Completa Servizio</SheetTitle>
          <SheetDescription className="space-y-2">
            <div>
              Metodo di pagamento: <strong>{servizio.metodo_pagamento}</strong>
            </div>
            <div className="text-muted-foreground">
              L'importo verrà registrato in fase di consuntivazione dall'amministratore.
              <br />
              Non è necessario inserire alcun dato.
            </div>
          </SheetDescription>
        </SheetHeader>

        <SheetFooter className="mt-6 flex-col-reverse sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading} className="w-full sm:w-auto">
            Annulla
          </Button>
          <Button onClick={handleCompleta} disabled={isLoading} className="w-full sm:w-auto">
            {isLoading ? "Completamento..." : "Completa Servizio"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
