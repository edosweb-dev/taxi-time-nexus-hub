import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SignatureCanvas } from "@/components/firma/SignatureCanvas";
import { FirmaMultiPasseggeri } from "@/components/firma/FirmaMultiPasseggeri";
import { uploadFirma } from "@/lib/api/servizi/gestioneFirmaDigitale";
import { getFirmePasseggeri } from "@/lib/api/servizi/firmaPasseggero";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface FirmaClienteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  onSuccess: () => void;
}

export function FirmaCliente({ 
  open, 
  onOpenChange, 
  servizioId, 
  onSuccess 
}: FirmaClienteProps) {
  const isMobile = useIsMobile();
  const [numPasseggeri, setNumPasseggeri] = useState<number>(0);
  const [isLoadingPasseggeri, setIsLoadingPasseggeri] = useState(true);

  // Carica il numero di passeggeri quando il dialog si apre
  useEffect(() => {
    if (open) {
      loadPasseggeriCount();
    }
  }, [open, servizioId]);

  const loadPasseggeriCount = async () => {
    setIsLoadingPasseggeri(true);
    try {
      const firme = await getFirmePasseggeri(servizioId);
      setNumPasseggeri(firme.length);
    } catch (error) {
      console.error("Errore caricamento passeggeri:", error);
      toast.error("Errore nel caricamento dei passeggeri");
      setNumPasseggeri(0);
    } finally {
      setIsLoadingPasseggeri(false);
    }
  };

  const handleSaveFirma = async (firmaBase64: string) => {
    try {
      await uploadFirma(servizioId, firmaBase64);
      toast.success("Firma cliente salvata con successo");
      onSuccess();
    } catch (error) {
      toast.error("Errore nel salvataggio della firma");
      console.error(error);
    }
  };

  // Se ci sono più passeggeri, usa il flusso multi-firma
  if (numPasseggeri > 1) {
    return (
      <FirmaMultiPasseggeri
        servizioId={servizioId}
        open={open}
        onOpenChange={onOpenChange}
        onComplete={onSuccess}
      />
    );
  }

  // Flusso singola firma (cliente o singolo passeggero)
  const content = (
    <div className="space-y-4">
      {isLoadingPasseggeri ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      ) : (
        <>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 dark:bg-yellow-950/20 dark:border-yellow-800 dark:text-yellow-200">
            <p className="font-medium mb-1">📱 Passa il dispositivo al cliente</p>
            <p>Il cliente deve firmare sullo schermo per accettare il servizio.</p>
          </div>

          <SignatureCanvas 
            onSave={handleSaveFirma}
            width={isMobile ? 340 : 500}
            height={200}
          />
        </>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[85vh]">
          <SheetHeader>
            <SheetTitle>Richiedi Firma Cliente</SheetTitle>
            <SheetDescription>
              Firma digitale del cliente per accettazione servizio
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {content}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Richiedi Firma Cliente</DialogTitle>
          <DialogDescription>
            Firma digitale del cliente per accettazione servizio
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
