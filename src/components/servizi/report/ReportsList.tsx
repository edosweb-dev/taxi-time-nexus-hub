
import React, { useState, useCallback } from 'react';
import { useReportsData } from '@/components/servizi/hooks/reports';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';
import { useServizi } from '@/hooks/useServizi';
import { ReportGeneratorDialog } from './ReportGeneratorDialog';
import { DeleteReportDialog } from './components/DeleteReportDialog';
import { useAuth } from '@/contexts/AuthContext';
import { usePasseggeriCounts } from '@/components/servizi/hooks/usePasseggeriCounts';
import { ReportItem } from './components/ReportItem';
import { EmptyReportState } from './components/EmptyReportState';
import { ReportPreviewDialog } from './components/ReportPreviewDialog';

export const ReportsList = () => {
  const { reports, isLoading, downloadReport, deleteReport, isDeletingReport } = useReportsData();
  const { users } = useUsers();
  const { aziende } = useAziende();
  const { servizi } = useServizi();
  const { passeggeriCounts } = usePasseggeriCounts();
  const { profile } = useAuth();
  
  const [viewingReport, setViewingReport] = useState<string | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  
  // Check if user is admin or socio
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Get the currently viewed report
  const currentReport = reports.find(r => r.id === viewingReport);
  
  // Get report servizi
  const reportServizi = currentReport 
    ? servizi.filter(s => currentReport.servizi_ids.includes(s.id))
    : [];
  
  // Helper functions for company and referente names
  const getCompanyName = useCallback((id: string) => {
    const azienda = aziende.find(a => a.id === id);
    return azienda?.nome || 'Azienda non trovata';
  }, [aziende]);
  
  const getReferenteName = useCallback((id: string) => {
    const user = users.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : 'Referente non trovato';
  }, [users]);

  // Handlers for report actions
  const handleViewReport = useCallback((reportId: string) => {
    setViewingReport(reportId);
  }, []);
  
  const handleViewDialogClose = useCallback(() => {
    setViewingReport(null);
  }, []);
  
  // Handler per aprire il dialog di eliminazione - SEMPLIFICATO
  const handleDeleteClick = useCallback((reportId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('[ReportsList] Opening delete dialog for report:', reportId);
    setReportToDelete(reportId);
  }, []);
  
  // Handler per confermare l'eliminazione - SEMPLIFICATO
  const handleConfirmDelete = useCallback(() => {
    if (!reportToDelete) return;
    
    console.log('[ReportsList] Confirming delete for report:', reportToDelete);
    deleteReport(reportToDelete);
    
    // Chiudi il dialog immediatamente dopo aver avviato l'eliminazione
    setReportToDelete(null);
  }, [reportToDelete, deleteReport]);

  // Handler per chiudere il dialog di eliminazione
  const handleDeleteDialogClose = useCallback(() => {
    console.log('[ReportsList] Closing delete dialog');
    setReportToDelete(null);
  }, []);

  // Handler per gestire l'apertura del generatore
  const handleGeneratorOpenChange = useCallback((open: boolean) => {
    setIsGeneratorOpen(open);
  }, []);
  
  // Funzione per aprire il dialogo di report generator
  const openGeneratorDialog = useCallback(() => {
    setIsGeneratorOpen(true);
  }, []);
  
  return (
    <>
      {reports.length === 0 ? (
        <EmptyReportState />
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <ReportItem 
              key={report.id}
              report={report}
              getCompanyName={getCompanyName}
              getReferenteName={getReferenteName}
              onView={handleViewReport}
              onDownload={downloadReport}
              onDelete={isAdminOrSocio ? handleDeleteClick : undefined}
              isAdminOrSocio={isAdminOrSocio}
            />
          ))}
        </div>
      )}
      
      {/* PDF Preview Dialog */}
      <ReportPreviewDialog 
        open={!!viewingReport}
        onOpenChange={(open) => !open && handleViewDialogClose()}
        currentReport={currentReport}
        reportServizi={reportServizi}
        passeggeriCounts={passeggeriCounts}
        aziende={aziende}
        users={users}
        getReferenteName={getReferenteName}
      />
      
      {/* Report Generator Dialog */}
      <ReportGeneratorDialog 
        open={isGeneratorOpen} 
        onOpenChange={handleGeneratorOpenChange} 
      />
      
      {/* Delete Confirmation Dialog - SEMPLIFICATO */}
      <DeleteReportDialog 
        open={!!reportToDelete}
        onOpenChange={(open) => !open && handleDeleteDialogClose()}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeletingReport}
      />
    </>
  );
};
