import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';

interface SimpleConflictDialogProps {
  open: boolean;
  conflict: {
    existingShift: any;
    newShift: any;
  } | null;
  onResolution: (action: 'replace' | 'keep' | 'skip') => void;
  onCancel: () => void;
}

const shiftTypeLabels = {
  specific_hours: 'Orario specifico',
  full_day: 'Giornata intera',
  half_day: 'Mezza giornata',
  sick_leave: 'Malattia',
  unavailable: 'Non disponibile'
};

const halfDayLabels = {
  morning: 'Mattina',
  afternoon: 'Pomeriggio'
};

function formatShiftDetails(shift: any) {
  let details = shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels] || shift.shift_type;
  
  if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
    details += ` (${shift.start_time} - ${shift.end_time})`;
  } else if (shift.shift_type === 'half_day' && shift.half_day_type) {
    details += ` - ${halfDayLabels[shift.half_day_type as keyof typeof halfDayLabels]}`;
  }
  
  return details;
}

export function SimpleConflictDialog({ 
  open, 
  conflict, 
  onResolution, 
  onCancel 
}: SimpleConflictDialogProps) {
  if (!conflict) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Turno già esistente
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="font-medium text-sm text-muted-foreground mb-2">
              {conflict.newShift.user_name}
            </div>
            <div className="font-semibold">
              {format(new Date(conflict.newShift.shift_date), 'EEEE d MMMM yyyy', { locale: it })}
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <div className="text-sm font-medium">Turno esistente:</div>
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                {formatShiftDetails(conflict.existingShift)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Nuovo turno:</div>
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm">
                {formatShiftDetails(conflict.newShift)}
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Come vuoi procedere?
          </div>

          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => onResolution('replace')}
              variant="destructive"
              size="sm"
            >
              Sostituisci con il nuovo turno
            </Button>
            
            <Button 
              onClick={() => onResolution('keep')}
              variant="outline"
              size="sm"
            >
              Mantieni quello esistente
            </Button>
            
            <Button 
              onClick={() => onResolution('skip')}
              variant="ghost"
              size="sm"
            >
              Salta questa data
            </Button>
          </div>

          <div className="pt-2 border-t">
            <Button 
              onClick={onCancel}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Annulla tutto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}