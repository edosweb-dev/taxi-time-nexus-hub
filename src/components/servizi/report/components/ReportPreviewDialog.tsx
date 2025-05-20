
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ReportPDF } from '../ReportPDF';

interface ReportPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentReport: any | null;
  reportServizi: any[];
  passeggeriCounts: Record<string, number>;
  aziende: any[];
  users: any[];
  getReferenteName: (id: string) => string;
}

export const ReportPreviewDialog: React.FC<ReportPreviewDialogProps> = ({
  open,
  onOpenChange,
  currentReport,
  reportServizi,
  passeggeriCounts,
  aziende,
  users,
  getReferenteName
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] max-h-[90vh]">
        {currentReport && (
          <ReportPDF
            servizi={reportServizi}
            passeggeriCounts={passeggeriCounts}
            azienda={aziende.find(a => a.id === currentReport.azienda_id) || null}
            referenteName={getReferenteName(currentReport.referente_id)}
            month={currentReport.month}
            year={currentReport.year}
            users={users}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
