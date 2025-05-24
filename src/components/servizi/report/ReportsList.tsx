
import React, { useState, useCallback, useEffect } from 'react';
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
  
  // Stato per il dialogo di eliminazione - SEMPLIFICATO
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
  
  const handleDialogClose = useCallback(() => {
    setViewingReport(null);
  }, []);
  
  // Funzione per aprire il dialog di eliminazione
  const handleDeleteClick = useCallback((reportId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('[ReportsList] Setting report to delete:', reportId);
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  }, []);
  
  // Funzione per confermare l'eliminazione
  const handleConfirmDelete = useCallback(() => {
    if (reportToDelete) {
      console.log('[ReportsList] Confirming delete in ReportsList for report:', reportToDelete);
      deleteReport(reportToDelete);
      // Dialog rimane aperto fino al completamento dell'eliminazione
    }
  }, [reportToDelete, deleteReport]);

  // Funzione per gestire la chiusura del dialog - SEMPLIFICATA
  const handleDialogOpenChange = useCallback((open: boolean) => {
    console.log('[ReportsList] Dialog open state changing to:', open);
    
    // Se si sta eliminando, non permettere la chiusura
    if (isDeletingReport && !open) {
      console.log('[ReportsList] Blocking dialog close during deletion');
      return;
    }
    
    setIsDeleteDialogOpen(open);
    if (!open) {
      setReportToDelete(null);
    }
  }, [isDeletingReport]);

  // Funzione per gestire l'apertura del generatore
  const handleGeneratorOpenChange = useCallback((open: boolean) => {
    setIsGeneratorOpen(open);
  }, []);
  
  // Reset reportToDelete quando l'eliminazione è completata - SEMPLIFICATO
  useEffect(() => {
    if (!isDeletingReport && reportToDelete && isDeleteDialogOpen) {
      console.log('[ReportsList] Deletion completed, closing dialog and resetting state');
      setIsDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  }, [isDeletingReport, reportToDelete, isDeleteDialogOpen]);

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
        onOpenChange={(open) => !open && handleDialogClose()}
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
