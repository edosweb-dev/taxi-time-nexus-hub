import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, X } from 'lucide-react';

interface ShiftCreationProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalShifts: number;
  createdShifts: number;
  errorShifts: number;
  isComplete: boolean;
  onClose: () => void;
}

export function ShiftCreationProgressDialog({
  open,
  onOpenChange,
  totalShifts,
  createdShifts,
  errorShifts,
  isComplete,
  onClose
}: ShiftCreationProgressDialogProps) {
  const progress = totalShifts > 0 ? ((createdShifts + errorShifts) / totalShifts) * 100 : 0;
  const remaining = totalShifts - createdShifts - errorShifts;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-8 text-center">
        <div className="space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            {isComplete ? (
              <CheckCircle className="h-12 w-12 text-green-500 animate-scale-in" />
            ) : (
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            )}
          </div>

          {/* Title */}
          <div>
            <h3 className="text-lg font-semibold">
              {isComplete ? 'Creazione completata' : 'Creazione turni in corso'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {isComplete 
                ? `${createdShifts} turni creati con successo${errorShifts > 0 ? `, ${errorShifts} con errori` : ''}`
                : `${remaining} turni rimanenti`
              }
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {createdShifts + errorShifts} / {totalShifts}
            </div>
          </div>

          {/* Stats */}
          {(createdShifts > 0 || errorShifts > 0) && (
            <div className="flex justify-center gap-4 text-xs">
              {createdShifts > 0 && (
                <span className="text-green-600">
                  ✓ {createdShifts} creati
                </span>
              )}
              {errorShifts > 0 && (
                <span className="text-red-600">
                  ✗ {errorShifts} errori
                </span>
              )}
            </div>
          )}

          {/* Close Button (only when complete) */}
          {isComplete && (
            <Button 
              onClick={onClose}
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Chiudi
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}