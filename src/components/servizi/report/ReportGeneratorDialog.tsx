
import React, { useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ReportGeneratorForm } from './ReportGeneratorForm';

// Define types locally instead of importing them
type PointerDownOutsideEvent = CustomEvent<{ originalEvent: PointerEvent }>;
type FocusOutsideEvent = CustomEvent<{ originalEvent: FocusEvent }>;

interface ReportGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportGeneratorDialog: React.FC<ReportGeneratorDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  // Reference to track if we're already handling a state change
  const isHandlingStateChange = useRef(false);
  
  const handleCancel = useCallback(() => {
    console.log('Dialog cancel called');
    onOpenChange(false);
  }, [onOpenChange]);

  // Gestiamo i click all'esterno del dialogo
  const handleOpenChange = useCallback((newOpen: boolean) => {
    // Prevent recursive state updates
    if (isHandlingStateChange.current) return;
    
    // Only allow closing if we're not currently submitting
    const form = document.querySelector('form');
    if (form?.dataset.submitting === 'true' && !newOpen) {
      console.log('Blocking dialog close during submission');
      return;
    }
    
    isHandlingStateChange.current = true;
    onOpenChange(newOpen);
    // Reset the flag after a small delay to ensure React has processed the update
    setTimeout(() => {
      isHandlingStateChange.current = false;
    }, 0);
  }, [onOpenChange]);

  // Handler per i click all'esterno del dialogo
  const handlePointerDownOutside = useCallback((e: PointerDownOutsideEvent) => {
    // Prevent closing the dialog if form is being submitted
    const form = document.querySelector('form');
    if (form?.dataset.submitting === 'true') {
      console.log('Preventing dialog close during form submission');
      e.preventDefault();
      
      // Accesso all'evento originale se necessario
      if (e.detail?.originalEvent) {
        e.detail.originalEvent.preventDefault();
        console.log('Applied preventDefault to original pointer event');
      }
    }
  }, []);

  // Handler per le interazioni esterne con tipo corretto
  const handleInteractOutside = useCallback((event: PointerDownOutsideEvent | FocusOutsideEvent) => {
    const form = document.querySelector('form');
    if (form?.dataset.submitting === 'true') {
      event.preventDefault();
    }
  }, []);

  return (
    <Dialog 
      open={open} 
      onOpenChange={handleOpenChange}
    >
      <DialogContent 
        className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto"
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={handleInteractOutside}
      >
        <DialogHeader>
          <DialogTitle>Genera Report PDF</DialogTitle>
          <DialogDescription>
            Seleziona l'azienda, il referente e il periodo per generare un report PDF dei servizi consuntivati.
          </DialogDescription>
        </DialogHeader>
        <ReportGeneratorForm onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
};
