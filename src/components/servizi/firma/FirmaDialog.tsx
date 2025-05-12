
import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pen, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FirmaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (signatureImage: string) => Promise<void>;
  servizioId: string;
}

export function FirmaDialog({ isOpen, onClose, onConfirm, servizioId }: FirmaDialogProps) {
  const { toast } = useToast();
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  const handleClear = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setIsEmpty(true);
    }
  };

  const handleConfirm = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast({
        title: "Firma mancante",
        description: "Per favore aggiungi la tua firma prima di confermare",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      // Get the signature as PNG data URL
      const signatureImage = signatureRef.current.toDataURL("image/png");
      await onConfirm(signatureImage);
      onClose();
    } catch (error) {
      console.error("Error saving signature:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio della firma",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignatureEnd = () => {
    if (signatureRef.current) {
      setIsEmpty(signatureRef.current.isEmpty());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Firma servizio</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div 
            className="border border-gray-300 rounded-md p-1 bg-white"
            style={{ touchAction: "none" }}
          >
            <SignatureCanvas
              ref={signatureRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "w-full h-full signature-canvas",
              }}
              onEnd={handleSignatureEnd}
            />
          </div>
          <div className="text-sm text-muted-foreground text-center">
            <Pen className="inline-block mr-1 h-4 w-4" />
            Firma nell'area sopra utilizzando il mouse o il touch
          </div>
        </div>
        <DialogFooter className="flex sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleClear}
            disabled={isEmpty || isSaving}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Pulisci
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Annulla
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={isEmpty || isSaving}
            >
              {isSaving ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" /> 
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Conferma firma
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
