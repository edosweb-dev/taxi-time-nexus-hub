import React from 'react';
import { FileText, Files } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Card } from '@/components/ui/card';
import { TouchOptimizer } from '@/components/ui/touch-optimizer';

interface ShiftInsertTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: 'single' | 'batch') => void;
}

export function ShiftInsertTypeModal({
  open,
  onOpenChange,
  onSelectType
}: ShiftInsertTypeModalProps) {
  const isMobile = useIsMobile();

  const handleSelectSingle = () => {
    onSelectType('single');
  };

  const handleSelectBatch = () => {
    onSelectType('batch');
  };

  const content = (
    <div className="space-y-4 p-4">
      <TouchOptimizer minSize="lg">
        <Card 
          className="p-6 cursor-pointer hover:border-primary transition-colors"
          onClick={handleSelectSingle}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Inserimento Singolo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Crea un turno per un dipendente
              </p>
            </div>
          </div>
        </Card>
      </TouchOptimizer>

      <TouchOptimizer minSize="lg">
        <Card 
          className="p-6 cursor-pointer hover:border-primary transition-colors"
          onClick={handleSelectBatch}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Files className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Inserimento Massivo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Crea turni per più dipendenti in un periodo specifico
              </p>
            </div>
          </div>
        </Card>
      </TouchOptimizer>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Come vuoi inserire i turni?</DrawerTitle>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Come vuoi inserire i turni?</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
