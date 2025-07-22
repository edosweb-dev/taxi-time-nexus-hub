
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VeicoloForm } from './VeicoloForm';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Car, Edit, Plus } from 'lucide-react';

interface VeicoloSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  veicolo?: Veicolo;
  onSubmit: (data: VeicoloFormData) => void;
  isSubmitting: boolean;
}

export function VeicoloSheet({
  open,
  onOpenChange,
  veicolo,
  onSubmit,
  isSubmitting,
}: VeicoloSheetProps) {
  const isEditing = !!veicolo;

  // Helper function to get vehicle initials
  const getVehicleInitials = (modello: string, targa: string) => {
    const modelInitial = modello.charAt(0).toUpperCase();
    const plateInitial = targa.charAt(0).toUpperCase();
    return modelInitial + plateInitial;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-[700px] overflow-y-auto">
        <SheetHeader className="space-y-4 pb-6 border-b">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {isEditing ? getVehicleInitials(veicolo.modello, veicolo.targa) : <Plus className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <SheetTitle className="section-title flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Edit className="h-6 w-6 text-amber-500" />
                    Modifica Veicolo
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-green-500" />
                    Nuovo Veicolo
                  </>
                )}
              </SheetTitle>
              {isEditing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Car className="h-4 w-4" />
                  <span className="text-lg font-medium">{veicolo.modello} - {veicolo.targa}</span>
                </div>
              )}
            </div>
          </div>
          
          <SheetDescription className="text-left">
            {isEditing 
              ? "Modifica i dettagli e le configurazioni del veicolo esistente"
              : "Inserisci tutti i dettagli necessari per aggiungere un nuovo veicolo alla flotta"
            }
          </SheetDescription>
        </SheetHeader>
        
        <div className="pt-6">
          <VeicoloForm
            initialData={veicolo}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
