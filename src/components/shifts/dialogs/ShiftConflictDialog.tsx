import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Clock, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '../types';

interface ConflictedShift {
  existingShift: Shift;
  newShift: {
    user_id: string;
    user_name: string;
    shift_date: Date;
    shift_type: string;
    start_time?: string;
    end_time?: string;
    half_day_type?: string;
  };
}

interface ShiftConflictDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: ConflictedShift[];
  onResolve: (resolutions: Array<{ conflict: ConflictedShift; action: 'keep_existing' | 'use_new' | 'skip' }>) => void;
  onCancel: () => void;
}

const shiftTypeLabels = {
  specific_hours: 'Orario specifico',
  full_day: 'Giornata intera',
  half_day: 'Mezza giornata',
  sick_leave: 'Malattia',
  unavailable: 'Non disponibile'
};

export function ShiftConflictDialog({
  open,
  onOpenChange,
  conflicts,
  onResolve,
  onCancel
}: ShiftConflictDialogProps) {
  const [resolutions, setResolutions] = useState<Record<number, 'keep_existing' | 'use_new' | 'skip'>>({});

  const handleResolutionChange = (conflictIndex: number, action: 'keep_existing' | 'use_new' | 'skip') => {
    setResolutions(prev => ({
      ...prev,
      [conflictIndex]: action
    }));
  };

  const handleResolve = () => {
    const resolvedConflicts = conflicts.map((conflict, index) => ({
      conflict,
      action: resolutions[index] || 'skip'
    }));
    onResolve(resolvedConflicts);
  };

  const formatShiftTime = (shift: any) => {
    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
      return `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`;
    }
    if (shift.shift_type === 'half_day' && shift.half_day_type) {
      return shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio';
    }
    return shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels] || shift.shift_type;
  };

  const getShiftBadgeVariant = (shiftType: string) => {
    switch (shiftType) {
      case 'specific_hours': return 'default';
      case 'full_day': return 'secondary';
      case 'half_day': return 'outline';
      case 'sick_leave': return 'destructive';
      case 'unavailable': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Conflitti di turni rilevati
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Sono stati rilevati {conflicts.length} conflitti durante l'inserimento dei turni. 
            Per ogni conflitto, scegli come procedere:
          </p>

          {conflicts.map((conflict, index) => (
            <Card key={index} className="border-amber-200 bg-amber-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {conflict.newShift.user_name}
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(conflict.newShift.shift_date, 'd MMMM yyyy', { locale: it })}
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Comparison of shifts */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Existing shift */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-green-700">Turno esistente</h4>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getShiftBadgeVariant(conflict.existingShift.shift_type)}>
                          {shiftTypeLabels[conflict.existingShift.shift_type as keyof typeof shiftTypeLabels]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatShiftTime(conflict.existingShift)}
                      </div>
                      {conflict.existingShift.notes && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Note: {conflict.existingShift.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* New shift */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-blue-700">Nuovo turno</h4>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getShiftBadgeVariant(conflict.newShift.shift_type)}>
                          {shiftTypeLabels[conflict.newShift.shift_type as keyof typeof shiftTypeLabels]}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatShiftTime(conflict.newShift)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resolution options */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Come vuoi risolvere questo conflitto?</h4>
                  <RadioGroup
                    value={resolutions[index] || ''}
                    onValueChange={(value) => handleResolutionChange(index, value as any)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="keep_existing" id={`keep-${index}`} />
                      <Label htmlFor={`keep-${index}`} className="text-sm">
                        Mantieni il turno esistente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="use_new" id={`new-${index}`} />
                      <Label htmlFor={`new-${index}`} className="text-sm">
                        Sostituisci con il nuovo turno
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="skip" id={`skip-${index}`} />
                      <Label htmlFor={`skip-${index}`} className="text-sm">
                        Salta questo turno (non inserire)
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button 
            onClick={handleResolve}
            disabled={Object.keys(resolutions).length !== conflicts.length}
          >
            Risolvi conflitti
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
