import React from 'react';
import { FileText, Files, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/useIsMobile';

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

  const handleSelect = (type: 'single' | 'batch') => {
    console.log('[ShiftInsertTypeModal] Type selected:', type);
    onSelectType(type);
  };

  const content = (
    <div className="space-y-4 p-4">
      {/* Opzione Singolo */}
      <Card 
        className="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-md"
        onClick={() => handleSelect('single')}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Inserimento Singolo</CardTitle>
              <CardDescription className="mt-1">
                Crea un turno per un dipendente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full" 
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('single');
            }}
          >
            Continua
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Opzione Massivo */}
      <Card 
        className="cursor-pointer hover:border-primary transition-all duration-200 hover:shadow-md"
        onClick={() => handleSelect('batch')}
      >
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <Files className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-lg">Inserimento Massivo</CardTitle>
              <CardDescription className="mt-1">
                Crea turni per più dipendenti in un periodo specifico
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              handleSelect('batch');
            }}
          >
            Continua
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  // Mobile: usa Drawer (Sheet bottom-up)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Come vuoi inserire i turni?</DrawerTitle>
            <DrawerDescription>
              Scegli il tipo di inserimento che preferisci
            </DrawerDescription>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: usa Dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Come vuoi inserire i turni?</DialogTitle>
          <DialogDescription>
            Scegli il tipo di inserimento che preferisci
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
