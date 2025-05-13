
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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Genera Report PDF</DialogTitle>
        </DialogHeader>
        <ReportGeneratorForm onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
