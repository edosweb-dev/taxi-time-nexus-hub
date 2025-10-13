import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, X } from 'lucide-react';
import { SpesaForm } from './SpesaForm';
import { useSpesaCRUD, SpesaFormData } from '@/hooks/dipendente/useSpesaCRUD';
import { useState, useEffect } from 'react';

interface NuovaSpesaSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NuovaSpesaSheet({ open, onOpenChange }: NuovaSpesaSheetProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { createSpesa } = useSpesaCRUD();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubmit = async (data: SpesaFormData) => {
    await createSpesa.mutateAsync(data);
    onOpenChange(false);
  };

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <h2 className="text-lg font-semibold">Nuova Spesa</h2>
        </div>
        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Form */}
      <SpesaForm
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
        isLoading={createSpesa.isPending}
        submitLabel="Crea Spesa"
      />
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh] px-4 pb-8">
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  );
}
