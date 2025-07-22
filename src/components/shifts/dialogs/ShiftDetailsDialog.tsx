
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '../types';
import { getShiftTypeDisplay, getShiftStatusColor } from '../utils/shiftDisplayUtils';
import { Edit, Trash2, Clock, User, Calendar, FileText } from 'lucide-react';

interface ShiftDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shifts: Shift[];
  selectedDate: Date;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  canEdit: boolean;
}

export function ShiftDetailsDialog({
  open,
  onOpenChange,
  shifts,
  selectedDate,
  onEditShift,
  onDeleteShift,
  canEdit
}: ShiftDetailsDialogProps) {
  const handleEditClick = (shift: Shift) => {
    onEditShift(shift);
    onOpenChange(false);
  };

  const handleDeleteClick = (shiftId: string) => {
    if (window.confirm('Sei sicuro di voler eliminare questo turno?')) {
      onDeleteShift(shiftId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Turni del {format(selectedDate, "EEEE d MMMM yyyy", { locale: it })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {shifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nessun turno programmato per questa giornata</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shifts.map((shift, index) => (
                <div key={shift.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {shift.user_first_name} {shift.user_last_name}
                        </span>
                        <Badge 
                          variant={getShiftStatusColor(shift.shift_type)}
                          className="ml-2"
                        >
                          {getShiftTypeDisplay(shift)}
                        </Badge>
                      </div>

                      {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                          </span>
                        </div>
                      )}

                      {shift.notes && (
                        <div className="flex items-start gap-2 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <span className="text-muted-foreground">{shift.notes}</span>
                        </div>
                      )}
                    </div>

                    {canEdit && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(shift)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(shift.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {index < shifts.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
