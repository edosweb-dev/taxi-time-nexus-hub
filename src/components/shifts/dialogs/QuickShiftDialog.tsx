import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useShifts, Shift } from '../ShiftContext';
import { ShiftType, HalfDayType } from '../types';
import { Profile } from '@/lib/types';
import { shiftTypeLabels } from '../grid/ShiftGridLegend';

interface QuickShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCell: { userId: string; date: string } | null;
  user: Profile | null;
  existingShifts: Shift[];
}

export function QuickShiftDialog({ 
  open, 
  onOpenChange, 
  selectedCell, 
  user,
  existingShifts 
}: QuickShiftDialogProps) {
  const { createShift, updateShift, deleteShift } = useShifts();
  const [newShiftType, setNewShiftType] = useState<ShiftType | ''>('');
  const [newHalfDayType, setNewHalfDayType] = useState<HalfDayType>('morning');
  const [newStartTime, setNewStartTime] = useState('');
  const [newEndTime, setNewEndTime] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Reset form when dialog opens
    if (open) {
      setNewShiftType('');
      setNewHalfDayType('morning');
      setNewStartTime('');
      setNewEndTime('');
      setNewNotes('');
    }
  }, [open]);

  const handleCreateShift = async () => {
    if (!selectedCell || !newShiftType) return;

    setIsCreating(true);
    try {
      const shiftData = {
        user_id: selectedCell.userId,
        shift_date: new Date(selectedCell.date),
        shift_type: newShiftType as ShiftType,
        half_day_type: newShiftType === 'half_day' ? newHalfDayType : undefined,
        notes: newNotes || undefined
      };

      await createShift(shiftData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating shift:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await deleteShift(shiftId);
    } catch (error) {
      console.error('Error deleting shift:', error);
    }
  };

  const getUserName = () => {
    if (!user) return '';
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || user.last_name || 'Nome non specificato';
  };

  const formatDate = () => {
    if (!selectedCell) return '';
    return format(new Date(selectedCell.date), "EEEE d MMMM yyyy", { locale: it });
  };

  const canAddShift = newShiftType;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Gestione Turni - {getUserName()}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {formatDate()}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Existing Shifts */}
          {existingShifts.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Turni Esistenti</Label>
              <div className="space-y-2">
                {existingShifts.map((shift) => (
                  <div key={shift.id} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-1">
                        {shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels]}
                        {shift.shift_type === 'half_day' && shift.half_day_type && 
                          ` (${shift.half_day_type === 'morning' ? 'Mattino' : 'Pomeriggio'})`
                        }
                      </Badge>
                      {shift.start_time && shift.end_time && (
                        <p className="text-sm text-muted-foreground">
                          {shift.start_time} - {shift.end_time}
                        </p>
                      )}
                      {shift.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{shift.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteShift(shift.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
                }
              </div>
            </div>
          )}

          {/* Add New Shift */}
          <div className="space-y-3 pt-2 border-t">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Aggiungi Nuovo Turno
            </Label>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="shiftType" className="text-xs">Tipo Turno</Label>
                <Select value={newShiftType} onValueChange={(value) => setNewShiftType(value as ShiftType | '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipo turno" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(shiftTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {newShiftType === 'half_day' && (
                <div>
                  <Label htmlFor="halfDayType" className="text-xs">Tipologia</Label>
                  <Select value={newHalfDayType || 'morning'} onValueChange={(value) => setNewHalfDayType(value as HalfDayType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona tipologia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Mattino</SelectItem>
                      <SelectItem value="afternoon">Pomeriggio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="text-xs">Note (opzionale)</Label>
                <Textarea
                  id="notes"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Inserisci note per il turno..."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Chiudi
            </Button>
            <Button 
              onClick={handleCreateShift}
              disabled={!canAddShift || isCreating}
            >
              {isCreating ? 'Aggiunta...' : 'Aggiungi Turno'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
