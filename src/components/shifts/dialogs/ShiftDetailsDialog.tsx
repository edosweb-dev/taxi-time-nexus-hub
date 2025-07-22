
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Shift } from '../types';
import { getShiftTypeDisplay, getShiftStatusColor } from '../utils/shiftDisplayUtils';
import { getUserDisplayName } from '../utils/userDisplayUtils';
import { Edit, Trash2, Clock, User, Calendar, FileText, Mail } from 'lucide-react';

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

  console.log('[ShiftDetailsDialog] Rendering with shifts:', shifts);

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
              {shifts.map((shift, index) => {
                const userDisplayName = getUserDisplayName(shift);
                
                console.log(`[ShiftDetailsDialog] Rendering shift ${shift.id} - User: ${userDisplayName}`);
                
                return (
                  <div key={shift.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        {/* User info section with enhanced visibility */}
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <User className="h-5 w-5 text-primary flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-bold text-base text-foreground">
                              {userDisplayName}
                            </div>
                            {shift.user_email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Mail className="h-3 w-3" />
                                <span>{shift.user_email}</span>
                              </div>
                            )}
                          </div>
                          <Badge 
                            variant={getShiftStatusColor(shift.shift_type)}
                            className="ml-2"
                          >
                            {getShiftTypeDisplay(shift)}
                          </Badge>
                        </div>

                        {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time && (
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                            </span>
                          </div>
                        )}

                        {shift.notes && (
                          <div className="flex items-start gap-2 text-sm p-2 bg-amber-50 rounded">
                            <FileText className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            <span className="text-amber-800">{shift.notes}</span>
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
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
