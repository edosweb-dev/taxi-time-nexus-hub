
import { Button } from '@/components/ui/button';
import { useReports } from '@/hooks/useReports';
import { Download, Eye, Trash2 } from 'lucide-react';
import { Report } from '@/lib/types/reports';

interface ReportActionsProps {
  report: Report;
  onPreview: (report: Report) => void;
}

export function ReportActions({ report, onPreview }: ReportActionsProps) {
  const { deleteReport, downloadReport } = useReports();

  const handleDownload = () => {
    downloadReport(report);
  };

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare questo report?')) {
      deleteReport(report.id);
    }
  };

  return (
    <div className="flex gap-2 w-full">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => onPreview(report)}
        className="flex-1"
      >
        <Eye className="mr-2 h-4 w-4" />
        Anteprima
      </Button>
      
      {report.url_file && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDownload}
          className="flex-1"
        >
          <Download className="mr-2 h-4 w-4" />
          Scarica
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDelete}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
