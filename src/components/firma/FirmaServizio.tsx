
import React, { useState } from "react";
import { SignatureCanvas } from "./SignatureCanvas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { Pencil } from "lucide-react";
import { updateFirmaServizio } from "@/lib/api/servizi";

interface FirmaServizioProps {
  servizioId: string;
  onFirmaSalvata: () => void;
}

export function FirmaServizio({ servizioId, onFirmaSalvata }: FirmaServizioProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSalvaFirma = async (signatureData: string) => {
    try {
      setIsLoading(true);
      
      // Estrai la parte base64 escludendo il prefisso "data:image/png;base64,"
      const base64Data = signatureData.split(',')[1];
      
      // Crea un timestamp per il nome del file
      const timestamp = new Date().toISOString();
      const fileName = `firma_${servizioId}_${timestamp}.png`;
      
      // Carica l'immagine nel bucket "firme"
      const { data, error: uploadError } = await supabase.storage
        .from('firme')
        .upload(fileName, base64Data, {
          contentType: 'image/png',
          upsert: true
        });
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Ottieni l'URL pubblico della firma
      const { data: { publicUrl } } = supabase.storage
        .from('firme')
        .getPublicUrl(fileName);
      
      console.log("URL pubblico generato:", publicUrl);
      
      // Aggiorna il servizio con l'URL della firma e il timestamp
      const { error: updateError } = await updateFirmaServizio({
        id: servizioId,
        firma_url: publicUrl,
        firma_timestamp: timestamp
      });
        
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Firma salvata con successo");
      setOpen(false);
      onFirmaSalvata();
      
    } catch (error: any) {
      console.error('Errore nel salvataggio della firma:', error);
      toast.error(`Errore nel salvataggio della firma: ${error.message || 'Si è verificato un errore'}`);
    } finally {
      setIsLoading(false);
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
