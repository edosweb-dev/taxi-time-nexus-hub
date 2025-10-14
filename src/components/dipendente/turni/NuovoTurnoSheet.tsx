import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { TurnoForm } from './TurnoForm';
import { TurnoFormData } from '@/hooks/dipendente/useTurnoCRUD';
import { useState, useEffect } from 'react';

interface NuovoTurnoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TurnoFormData) => Promise<void>;
  defaultDate?: Date;
  isLoading?: boolean;
}

export function NuovoTurnoSheet({
  isOpen,
  onClose,
  onSubmit,
  defaultDate,
  isLoading,
}: NuovoTurnoSheetProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (data: TurnoFormData) => {
    await onSubmit(data);
    onClose();
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Nuovo Turno</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Chiudi
        </Button>
      </div>

      {/* Form */}
      <TurnoForm
        defaultValues={defaultDate ? { data: defaultDate } : undefined}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={isLoading}
        submitLabel="Crea Turno"
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
