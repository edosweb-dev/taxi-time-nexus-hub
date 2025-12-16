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
          "flex flex-col bg-background",
          isMobile 
            ? "h-[85vh] rounded-t-3xl p-0" 
            : "sm:max-w-[480px] p-0"
        )}
      >
        {/* Mobile handle bar */}
        {isMobile && (
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Header */}
        <SheetHeader className={cn(
          "px-5 pb-4 border-b border-border shrink-0",
          isMobile ? "pt-2" : "pt-5"
        )}>
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center shrink-0",
              isEditing 
                ? "bg-amber-500/15 text-amber-600" 
                : "bg-primary/15 text-primary"
            )}>
              {isEditing ? <Car className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-xl font-semibold text-left">
                {isEditing ? 'Modifica Veicolo' : 'Nuovo Veicolo'}
              </SheetTitle>
              {isEditing && (
                <p className="text-sm text-muted-foreground font-mono truncate">
                  {veicolo.modello} • {veicolo.targa}
                </p>
              )}
            </div>
          </div>
        </SheetHeader>
        
        {/* Form with scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          <VeicoloForm
            initialData={veicolo}
            onSubmit={onSubmit}
            onCancel={() => onOpenChange(false)}
            isSubmitting={isSubmitting}
            isMobile={isMobile}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
