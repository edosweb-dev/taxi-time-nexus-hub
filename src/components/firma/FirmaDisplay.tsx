
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCcw, Image as ImageIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

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
      const cacheBustUrl = `${correctedUrl}?v=${Date.now()}&retry=${retryCount}`;
      setImageUrl(cacheBustUrl);
      
      console.log(`Tentativo ${retryCount + 1} caricamento immagine firma:`, cacheBustUrl);
      
      // Create a standard HTMLImageElement to check if image loads properly
      const imgElement = document.createElement('img');
      
      imgElement.onload = () => {
        console.log("Immagine firma caricata correttamente");
        setIsLoading(false);
        setImageError(false);
      };
      
      imgElement.onerror = (e) => {
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
      imgElement.crossOrigin = "anonymous";
      imgElement.src = cacheBustUrl;
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
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 pb-2">
        <CardTitle className="text-lg flex items-center">
          <ImageIcon className="h-4 w-4 mr-2" />
          Firma Digitale
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className={cn(
            "border rounded-md flex justify-center items-center min-h-[150px] overflow-hidden",
            isLoading ? "bg-muted/20" : "bg-white"
          )}>
            {isLoading ? (
              <div className="w-full h-full flex justify-center items-center p-6">
                <Skeleton className="h-24 w-48 rounded-md opacity-60" />
              </div>
            ) : imageUrl && !imageError ? (
              <div className="w-full p-2">
                <AspectRatio ratio={3/1} className="overflow-hidden w-full mx-auto max-w-md">
                  <img 
                    src={imageUrl} 
                    alt="Firma digitale" 
                    className="object-contain h-auto w-full"
                    onError={() => setImageError(true)}
                    crossOrigin="anonymous"
                  />
                </AspectRatio>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center p-6 text-muted-foreground gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>
                  {imageError ? "Errore nel caricamento della firma" : "Nessuna firma disponibile"}
                </span>
                {imageError && (
                  <button 
                    onClick={handleRetry}
                    className="text-sm mt-2 flex items-center gap-1 text-primary hover:underline"
                  >
                    <RefreshCcw className="h-3 w-3" /> Riprova
                  </button>
                )}
              </div>
            )}
          </div>
          {firmaTimestamp && (
            <p className="text-sm text-muted-foreground text-center">
              Firmato il: {format(new Date(firmaTimestamp), 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
