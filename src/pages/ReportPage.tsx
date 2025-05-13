
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ReportsList } from '@/components/servizi/report/ReportsList';
import { ReportGeneratorDialog } from '@/components/servizi/report/ReportGeneratorDialog';
import { useAuth } from '@/contexts/AuthContext';

export default function ReportPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const { profile } = useAuth();

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report Aziende</h1>
            <p className="text-muted-foreground">
              Gestisci i report mensili dei servizi consuntivati per azienda e referente
            </p>
          </div>
          {isAdminOrSocio && (
            <Button onClick={() => setIsGenerateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Genera Report
            </Button>
          )}
        </div>

        <ReportsList />
        
        <ReportGeneratorDialog 
          open={isGenerateDialogOpen} 
          onOpenChange={setIsGenerateDialogOpen} 
        />
      </div>
    </MainLayout>
  );
}
