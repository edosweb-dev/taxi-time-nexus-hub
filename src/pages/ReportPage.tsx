
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ReportGeneratorDialog } from '@/components/servizi/report/ReportGeneratorDialog';
import { useAuth } from '@/contexts/AuthContext';
import { ReportPageHeader, ReportContent } from '@/components/servizi/report/components';

export default function ReportPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const { profile } = useAuth();
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <ReportPageHeader 
          isAdminOrSocio={isAdminOrSocio}
          openGenerateDialog={() => setIsGenerateDialogOpen(true)}
        />

        <ReportContent />
        
        <ReportGeneratorDialog 
          open={isGenerateDialogOpen} 
          onOpenChange={setIsGenerateDialogOpen} 
        />
      </div>
    </MainLayout>
  );
}
