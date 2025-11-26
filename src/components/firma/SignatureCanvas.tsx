
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SignaturePad from "react-signature-canvas";
import { toast } from "@/components/ui/sonner";
import { RefreshCw } from "lucide-react";

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  width?: number;
  height?: number;
  buttonText?: string;
}

interface SignaturePoint {
  x: number;
  y: number;
  time: number;
  color: string;
  pressure?: number;
}

type SignatureStroke = SignaturePoint[];

export function SignatureCanvas({ onSave, width = 500, height = 200, buttonText = "Salva firma" }: SignatureCanvasProps) {
  const signatureRef = useRef<SignaturePad>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [strokeCount, setStrokeCount] = useState(0);

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
      let pointsCount = 0;
      
      // Calcola il numero totale di punti in tutti gli stroke
      if (Array.isArray(data)) {
        data.forEach(stroke => {
          if (Array.isArray(stroke)) {
            pointsCount += stroke.length;
          }
        });
        setStrokeCount(data.length);
      }
      
      console.log(`Firma: isEmpty=${isEmpty}, punti totali=${pointsCount}, strokes=${data.length}`);
      setTotalPoints(pointsCount);
      setHasSignature(!isEmpty && pointsCount > 10 && data.length > 0);
    }
  };

  const clearCanvas = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setHasSignature(false);
      setIsDrawing(false);
      setTotalPoints(0);
      setStrokeCount(0);
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
    if (totalPoints < 20) {
      toast.error("Firma troppo semplice. Prova a firmare in modo più completo.");
      return false;
    }
    
    // Verifica che contenga abbastanza tratti
    if (strokeCount < 1) {
      toast.error("Firma non valida. Deve contenere almeno un tratto completo.");
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
      console.log("Firma dataURL generato (primi 100 char):", dataUrl.substring(0, 100));
      console.log("Lunghezza dataURL:", dataUrl.length);
      
      // Verifica che i dati siano significativi
      if (dataUrl.length < 1000) {
        console.error("Firma troppo semplice o dati insufficienti:", dataUrl.length);
        toast.error("Firma troppo semplice. Prova a firmare in modo più completo.");
        return;
      }

      // Ulteriore verifica base64 per contenuto effettivo
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data || base64Data.trim() === '') {
        console.error("Dati base64 vuoti");
        toast.error("Errore nel generare l'immagine della firma. Riprova.");
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
          disabled={!hasSignature || totalPoints < 20}
        >
          {buttonText}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Utilizzare il mouse o il touchscreen per firmare
      </p>
    </div>
  );
}
