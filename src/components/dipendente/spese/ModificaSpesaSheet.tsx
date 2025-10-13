import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { SpesaForm } from './SpesaForm';
import { useSpesaCRUD, SpesaFormData } from '@/hooks/dipendente/useSpesaCRUD';
import { useState, useEffect } from 'react';
import { parseISO } from 'date-fns';

interface ModificaSpesaSheetProps {
  spesa: {
    id: string;
    causale: string;
    importo: number;
    data_spesa: string;
    note?: string | null;
    stato: string;
    user_id: string;
  };
  open: boolean;
  onClose: () => void;
}

export function ModificaSpesaSheet({ spesa, open, onClose }: ModificaSpesaSheetProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { updateSpesa } = useSpesaCRUD();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (data: SpesaFormData) => {
    await updateSpesa.mutateAsync({ id: spesa.id, data });
    onClose();
  };

  const defaultValues: Partial<SpesaFormData> = {
    dataSpesa: parseISO(spesa.data_spesa),
    importo: spesa.importo,
    causale: spesa.causale,
    note: spesa.note || ''
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
          <h2 className="text-lg font-semibold">Modifica Spesa</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Form */}
      <SpesaForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        onCancel={onClose}
        isLoading={updateSpesa.isPending}
        submitLabel="Salva Modifiche"
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] px-4 pb-8">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  );
}
