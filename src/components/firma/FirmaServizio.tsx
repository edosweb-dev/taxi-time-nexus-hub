
import React, { useState } from "react";
import { SignatureCanvas } from "./SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/sonner";
import { Pencil } from "lucide-react";
import { useFirmaDigitale } from "@/hooks/useFirmaDigitale";

interface FirmaServizioProps {
  servizioId: string;
  onFirmaSalvata: () => void;
}

export function FirmaServizio({ servizioId, onFirmaSalvata }: FirmaServizioProps) {
  const [open, setOpen] = useState(false);
  const { uploadFirma, isLoading } = useFirmaDigitale();

  const handleSalvaFirma = async (signatureData: string) => {
    toast.info("Salvataggio firma in corso...");
    
    try {
      console.log("Elaborazione firma prima dell'upload");
      const result = await uploadFirma(servizioId, signatureData);
      
      if (result.success) {
        setOpen(false);
        console.log("Firma salvata con successo:", result.url);
        onFirmaSalvata();
      } else {
        console.error("Errore nel salvataggio della firma:", result.error);
        toast.error(`Errore nel salvataggio della firma: ${result.error?.message || 'Errore sconosciuto'}`);
      }
    } catch (error) {
      console.error("Errore durante il salvataggio della firma:", error);
      toast.error("Si è verificato un errore durante il salvataggio della firma");
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        variant="outline"
        className="flex gap-2 items-center"
      >
        <Pencil className="h-4 w-4" /> Firma digitale
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Firma digitale</DialogTitle>
            <DialogDescription>
              Utilizza il mouse o il touchscreen per apporre la tua firma digitale.
              Assicurati di firmare in modo chiaro e completo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <SignatureCanvas
              onSave={handleSalvaFirma}
              width={550}
              height={200}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
