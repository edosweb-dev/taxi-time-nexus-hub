import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShiftForm } from './ShiftForm';
import { CreateShiftData, UpdateShiftData, User, Shift } from '@/types/shifts';

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateShiftData | UpdateShiftData) => Promise<void>;
  users: User[];
  shift?: Shift | null;
  defaultDate?: Date;
  defaultUserId?: string;
  loading?: boolean;
}

export function ShiftDialog({
  open,
  onOpenChange,
  onSubmit,
  users,
  shift,
  defaultDate,
  defaultUserId,
  loading
}: ShiftDialogProps) {
  const handleSubmit = async (data: CreateShiftData) => {
    if (shift) {
      await onSubmit({ ...data, id: shift.id } as UpdateShiftData);
    } else {
      await onSubmit(data);
    }
    onOpenChange(false);
  };

  const defaultValues = shift ? {
    user_id: shift.user_id,
    shift_date: new Date(shift.shift_date),
    shift_type: shift.shift_type as 'work' | 'sick_leave' | 'vacation' | 'unavailable',
    start_time: shift.start_time,
    end_time: shift.end_time,
    notes: shift.notes
  } : {
    user_id: defaultUserId,
    shift_date: defaultDate,
    shift_type: 'work' as const,
    start_time: '09:00',
    end_time: '17:00'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {shift ? 'Modifica turno' : 'Nuovo turno'}
          </DialogTitle>
        </DialogHeader>
        <ShiftForm
          onSubmit={handleSubmit}
          users={users}
          defaultValues={defaultValues}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}