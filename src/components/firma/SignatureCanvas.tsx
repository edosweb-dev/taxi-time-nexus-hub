
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SignaturePad from "react-signature-canvas";
import { toast } from "@/components/ui/sonner";
import { RefreshCw } from "lucide-react";

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  width?: number;
  height?: number;
}

export function SignatureCanvas({ onSave, width = 500, height = 200 }: SignatureCanvasProps) {
  const signatureRef = useRef<SignaturePad>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Monitora l'inizio del disegno
  const handleBegin = () => {
    console.log("Firma: inizio disegno");
    setIsDrawing(true);
  };

  // Monitora la fine del disegno
  const handleEnd = () => {
    console.log("Firma: fine disegno");
    if (signatureRef.current) {
      const isEmpty = signatureRef.current.isEmpty();
      console.log("Firma isEmpty dopo disegno:", isEmpty);
      setHasSignature(!isEmpty);
    }
  };

  const clearCanvas = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setHasSignature(false);
      setIsDrawing(false);
      console.log("Firma: canvas pulito");
    }
  };

  const saveSignature = () => {
    if (!signatureRef.current) {
      console.error("Riferimento al canvas non disponibile");
      toast.error("Errore nel salvare la firma. Riprova.");
      return;
    }
    
    // Verifica che la firma non sia vuota
    const isEmpty = signatureRef.current.isEmpty();
    console.log("Firma isEmpty prima di salvare:", isEmpty);
    
    if (isEmpty) {
      toast.error("Firma non valida. Inserisci una firma prima di salvare.");
      return;
    }

    // Ottenere i dati dell'immagine con la massima qualità
    try {
      console.log("Tentativo di generare dataURL dalla firma");
      const dataUrl = signatureRef.current.toDataURL("image/png");
      
      // Log dell'inizio del dataUrl per debug
      console.log("Firma dataUrl generato (primi 100 char):", dataUrl.substring(0, 100));
      console.log("Lunghezza dataUrl:", dataUrl.length);
      
      // Verifica che i dati siano significativi
      if (dataUrl.length < 1000) {
        console.error("Firma troppo semplice o dati insufficienti:", dataUrl.length);
        toast.error("Firma troppo semplice. Prova a firmare in modo più completo.");
        return;
      }

      onSave(dataUrl);
    } catch (error) {
      console.error("Errore nella generazione del dataURL:", error);
      toast.error("Errore nel salvare la firma. Riprova.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border border-gray-300 rounded bg-white relative">
        <SignaturePad
          ref={signatureRef}
          canvasProps={{
            width: width,
            height: height,
            className: "signature-canvas",
            style: { touchAction: 'none' } // Migliora supporto touch
          }}
          backgroundColor="#fff"
          onBegin={handleBegin}
          onEnd={handleEnd}
        />
        {!hasSignature && !isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 pointer-events-none">
            Firma qui
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={clearCanvas}
          className="flex gap-2 items-center"
        >
          <RefreshCw className="h-4 w-4" /> Cancella
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
