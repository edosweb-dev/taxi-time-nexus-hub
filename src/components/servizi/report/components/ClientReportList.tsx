
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, TrashIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteReportDialog } from './DeleteReportDialog';

interface Report {
  id: string;
  month: number;
  year: number;
  created_at: string;
  servizi_ids: string[];
}

interface ClientReportListProps {
  filteredReports: Report[];
  downloadReport: (id: string) => void;
  deleteReport?: (id: string) => void;
  isDeletingReport?: boolean;
}

export const ClientReportList: React.FC<ClientReportListProps> = ({
  filteredReports,
  downloadReport,
  deleteReport,
  isDeletingReport = false
}) => {
  const { profile } = useAuth();
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  
  const handleDeleteClick = (reportId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    console.log('Setting report to delete:', reportId);
    setReportToDelete(reportId);
  };
  
  const handleConfirmDelete = () => {
    if (reportToDelete && deleteReport) {
      console.log('Confirming delete for report:', reportToDelete);
      deleteReport(reportToDelete);
      // The dialog will stay open during deletion
    }
  };

  // Close the dialog when deletion completes
  React.useEffect(() => {
    if (!isDeletingReport && reportToDelete) {
      console.log('Deletion completed, closing dialog');
      setReportToDelete(null);
    }
  }, [isDeletingReport]);

  return (
    <>
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div 
            key={report.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/30 transition-colors"
          >
            <div className="space-y-1 mb-3 sm:mb-0 flex-grow">
              <h3 className="font-medium">
                Report {format(new Date(report.year, report.month - 1), 'MMMM yyyy', { locale: it })}
              </h3>
              <p className="text-sm text-muted-foreground">
                Generato il: {format(new Date(report.created_at), 'dd/MM/yyyy')} | 
                Servizi: {report.servizi_ids.length}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                size="icon"
                title="Scarica Report"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadReport(report.id);
                }}
              >
                <DownloadIcon className="h-4 w-4" />
              </Button>
              
              {deleteReport && profile?.role === 'admin' && (
                <Button 
                  variant="destructive" 
                  size="icon"
                  title="Elimina Report"
                  onClick={(e) => handleDeleteClick(report.id, e)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteReport && (
        <DeleteReportDialog 
          open={!!reportToDelete} 
          onOpenChange={(open) => {
            console.log('Dialog open state changing to:', open);
            if (!open) setReportToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeletingReport}
        />
      )}
    </>
  );
};
