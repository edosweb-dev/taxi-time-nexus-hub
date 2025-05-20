import React, { useState, useEffect, useCallback } from 'react';
import { ReportListItem } from './ReportListItem';
import { DeleteReportDialog } from './DeleteReportDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Report } from '@/lib/types/index';

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
  
  // Handler for the click on delete button
  const handleDeleteClick = useCallback((reportId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log('[ClientReportList] Setting report to delete:', reportId);
    setReportToDelete(reportId);
    setIsDeleteDialogOpen(true);
  }, []);
  
  // Handler for confirming deletion
  const handleConfirmDelete = useCallback(() => {
    if (reportToDelete && deleteReport) {
      console.log('[ClientReportList] Confirming delete for report:', reportToDelete);
      console.log('[ClientReportList] invoking deleteReport');
      deleteReport(reportToDelete);
      // The dialog will stay open during deletion
    }
  }, [reportToDelete, deleteReport]);

  // Handler for dialog open state changes
  const handleOpenChange = useCallback((open: boolean) => {
    console.log('[ClientReportList] Dialog open state changing to:', open);
    
    // If we're closing the dialog but deletion is in progress, do nothing
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
      
      // Use setTimeout to avoid state update issues
      setTimeout(() => {
        console.log('[ClientReportList] Resetting reportToDelete to null');
        setReportToDelete(null);
      }, 50);
    }
  }, [isDeletingReport, reportToDelete, isDeleteDialogOpen]);

  const showDeleteButton = profile?.role === 'admin' && !!deleteReport;

  return (
    <>
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <ReportListItem
            key={report.id}
            report={report}
            downloadReport={downloadReport}
            onDeleteClick={handleDeleteClick}
            showDeleteButton={showDeleteButton}
          />
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
