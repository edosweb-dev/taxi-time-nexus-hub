import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { TurnoForm } from './TurnoForm';
import { TurnoFormData } from '@/hooks/dipendente/useTurnoCRUD';
import { Shift } from '@/lib/utils/turniHelpers';
import { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';

interface ModificaTurnoSheetProps {
  turno: Shift | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TurnoFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ModificaTurnoSheet({
  turno,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: ModificaTurnoSheetProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!turno) return null;

  const defaultValues: Partial<TurnoFormData> = {
    data: parseISO(turno.shift_date),
    tipo: turno.shift_type,
    oraInizio: turno.start_time || undefined,
    oraFine: turno.end_time || undefined,
    mezzaGiornata: turno.half_day_type || undefined,
    dataInizio: turno.start_date ? parseISO(turno.start_date) : undefined,
    dataFine: turno.end_date ? parseISO(turno.end_date) : undefined,
    note: turno.notes || undefined,
  };

  const handleSubmit = async (data: TurnoFormData) => {
    await onSubmit(data);
    onClose();
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">Modifica Turno</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Form */}
      <TurnoForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        submitLabel="Salva Modifiche"
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] px-4 pb-8">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  );
}
