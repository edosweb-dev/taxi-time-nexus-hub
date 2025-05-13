
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface Report {
  id: string;
  month: number;
  year: number;
  created_at: string;
  servizi_ids: string[];
}

interface ClientReportListProps {
  filteredReports: Report[];
  downloadReport: (id: string) => void;
}

export const ClientReportList: React.FC<ClientReportListProps> = ({
  filteredReports,
  downloadReport
}) => {
  return (
    <div className="space-y-4">
      {filteredReports.map((report) => (
        <div 
          key={report.id}
          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/30 transition-colors"
        >
          <div className="space-y-1 mb-3 sm:mb-0">
            <h3 className="font-medium">
              Report {format(new Date(report.year, report.month - 1), 'MMMM yyyy', { locale: it })}
            </h3>
            <p className="text-sm text-muted-foreground">
              Generato il: {format(new Date(report.created_at), 'dd/MM/yyyy')} | 
              Servizi: {report.servizi_ids.length}
            </p>
          </div>
          <Button 
            onClick={() => downloadReport(report.id)}
          >
            <DownloadIcon className="mr-2 h-4 w-4" />
            Scarica Report
          </Button>
        </div>
      ))}
    </div>
  );
};
