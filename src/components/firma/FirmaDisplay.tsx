
import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, RefreshCcw, Image as ImageIcon } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { cleanupFirmaUrl } from "@/components/servizi/utils/firmaUtils";

interface FirmaDisplayProps {
  firmaUrl?: string | null;
  firmaTimestamp?: string | null;
}

export function FirmaDisplay({ firmaUrl, firmaTimestamp }: FirmaDisplayProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  
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
      
      // Clean up URL using the utility function
      const correctedUrl = cleanupFirmaUrl(firmaUrl);
      
      // Add cache-busting query parameter to force reload
      const cacheBustUrl = `${correctedUrl}?v=${Date.now()}&retry=${retryCount}`;
      setImageUrl(cacheBustUrl);
      
      console.log(`Tentativo ${retryCount + 1} caricamento immagine firma:`, cacheBustUrl);
      
      // Create a standard HTMLImageElement to check if image loads properly
      const imgElement = new Image();
      
      imgElement.onload = () => {
        console.log("Immagine firma caricata correttamente");
        setIsLoading(false);
        setImageError(false);
      };
      
      imgElement.onerror = () => {
        console.error("Errore caricamento immagine firma:", firmaUrl);
        setImageError(true);
        setIsLoading(false);
        
        // Retry logic with exponential backoff
        if (retryCount < 2) {
          const delay = Math.pow(2, retryCount) * 1000;
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, delay);
        } else if (retryCount === 2) {
          toast({
            title: "Errore di caricamento",
            description: "Impossibile caricare l'immagine della firma",
            variant: "destructive"
          });
        }
      };
      
      // Important: To avoid CORS issues
      imgElement.crossOrigin = "anonymous";
      imgElement.referrerPolicy = "no-referrer";
      imgElement.src = cacheBustUrl;
    };
    
    loadImage();
    
    // Timeout if image doesn't load within 5 seconds
    const timeout = setTimeout(() => {
      if (isLoading) {
        setImageError(true);
        setIsLoading(false);
        
        if (retryCount < 2) {
          setRetryCount(prev => prev + 1);
        }
      }
    }, 5000);
    
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
    <Card className="overflow-hidden border-muted">
      <CardHeader className="py-2 px-3 bg-muted/20">
        <CardTitle className="text-sm flex items-center text-muted-foreground">
          <ImageIcon className="h-3 w-3 mr-1.5" />
          Firma Digitale
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex flex-col gap-2">
          <div className={cn(
            "border rounded-md flex justify-center items-center min-h-[100px] overflow-hidden",
            isLoading ? "bg-muted/10" : "bg-white"
          )}>
            {isLoading ? (
              <div className="w-full h-full flex justify-center items-center p-4">
                <Skeleton className="h-16 w-32 rounded-md opacity-40" />
              </div>
            ) : imageUrl && !imageError ? (
              <div className="w-full p-1">
                <AspectRatio ratio={4/1} className="overflow-hidden w-full mx-auto max-w-md">
                  <img 
                    src={imageUrl} 
                    alt="Firma digitale" 
                    className="object-contain h-auto w-full"
                    onError={() => setImageError(true)}
                    crossOrigin="anonymous"
                    referrerPolicy="no-referrer"
                  />
                </AspectRatio>
              </div>
            ) : (
              <div className="flex flex-col justify-center items-center p-3 text-muted-foreground gap-1">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-xs">
                  {imageError ? "Errore nel caricamento della firma" : "Nessuna firma disponibile"}
                </span>
                {imageError && (
                  <button 
                    onClick={handleRetry}
                    className="text-xs mt-1 flex items-center gap-1 text-primary hover:underline"
                  >
                    <RefreshCcw className="h-3 w-3" /> Riprova
                  </button>
                )}
              </div>
            )}
          </div>
          {firmaTimestamp && (
            <p className="text-xs text-muted-foreground text-center">
              Firmato il: {format(new Date(firmaTimestamp), 'dd/MM/yyyy HH:mm')}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
