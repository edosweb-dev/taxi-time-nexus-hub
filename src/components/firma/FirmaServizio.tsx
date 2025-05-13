
import React, { useState } from "react";
import { SignatureCanvas } from "./SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Signature } from "lucide-react";
import { useFirmaDigitale } from "@/hooks/useFirmaDigitale";
import { Servizio } from "@/lib/types/servizi";

interface FirmaServizioProps {
  servizioId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function FirmaServizio({ servizioId, isOpen, onClose }: FirmaServizioProps) {
  const { uploadFirma, isLoading } = useFirmaDigitale();

  const handleSalvaFirma = async (signatureData: string) => {
    toast({
      description: "Salvataggio firma in corso..."
    });
    
    try {
      console.log("Elaborazione firma prima dell'upload");
      const result = await uploadFirma(servizioId, signatureData);
      
      if (result.success) {
        onClose();
        console.log("Firma salvata con successo:", result.url);
        toast({
          title: "Successo",
          description: "Firma salvata con successo",
          variant: "default"
        });
      } else {
        console.error("Errore nel salvataggio della firma:", result.error);
        toast({
          title: "Errore",
          description: `Errore nel salvataggio della firma: ${result.error?.message || 'Errore sconosciuto'}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Errore durante il salvataggio della firma:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della firma",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
            onClick={onClose}
            disabled={isLoading}
          >
            Annulla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
