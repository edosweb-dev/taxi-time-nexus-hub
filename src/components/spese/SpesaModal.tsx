
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SpesaForm } from './SpesaForm';
import { useAuth } from '@/contexts/AuthContext';

interface SpesaModalProps {
  onSpesaAdded?: () => void;
}

export function SpesaModal({ onSpesaAdded }: SpesaModalProps) {
  const [open, setOpen] = useState(false);
  const { profile } = useAuth();

  const handleSpesaAdded = () => {
    setOpen(false);
    onSpesaAdded?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-5 w-5" />
          Registra nuova spesa
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {['admin', 'socio'].includes(profile?.role || '') ? 'Registra spesa dipendente' : 'Registra nuova spesa'}
          </DialogTitle>
        </DialogHeader>
        <SpesaForm onSuccess={handleSpesaAdded} />
      </DialogContent>
    </Dialog>
  );
}
