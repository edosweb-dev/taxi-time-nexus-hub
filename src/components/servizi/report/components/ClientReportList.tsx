
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, TrashIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useAuth } from '@/contexts/AuthContext';
import { DeleteReportDialog } from './DeleteReportDialog';
import { toast } from '@/components/ui/use-toast';

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Handler memoizzato per il click sul pulsante elimina
  const handleDeleteClick = useCallback((reportId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('[ClientReportList] Setting report to delete:', reportId);
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  }, []);
  
  // Handler memoizzato per confermare l'eliminazione
  const handleConfirmDelete = useCallback(() => {
    if (reportToDelete && deleteReport) {
      console.log('[ClientReportList] Confirming delete for report:', reportToDelete);
      console.log('[ClientReportList] invoking deleteReport');
      deleteReport(reportToDelete);
      // The dialog will stay open during deletion
    }
  }, [reportToDelete, deleteReport]);

  // Handler memoizzato per la gestione dell'apertura del dialogo
  const handleOpenChange = useCallback((open: boolean) => {
    console.log('[ClientReportList] Dialog open state changing to:', open);
    
    // Se stiamo chiudendo il dialogo ma l'eliminazione è in corso, non fare nulla
    if (!open && isDeletingReport) {
      return;
    }
    
    setIsDeleteDialogOpen(open);
  }, [isDeletingReport]);

  // Close the dialog when deletion completes
  useEffect(() => {
    if (!isDeletingReport && reportToDelete && isDeleteDialogOpen) {
      console.log('[ClientReportList] Deletion completed, closing dialog');
      setIsDeleteDialogOpen(false);
      
      // Utilizziamo setTimeout per evitare problemi di aggiornamento dello stato
      setTimeout(() => {
        console.log('[ClientReportList] Resetting reportToDelete to null');
        setReportToDelete(null);
      }, 50);
    }
  }, [isDeletingReport, reportToDelete, isDeleteDialogOpen]);

  // Helper function to get month name
  const getMonthName = (month: number) => {
    return format(new Date(2022, month - 1, 1), 'MMMM', { locale: it });
  };

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
                Report {getMonthName(report.month)} {report.year}
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
                  toast({
                    title: "Download richiesto",
                    description: "Preparazione del report per il download..."
                  });
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
          open={isDeleteDialogOpen} 
          onOpenChange={handleOpenChange}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeletingReport}
        />
      )}
    </>
  );
};
