
import React, { memo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { DownloadIcon, EyeIcon, TrashIcon } from 'lucide-react';

interface ReportItemProps {
  report: {
    id: string;
    azienda_id: string;
    month: number;
    year: number;
    created_at: string;
    servizi_ids: string[];
    referente_id: string;
  };
  getCompanyName: (id: string) => string;
  getReferenteName: (id: string) => string;
  onView: (reportId: string) => void;
  onDownload: (reportId: string) => void;
  onDelete?: (reportId: string, event: React.MouseEvent) => void;
  isAdminOrSocio: boolean;
}

export const ReportItem = memo(({
  report,
  getCompanyName,
  getReferenteName,
  onView,
  onDownload,
  onDelete,
  isAdminOrSocio
}: ReportItemProps) => {
  
  const getMonthName = (monthNum: number) => {
    return format(new Date(2022, monthNum - 1, 1), 'MMMM', { locale: it });
  };

  return (
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
          onClick={() => onView(report.id)}
        >
          <EyeIcon className="h-4 w-4" /> 
        </Button>
        <Button 
          variant="default" 
          size="icon"
          title="Scarica"
          onClick={() => onDownload(report.id)}
        >
          <DownloadIcon className="h-4 w-4" /> 
        </Button>
        
        {isAdminOrSocio && onDelete && (
          <Button 
            variant="destructive" 
            size="icon"
            title="Elimina"
            onClick={(e) => onDelete(report.id, e)}
          >
            <TrashIcon className="h-4 w-4" /> 
          </Button>
        )}
      </div>
    </div>
  );
});

ReportItem.displayName = 'ReportItem';
