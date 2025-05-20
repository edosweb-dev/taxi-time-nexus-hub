import React, { useState, useCallback } from 'react';
import { useReportsData } from '@/components/servizi/hooks/reports';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DownloadIcon, EyeIcon, Loader2, TrashIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ReportPDF } from './ReportPDF';
import { usePasseggeriCounts } from '@/components/servizi/hooks/usePasseggeriCounts';
import { useServizi } from '@/hooks/useServizi';
import { ReportGeneratorDialog } from './ReportGeneratorDialog';
import { DeleteReportDialog } from './components/DeleteReportDialog';
import { useAuth } from '@/contexts/AuthContext';

export const ReportsList = () => {
  const { reports, isLoading, downloadReport, deleteReport, isDeletingReport } = useReportsData();
  const { users } = useUsers();
  const { aziende } = useAziende();
  const { servizi } = useServizi();
  const { passeggeriCounts } = usePasseggeriCounts();
  const { profile } = useAuth();
  
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  
  // Stato per il dialogo di eliminazione
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Check if user is admin or socio
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Get the currently viewed report
  const currentReport = reports.find(r => r.id === viewingReport);
  
  // Get report servizi
  const reportServizi = currentReport 
    ? servizi.filter(s => currentReport.servizi_ids.includes(s.id))
    : [];
  
  // Get company and referente names
  const getCompanyName = (id: string) => {
    const azienda = aziende.find(a => a.id === id);
    return azienda?.nome || 'Azienda non trovata';
  };
  
  const getReferenteName = (id: string) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : 'Referente non trovato';
  };
  
  const getMonthName = (monthNum: number) => {
    return format(new Date(2022, monthNum - 1, 1), 'MMMM', { locale: it });
  };

  // Funzione memoizzata per aprire il dialog di eliminazione
  const handleDeleteClick = useCallback((reportId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('[ReportsList] Setting report to delete:', reportId);
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  }, []);
  
  // Funzione memoizzata per confermare l'eliminazione
  const handleConfirmDelete = useCallback(() => {
    if (reportToDelete) {
      console.log('[ReportsList] Confirming delete in ReportsList for report:', reportToDelete);
      deleteReport(reportToDelete);
      // Dialog rimane aperto fino al completamento dell'eliminazione
    }
  }, [reportToDelete, deleteReport]);

  // Funzione memoizzata per gestire la chiusura del dialog
  const handleDialogOpenChange = useCallback((open: boolean) => {
    console.log('[ReportsList] Dialog open state changing to:', open);
    
    // Se il dialogo viene chiuso e non si sta eliminando un report, resettiamo reportToDelete
    if (!open && !isDeletingReport) {
      setIsDeleteDialogOpen(open);
      // Non resettare reportToDelete qui per evitare un aggiornamento di stato durante il render
    } else if (open) {
      // Se stiamo aprendo il dialogo
      setIsDeleteDialogOpen(open);
    }
  }, [isDeletingReport]);

  // Funzione memoizzata per gestire l'apertura del generatore
  const handleGeneratorOpenChange = useCallback((open: boolean) => {
    setIsGeneratorOpen(open);
  }, []);
  
  // Reset reportToDelete after deletion completes
  useEffect(() => {
    // Quando l'operazione di eliminazione è completata (isDeletingReport passa da true a false),
    // chiudiamo il dialog e resettiamo lo stato
    if (!isDeletingReport && reportToDelete && isDeleteDialogOpen) {
      console.log('[ReportsList] Deletion completed, closing dialog and resetting reportToDelete');
      setIsDeleteDialogOpen(false);
      // Utilizziamo setTimeout per evitare problemi di aggiornamento dello stato
      setTimeout(() => {
        console.log('[ReportsList] Resetting reportToDelete to null');
        setReportToDelete(null);
      }, 50);
    }
  }, [isDeletingReport, reportToDelete, isDeleteDialogOpen]);

  // Funzione memoizzata per aprire il dialogo di report generator
  const openGeneratorDialog = useCallback(() => {
    setIsGeneratorOpen(true);
  }, []);
  
  return (
    <>
      {reports.length === 0 ? (
        <div className="text-center py-12 border rounded-md bg-muted/30">
          <h3 className="text-lg font-medium">Nessun report generato</h3>
          <p className="text-muted-foreground mt-1">
            I report generati appariranno qui. Usa il pulsante "Genera Report" per crearne uno.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/30 transition-colors"
            >
              <div className="space-y-1 mb-3 sm:mb-0 flex-grow">
                <h3 className="font-medium">
                  {getCompanyName(report.azienda_id)} - {getMonthName(report.month)} {report.year}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Referente: {getReferenteName(report.referente_id)} | 
                  Generato il: {format(new Date(report.created_at), 'dd/MM/yyyy')} | 
                  Servizi: {report.servizi_ids.length}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="icon"
                  title="Visualizza"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingReport(report.id);
                  }}
                >
                  <EyeIcon className="h-4 w-4" /> 
                </Button>
                <Button 
                  variant="default" 
                  size="icon"
                  title="Scarica"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadReport(report.id);
                  }}
                >
                  <DownloadIcon className="h-4 w-4" /> 
                </Button>
                
                {isAdminOrSocio && (
                  <Button 
                    variant="destructive" 
                    size="icon"
                    title="Elimina"
                    onClick={(e) => handleDeleteClick(report.id, e)}
                  >
                    <TrashIcon className="h-4 w-4" /> 
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* PDF Preview Dialog */}
      <Dialog open={!!viewingReport} onOpenChange={(open) => !open && setViewingReport(null)}>
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
      
      {/* Report Generator Dialog */}
      <ReportGeneratorDialog 
        open={isGeneratorOpen} 
        onOpenChange={handleGeneratorOpenChange} 
      />
      
      {/* Delete Confirmation Dialog */}
      <DeleteReportDialog 
        open={isDeleteDialogOpen}
        onOpenChange={handleDialogOpenChange}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingReport}
      />
    </>
  );
};
