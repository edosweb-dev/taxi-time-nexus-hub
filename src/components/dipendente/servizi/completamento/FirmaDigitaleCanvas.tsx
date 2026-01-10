import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eraser } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';
import { cn } from '@/lib/utils';

export interface FirmaCanvasRef {
  toDataURL: (type?: string) => string;
  isEmpty: () => boolean;
  clear: () => void;
}

interface FirmaDigitaleCanvasProps {
  onSignatureChange: (isEmpty: boolean) => void;
  error?: string;
}

export const FirmaDigitaleCanvas = forwardRef<FirmaCanvasRef, FirmaDigitaleCanvasProps>(
  ({ onSignatureChange, error }, ref) => {
    const sigCanvasRef = useRef<SignatureCanvas>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [canvasSize, setCanvasSize] = useState({ width: 500, height: 250 });

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      toDataURL: (type = 'image/png') => {
        return sigCanvasRef.current?.toDataURL(type) || '';
      },
      isEmpty: () => {
        return sigCanvasRef.current?.isEmpty() || true;
      },
      clear: () => {
        sigCanvasRef.current?.clear();
        setIsEmpty(true);
        onSignatureChange(true);
      }
    }));

    useEffect(() => {
      const updateSize = () => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const isMobile = viewportWidth < 768;
        const isLandscape = viewportWidth > viewportHeight;

        if (isMobile) {
          if (isLandscape) {
            // Landscape: canvas più basso per lasciare spazio ai tasti
            setCanvasSize({
              width: Math.min(viewportWidth - 48, 500),
              height: Math.min(viewportHeight - 180, 150),
            });
          } else {
            // Portrait: comportamento normale
            setCanvasSize({
              width: viewportWidth - 64,
              height: 200,
            });
          }
        } else {
          // Desktop
          setCanvasSize({ width: 500, height: 250 });
        }
      };

      updateSize();
      window.addEventListener('resize', updateSize);
      window.addEventListener('orientationchange', updateSize);
      return () => {
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('orientationchange', updateSize);
      };
    }, []);

    const handleClear = () => {
      sigCanvasRef.current?.clear();
      setIsEmpty(true);
      onSignatureChange(true);
    };

    const handleEnd = () => {
      if (sigCanvasRef.current) {
        const canvasIsEmpty = sigCanvasRef.current.isEmpty();
        setIsEmpty(canvasIsEmpty);
        onSignatureChange(canvasIsEmpty);
      }
    };

    return (
    <Card className="p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">
            ✍️ Firma <span className="text-destructive">*</span>
          </h3>
          {error && (
            <span className="text-xs text-destructive">{error}</span>
          )}
        </div>

        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg overflow-hidden bg-white",
            error ? "border-destructive" : "border-gray-300",
            "touch-none"
          )}
          style={{ width: canvasSize.width, height: canvasSize.height }}
        >
          <SignatureCanvas
            ref={sigCanvasRef}
            canvasProps={{
              width: canvasSize.width,
              height: canvasSize.height,
              className: 'signature-canvas',
            }}
            onEnd={handleEnd}
            penColor="black"
            minWidth={1}
            maxWidth={2}
            velocityFilterWeight={0.7}
            backgroundColor="white"
          />
          
          {isEmpty && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-muted-foreground text-sm text-center px-4">
                Firma qui
              </p>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={isEmpty}
          className="w-full sm:w-auto"
        >
          <Eraser className="h-4 w-4 mr-2" />
          Cancella Firma
        </Button>
      </div>
    </Card>
  );
});

FirmaDigitaleCanvas.displayName = 'FirmaDigitaleCanvas';
