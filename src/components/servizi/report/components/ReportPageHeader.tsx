
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

interface ReportPageHeaderProps {
  isAdminOrSocio: boolean;
  openGenerateDialog: () => void;
}

export const ReportPageHeader: React.FC<ReportPageHeaderProps> = ({ 
  isAdminOrSocio, 
  openGenerateDialog 
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Report Aziende</h1>
        <p className="text-muted-foreground">
          Gestisci i report mensili dei servizi consuntivati per azienda e referente
        </p>
      </div>
      <div className="flex gap-2">
        {isAdminOrSocio && (
          <Button onClick={openGenerateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Genera Report
          </Button>
        )}
      </div>
    </div>
  );
};
