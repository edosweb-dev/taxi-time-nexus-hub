import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileFormFooterProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  currentStep: number;
  totalSteps: number;
  isSubmitting?: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  className?: string;
}

export function MobileFormFooter({
  isFirstStep,
  isLastStep,
  currentStep,
  totalSteps,
  isSubmitting = false,
  onPrevious,
  onNext,
  onSubmit,
  className,
}: MobileFormFooterProps) {
  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden",
        "safe-area-inset-bottom",
        className
      )}
    >
      <div className="p-4">
        <div className="flex gap-3">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={isSubmitting}
              className="min-h-[48px] flex-1"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Indietro
            </Button>
          )}
          
          <Button
            type="button"
            onClick={isLastStep ? onSubmit : onNext}
            disabled={isSubmitting}
            className={cn(
              "min-h-[48px]",
              isFirstStep ? "w-full" : "flex-1"
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvataggio...
              </>
            ) : isLastStep ? (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salva Azienda
              </>
            ) : (
              <>
                Avanti
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
        
        {/* Step info */}
        <div className="text-center mt-2">
          <p className="text-xs text-muted-foreground">
            Passo {currentStep} di {totalSteps}
          </p>
        </div>
      </div>
    </div>
  );
}
