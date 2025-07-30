import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Shift } from '../types';
import { getShiftTypeDisplay, getShiftStatusColor } from '../utils/shiftDisplayUtils';
import { getUserDisplayName } from '../utils/userDisplayUtils';
import { Edit, Trash2, User, Clock, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ShiftQuickViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  canEdit: boolean;
}

export function ShiftQuickViewDialog({
  open,
  onOpenChange,
  shift,
  onEditShift,
  onDeleteShift,
  canEdit
}: ShiftQuickViewDialogProps) {
  if (!shift) return null;

  const handleEditClick = () => {
    onEditShift(shift);
    onOpenChange(false);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Sei sicuro di voler eliminare questo turno?')) {
      onDeleteShift(shift.id);
      onOpenChange(false);
    }
  };

  const userDisplayName = getUserDisplayName(shift);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Dettagli Turno
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <User className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-base">{userDisplayName}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(shift.shift_date), "EEEE d MMMM yyyy", { locale: it })}
              </div>
            </div>
          </div>

          {/* Shift type info */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Clock className="h-5 w-5 text-primary flex-shrink-0" />
            <div className="flex-1">
              <div className="font-medium">{getShiftTypeDisplay(shift)}</div>
              {shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time && (
                <div className="text-sm text-muted-foreground">
                  {shift.start_time.substring(0, 5)} - {shift.end_time.substring(0, 5)}
                </div>
              )}
            </div>
          </div>

          {shift.notes && (
            <div className="p-3 bg-amber-50 rounded-lg border-l-4 border-amber-300">
              <div className="text-sm text-amber-800">
                <strong>Note:</strong> {shift.notes}
              </div>
            </div>
          )}

          {canEdit && (
            <>
              <Separator />
              <div className="flex gap-3">
                <Button
                  onClick={handleEditClick}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifica
                </Button>
                <Button
                  onClick={handleDeleteClick}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Elimina
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}