
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
  const [points, setPoints] = useState(0);

  // Monitor when drawing begins
  const handleBegin = () => {
    console.log("Firma: inizio disegno");
    setIsDrawing(true);
  };

  // Monitor when drawing ends and count points
  const handleEnd = () => {
    console.log("Firma: fine disegno");
    if (signatureRef.current) {
      const isEmpty = signatureRef.current.isEmpty();
      
      // Ottieni i dati grezzi per verificarne la qualità
      const data = signatureRef.current.toData();
      const pointCount = data.reduce((total, stroke) => total + stroke.points.length, 0);
      
      console.log(`Firma: isEmpty=${isEmpty}, punti totali=${pointCount}`);
      setPoints(pointCount);
      setHasSignature(!isEmpty && pointCount > 10);
    }
  };

  const clearCanvas = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setHasSignature(false);
      setIsDrawing(false);
      setPoints(0);
      console.log("Firma: canvas pulito");
    }
  };

  const validateSignature = (): boolean => {
    if (!signatureRef.current) {
      console.error("Riferimento al canvas non disponibile");
      toast.error("Errore nel salvare la firma. Riprova.");
      return false;
    }
    
    // Verifica che la firma non sia vuota
    const isEmpty = signatureRef.current.isEmpty();
    console.log("Firma isEmpty prima di salvare:", isEmpty);
    
    if (isEmpty) {
      toast.error("Firma non valida. Inserisci una firma prima di salvare.");
      return false;
    }

    // Verifica che contenga abbastanza punti 
    if (points < 20) {
      toast.error("Firma troppo semplice. Prova a firmare in modo più completo.");
      return false;
    }
    
    return true;
  };

  const saveSignature = () => {
    if (!validateSignature()) return;

    // Ottenere i dati dell'immagine con la massima qualità
    try {
      console.log("Tentativo di generare dataURL dalla firma");
      // Imposta parametri di qualità elevata
      const dataUrl = signatureRef.current!.toDataURL("image/png", 1.0);
      
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
          dotSize={2} // Aumenta la dimensione dei punti
          minWidth={1.5} // Aumenta lo spessore minimo del tratto
          maxWidth={4} // Aumenta lo spessore massimo del tratto
          throttle={16} // Migliora fluidità del tratto (ms)
          velocityFilterWeight={0.7} // Aumenta sensibilità alla velocità
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
