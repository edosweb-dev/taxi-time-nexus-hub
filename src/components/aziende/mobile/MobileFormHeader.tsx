import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MobileFormHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  progress: number;
  completedSteps: Set<number>;
  onBack: () => void;
  onSaveDraft?: () => void;
  onStepClick?: (step: number) => void;
}

export function MobileFormHeader({
  currentStep,
  totalSteps,
  title,
  subtitle,
  progress,
  completedSteps,
  onBack,
  onSaveDraft,
  onStepClick,
}: MobileFormHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-background border-b lg:hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack}
          className="flex-shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 text-center px-2 min-w-0">
          <h1 className="font-semibold text-base truncate">{title}</h1>
          <p className="text-xs text-muted-foreground">
            {subtitle || `Step ${currentStep} di ${totalSteps}`}
          </p>
        </div>

        {onSaveDraft && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSaveDraft}
            className="flex-shrink-0"
          >
            <Save className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-muted h-1">
        <div 
          className="h-1 bg-primary transition-all duration-300 ease-in-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 py-3 px-4">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => {
          const isActive = step === currentStep;
          const isCompleted = completedSteps.has(step);
          const isClickable = isCompleted || step === currentStep;

          return (
            <button
              key={step}
              onClick={() => isClickable && onStepClick?.(step)}
              disabled={!isClickable}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isActive && "w-8 bg-primary",
                !isActive && isCompleted && "w-2 bg-primary/60",
                !isActive && !isCompleted && "w-2 bg-muted",
                isClickable && "cursor-pointer hover:bg-primary/80",
                !isClickable && "cursor-not-allowed opacity-50"
              )}
              aria-label={`Step ${step}`}
            />
          );
        })}
      </div>
    </div>
  );
}
