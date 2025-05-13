
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
        }
        
        setIsLoading(false);
      };
      img.onerror = (e) => {
        console.error("Errore caricamento immagine firma:", e);
        setImageError(true);
        setIsLoading(false);
      };
      img.src = correctedUrl;
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
