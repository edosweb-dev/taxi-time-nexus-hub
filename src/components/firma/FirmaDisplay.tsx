
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/components/ui/use-toast";

interface FirmaDisplayProps {
  firmaUrl?: string | null;
  firmaTimestamp?: string | null;
}

export function FirmaDisplay({ firmaUrl, firmaTimestamp }: FirmaDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
  // Function to clean up URL and remove any double slashes
  const cleanupUrl = (url: string) => {
    return url.replace(/([^:]\/)\/+/g, "$1");
  };
  
  useEffect(() => {
    if (!firmaUrl) {
      setIsLoading(false);
      setImageError(false);
      setImageUrl(null);
      return;
    }
    
    const loadImage = () => {
      setIsLoading(true);
      setImageError(false);
      
      // Clean up URL
      const correctedUrl = cleanupUrl(firmaUrl);
      
      // Add cache-busting query parameter to force reload
      const cacheBustUrl = `${correctedUrl}?v=${Date.now()}`;
      setImageUrl(cacheBustUrl);
      
      console.log(`Tentativo ${retryCount + 1} caricamento immagine firma:`, cacheBustUrl);
      
      // Precarica l'immagine per verificare che sia valida
      const img = new Image();
      
      img.onload = () => {
        console.log("Immagine firma caricata correttamente");
        setIsLoading(false);
        setImageError(false);
      };
      
      img.onerror = (e) => {
        console.error("Errore caricamento immagine firma:", e);
        setImageError(true);
        setIsLoading(false);
        
        // Retry logic
        if (retryCount < 3) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1500); // Wait before retrying
        } else if (retryCount === 3) {
          toast({
            title: "Errore di caricamento",
            description: "Impossibile caricare l'immagine della firma",
            variant: "destructive"
          });
        }
      };
      
      // Set crossOrigin to anonymous to allow CORS
      img.crossOrigin = "anonymous";
      img.src = cacheBustUrl;
    };
    
    loadImage();
    
    // Timeout in caso l'immagine non si carichi entro 7 secondi
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.error("Timeout caricamento immagine firma");
        setImageError(true);
        setIsLoading(false);
        
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
        }
      }
    }, 7000);
    
    return () => clearTimeout(timeout);
  }, [firmaUrl, retryCount]);
  
  // Function to handle manual retry
  const handleRetry = () => {
    setRetryCount(0); // Reset retry count
    setImageError(false);
    setIsLoading(true);
  };
  
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
              <AspectRatio ratio={16/9} className="overflow-hidden max-w-full h-auto">
                <img 
                  src={imageUrl} 
                  alt="Firma digitale" 
                  className="max-w-full h-auto object-contain"
                  onError={() => setImageError(true)}
                  crossOrigin="anonymous"
                />
              </AspectRatio>
            ) : (
              <div className="flex flex-col justify-center items-center h-32 text-muted-foreground gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>
                  {imageError ? "Errore nel caricamento dell'immagine" : "Nessuna firma disponibile"}
                </span>
                {imageError && (
                  <button 
                    onClick={handleRetry}
                    className="text-sm mt-2 text-blue-600 hover:underline"
                  >
                    Riprova
                  </button>
                )}
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
