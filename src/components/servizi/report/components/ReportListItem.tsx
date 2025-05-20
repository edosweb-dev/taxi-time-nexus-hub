
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon, TrashIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { toast } from '@/components/ui/use-toast';
import { Report } from '@/lib/types';

interface ReportListItemProps {
  report: Report;
  downloadReport: (id: string) => void;
  onDeleteClick?: (reportId: string, event: React.MouseEvent) => void;
  showDeleteButton: boolean;
}

export const ReportListItem: React.FC<ReportListItemProps> = ({
  report,
  downloadReport,
  onDeleteClick,
  showDeleteButton
}) => {
  // Helper function to get month name
  const getMonthName = (month: number) => {
    return format(new Date(2022, month - 1, 1), 'MMMM', { locale: it });
  };

  return (
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
        
        {showDeleteButton && onDeleteClick && (
          <Button 
            variant="destructive" 
            size="icon"
            title="Elimina Report"
            onClick={(e) => onDeleteClick(report.id, e)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
