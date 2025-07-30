import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Shift } from '../types';
import { getShiftTypeDisplay } from '../utils/shiftDisplayUtils';
import { getUserDisplayName } from '../utils/userDisplayUtils';
import { Edit, Trash2, User, Clock } from 'lucide-react';

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
      <DialogContent className="max-w-md p-6">
        <div className="space-y-4">
          {/* User info */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <User className="h-5 w-5 text-primary" />
            <div>
              <div className="font-semibold text-lg">{userDisplayName}</div>
            </div>
          </div>

          {/* Shift type */}
          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <Clock className="h-5 w-5 text-primary" />
            <div>
              <div className="font-medium">{getShiftTypeDisplay(shift)}</div>
            </div>
          </div>

          {/* Actions */}
          {canEdit && (
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleEditClick}
                className="flex-1"
                variant="outline"
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}