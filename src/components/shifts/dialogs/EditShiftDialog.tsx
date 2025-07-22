
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddShiftSheet } from '../AddShiftSheet';
import { Shift } from '../types';

interface EditShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift: Shift | null;
  isAdminOrSocio: boolean;
}

export function EditShiftDialog({
  open,
  onOpenChange,
  shift,
  isAdminOrSocio
}: EditShiftDialogProps) {
  if (!shift) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        <AddShiftSheet
          open={open}
          onOpenChange={onOpenChange}
          isAdminOrSocio={isAdminOrSocio}
          defaultDate={new Date(shift.shift_date)}
          defaultUserId={shift.user_id}
          editingShift={shift}
          mode="dialog"
        />
      </DialogContent>
    </Dialog>
  );
}
