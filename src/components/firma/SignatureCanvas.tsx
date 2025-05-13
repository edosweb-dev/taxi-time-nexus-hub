
import React, { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, Pencil } from "lucide-react";

interface SignatureCanvasProps {
  onSave: (signatureData: string) => void;
  width?: number;
  height?: number;
}

export function SignatureCanvas({ onSave, width = 500, height = 200 }: SignatureCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Imposta lo stile del tratto
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";

    // Pulisci il canvas
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.beginPath();
    
    // Gestisci sia mouse che touch events
    if (e.nativeEvent instanceof MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.nativeEvent.clientX - rect.left;
      const y = e.nativeEvent.clientY - rect.top;
      ctx.moveTo(x, y);
    } else if (e.nativeEvent instanceof TouchEvent) {
      e.preventDefault(); // Previeni lo scroll su dispositivi touch
      const rect = canvas.getBoundingClientRect();
      const touch = e.nativeEvent.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Gestisci sia mouse che touch events
    if (e.nativeEvent instanceof MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const x = e.nativeEvent.clientX - rect.left;
      const y = e.nativeEvent.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (e.nativeEvent instanceof TouchEvent) {
      e.preventDefault(); // Previeni lo scroll su dispositivi touch
      const rect = canvas.getBoundingClientRect();
      const touch = e.nativeEvent.touches[0];
      const x = touch.clientX - rect.left;
      const y = touch.clientY - rect.top;
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Converti il canvas in una stringa base64 di tipo PNG
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="border border-gray-300 rounded bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
          style={{ touchAction: "none" }}
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={clearCanvas}>
          Cancella
        </Button>
        <Button 
          type="button" 
          disabled={!hasSignature} 
          onClick={saveSignature}
          className="flex gap-2 items-center"
        >
          <Save className="h-4 w-4" /> Salva firma
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Utilizzare il mouse o il touchscreen per firmare
      </p>
    </div>
  );
}
