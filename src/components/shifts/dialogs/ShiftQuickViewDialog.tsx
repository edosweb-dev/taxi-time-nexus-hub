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
      <DialogContent className="max-w-xs p-4">
        <div className="space-y-3 text-center">
          <div className="font-semibold text-lg">{userDisplayName}</div>
          <div className="text-muted-foreground">{getShiftTypeDisplay(shift)}</div>
          
          {canEdit && (
            <div className="flex gap-2 justify-center pt-2">
              <Button
                onClick={handleEditClick}
                variant="outline"
                size="sm"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDeleteClick}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}