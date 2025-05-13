
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FirmaDisplayProps {
  firmaUrl?: string | null;
  firmaTimestamp?: string | null;
}

export function FirmaDisplay({ firmaUrl, firmaTimestamp }: FirmaDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  
  useEffect(() => {
    if (firmaUrl) {
      // Verifica se ci sono doppie slash nel URL e le corregge
      const correctedUrl = firmaUrl.replace(/([^:]\/)\/+/g, "$1");
      setImageUrl(correctedUrl);
      setImageError(false);
      console.log("URL immagine firma corretta:", correctedUrl);
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
          <div className="border p-4 bg-white rounded-md">
            {imageUrl && !imageError ? (
              <img 
                src={imageUrl} 
                alt="Firma digitale" 
                className="max-w-full h-auto"
                onError={(e) => {
                  console.error("Errore caricamento immagine:", e);
                  setImageError(true);
                }}
              />
            ) : (
              <div className="flex justify-center items-center h-32 text-muted-foreground">
                {imageError ? "Errore nel caricamento dell'immagine" : "Caricamento firma..."}
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
