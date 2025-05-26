
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useReports } from '@/hooks/useReports';
import { Download, Eye, MoreHorizontal, Trash2 } from 'lucide-react';
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Apri menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onPreview(report)}>
          <Eye className="mr-2 h-4 w-4" />
          Anteprima
        </DropdownMenuItem>
        
        {report.url_file && (
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Scarica PDF
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Elimina
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
