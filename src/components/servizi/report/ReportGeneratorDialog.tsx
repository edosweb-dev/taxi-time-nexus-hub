
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReportGeneratorForm } from './ReportGeneratorForm';
// Rimuovo l'importazione errata di PointerDownOutsideEvent

interface ReportGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportGeneratorDialog: React.FC<ReportGeneratorDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const handleCancel = () => {
    console.log('Dialog cancel called');
    onOpenChange(false);
  };

  // Corretto il tipo dell'evento utilizzando lo standard PointerEvent di React
  const handlePointerDownOutside = (e: React.MouseEvent | React.PointerEvent) => {
    // Prevent closing the dialog if form is being submitted
    const form = document.querySelector('form');
    if (form?.dataset.submitting === 'true') {
      console.log('Preventing dialog close during form submission');
      e.preventDefault();
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        // Only allow closing if we're not currently submitting
        const form = document.querySelector('form');
        if (form?.dataset.submitting === 'true' && !newOpen) {
          console.log('Blocking dialog close during submission');
          return;
        }
        onOpenChange(newOpen);
      }}
    >
      <DialogContent 
        className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto"
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={(e) => {
          const form = document.querySelector('form');
          if (form?.dataset.submitting === 'true') {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Genera Report PDF</DialogTitle>
        </DialogHeader>
        <ReportGeneratorForm onCancel={handleCancel} />
      </DialogContent>
    </Dialog>
  );
};
