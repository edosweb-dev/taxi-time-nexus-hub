import React from 'react';
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet';
import { VeicoloForm } from './VeicoloForm';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';
import { Car, Plus, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
          "flex flex-col bg-background p-0 overflow-hidden",
          isMobile 
            ? "h-[85vh] max-h-[85vh] rounded-t-[24px]" 
            : "sm:max-w-[480px] h-full"
        )}
      >
        {/* Mobile handle */}
        {isMobile && (
          <div className="flex justify-center py-3 shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
          </div>
        )}

        {/* Header */}
        <div className={cn(
          "shrink-0 border-b border-border",
          isMobile ? "px-5 pb-4" : "px-6 pt-6 pb-4"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                isEditing 
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
                  : "bg-primary/10 text-primary"
              )}>
                {isEditing ? <Car className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {isEditing ? 'Modifica Veicolo' : 'Nuovo Veicolo'}
                </h2>
                {isEditing ? (
                  <p className="text-sm text-muted-foreground">
                    {veicolo.modello} • <span className="font-mono">{veicolo.targa}</span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Aggiungi un veicolo alla flotta
                  </p>
                )}
              </div>
            </div>
            
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-9 w-9 rounded-full shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Form - occupa tutto lo spazio rimanente */}
        <div className="flex-1 min-h-0 overflow-hidden">
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
