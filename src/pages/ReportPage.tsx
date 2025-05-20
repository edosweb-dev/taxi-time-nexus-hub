
import React, { useState, useCallback } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ReportGeneratorDialog } from '@/components/servizi/report/ReportGeneratorDialog';
import { useAuth } from '@/contexts/AuthContext';
import { ReportPageHeader, ReportContent } from '@/components/servizi/report/components';

export default function ReportPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const { profile } = useAuth();
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Memoizziamo la funzione di set state per evitare recreazione ad ogni render
  const handleDialogOpenChange = useCallback((open: boolean) => {
    setIsGenerateDialogOpen(open);
  }, []);
  
  // Memoizziamo la funzione di apertura dialog
  const openGenerateDialog = useCallback(() => {
    setIsGenerateDialogOpen(true);
  }, []);
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <ReportPageHeader 
          isAdminOrSocio={isAdminOrSocio}
          openGenerateDialog={openGenerateDialog}
        />

        <ReportContent />
        
        <ReportGeneratorDialog 
          open={isGenerateDialogOpen} 
          onOpenChange={handleDialogOpenChange} 
        />
      </div>
    </MainLayout>
  );
}
