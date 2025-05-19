
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ReportGeneratorForm } from './ReportGeneratorForm';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          // Prevent clicks outside from dismissing if form is being submitted
          if (document.querySelector('form')?.dataset.submitting === 'true') {
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
