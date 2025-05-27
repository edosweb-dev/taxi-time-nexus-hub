
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SpesaForm } from './SpesaForm';
import { useAuth } from '@/contexts/AuthContext';

interface SpesaSheetProps {
  onSpesaAdded?: () => void;
}

export function SpesaSheet({ onSpesaAdded }: SpesaSheetProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();

  const handleSpesaAdded = () => {
    setOpen(false);
    onSpesaAdded?.();
  };

  const isAdminOrSocio = ['admin', 'socio'].includes(profile?.role || '');

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-5 w-5" />
          Registra nuova spesa
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {isAdminOrSocio ? 'Registra spesa dipendente' : 'Registra nuova spesa'}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <SpesaForm onSuccess={handleSpesaAdded} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
