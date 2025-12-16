import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VeicoloForm } from './VeicoloForm';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';
import { Car, Plus } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "bg-background",
          isMobile 
            ? "h-[92vh] rounded-t-2xl p-0" 
            : "sm:max-w-[480px] p-0"
        )}
      >
        {/* Header */}
        <SheetHeader className="px-4 pt-4 pb-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center",
              isEditing 
                ? "bg-amber-500/10 text-amber-600" 
                : "bg-primary/10 text-primary"
            )}>
              {isEditing ? <Car className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div>
              <SheetTitle className="text-lg font-semibold">
                {isEditing ? 'Modifica Veicolo' : 'Nuovo Veicolo'}
              </SheetTitle>
              {isEditing && (
                <p className="text-sm text-muted-foreground font-mono">
                  {veicolo.targa}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>
        
        {/* Form */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
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
