
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

interface FirmaDisplayProps {
  firmaUrl?: string | null;
  firmaTimestamp?: string | null;
}

export function FirmaDisplay({ firmaUrl, firmaTimestamp }: FirmaDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (firmaUrl) {
      setIsLoading(true);
      
      // Verifica se ci sono doppie slash nel URL e le corregge
      const correctedUrl = firmaUrl.replace(/([^:]\/)\/+/g, "$1");
      setImageUrl(correctedUrl);
      setImageError(false);
      
      console.log("Tentativo caricamento immagine firma:", correctedUrl);
      
      // Precarica l'immagine per verificare che sia valida
      const img = new Image();
      img.onload = () => {
        console.log("Immagine firma caricata correttamente");
        
        // Verifica che l'immagine abbia dimensioni reali
        if (img.width < 10 || img.height < 10) {
          console.error("L'immagine è troppo piccola, potrebbe essere vuota");
          setImageError(true);
        } else {
          console.log("Dimensioni immagine firma:", img.width, "x", img.height);
          
          // Test per verificare se l'immagine è completamente bianca
          try {
            // Crea un canvas per analizzare i pixel dell'immagine
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (ctx) {
              canvas.width = img.width;
              canvas.height = img.height;
              
              // Disegna l'immagine sul canvas
              ctx.drawImage(img, 0, 0);
              
              // Ottiene i dati dei pixel
              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const data = imageData.data;
              
              // Controlla se tutti i pixel sono trasparenti o bianchi
              let isBlank = true;
              for (let i = 0; i < data.length; i += 4) {
                // Verifica se il pixel ha alpha > 0 e non è bianco (255,255,255)
                if (data[i+3] > 0 && (data[i] < 255 || data[i+1] < 255 || data[i+2] < 255)) {
                  isBlank = false;
                  break;
                }
              }
              
              if (isBlank) {
                console.error("L'immagine sembra essere completamente bianca o trasparente");
                setImageError(true);
              }
            }
          } catch (e) {
            console.error("Errore nell'analisi dei pixel dell'immagine:", e);
          }
        }
        
        setIsLoading(false);
      };
      img.onerror = (e) => {
        console.error("Errore caricamento immagine firma:", e);
        setImageError(true);
        setIsLoading(false);
      };
      img.src = correctedUrl;
      
      // Timeout in caso l'immagine non si carichi entro 5 secondi
      const timeout = setTimeout(() => {
        if (isLoading) {
          console.error("Timeout caricamento immagine firma");
          setImageError(true);
          setIsLoading(false);
        }
      }, 5000);
      
      return () => clearTimeout(timeout);
    } else {
      setIsLoading(false);
    }
  }, [firmaUrl]);
  
  if (!firmaUrl) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Firma Digitale</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="border p-4 bg-white rounded-md flex justify-center items-center min-h-[150px]">
            {isLoading ? (
              <Skeleton className="h-24 w-48" />
            ) : imageUrl && !imageError ? (
              <img 
                src={imageUrl} 
                alt="Firma digitale" 
                className="max-w-full h-auto"
                onError={() => setImageError(true)}
                crossOrigin="anonymous" // Necessario per accedere ai pixel in alcuni browser
              />
            ) : (
              <div className="flex flex-col justify-center items-center h-32 text-muted-foreground gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>
                  {imageError ? "Errore nel caricamento dell'immagine" : "Nessuna firma disponibile"}
                </span>
              </div>
            )}
          </div>
          {firmaTimestamp && (
            <p className="text-sm text-muted-foreground">
              Firmato il: {format(new Date(firmaTimestamp), 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
