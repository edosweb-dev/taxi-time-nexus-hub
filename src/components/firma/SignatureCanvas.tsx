
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import SignaturePad from "react-signature-canvas";
import { toast } from "@/components/ui/sonner";

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  width?: number;
  height?: number;
}

export function SignatureCanvas({ onSave, width = 500, height = 200 }: SignatureCanvasProps) {
  const signatureRef = useRef<SignaturePad>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const handleBegin = () => {
    console.log("Firma: inizio disegno");
    setHasSignature(true);
  };

  const clearCanvas = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setHasSignature(false);
      console.log("Firma: canvas pulito");
    }
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      // Check if the signature pad is empty
      const isEmpty = signatureRef.current.isEmpty();
      console.log("Firma isEmpty check:", isEmpty);

      if (isEmpty) {
        toast.error("Firma non valida. Inserisci una firma prima di salvare.");
        return;
      }

      // Get signature as data URL with higher quality
      const dataUrl = signatureRef.current.toDataURL("image/png");
      console.log("Firma dataUrl generato:", dataUrl.substring(0, 50) + "...");
      
      // Check if the dataUrl contains actual image data
      if (dataUrl.length < 1000) {
        toast.error("Firma troppo semplice o vuota. Prova a firmare nuovamente.");
        return;
      }

      onSave(dataUrl);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border border-gray-300 rounded bg-white">
        <SignaturePad
          ref={signatureRef}
          canvasProps={{
            width: width,
            height: height,
            className: "signature-canvas",
          }}
          backgroundColor="#fff"
          onBegin={handleBegin}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={clearCanvas}>
          Cancella
        </Button>
        <Button 
          type="button" 
          onClick={saveSignature}
          className="flex gap-2 items-center"
          disabled={!hasSignature}
        >
          Salva firma
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Utilizzare il mouse o il touchscreen per firmare
      </p>
    </div>
  );
}
