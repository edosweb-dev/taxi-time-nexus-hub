
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useReports } from '@/hooks/useReports';
import { Report } from '@/lib/types/reports';
import { Download, FileText } from 'lucide-react';

interface ReportPreviewProps {
  report: Report | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportPreview({ report, isOpen, onOpenChange }: ReportPreviewProps) {
  const { downloadReport } = useReports();

  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Anteprima Report: {report.nome_file}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              <p>Azienda: {report.azienda?.nome}</p>
              <p>Periodo: {report.data_inizio} - {report.data_fine}</p>
              <p>Tipo: {report.tipo_report}</p>
            </div>
            
            {report.url_file && (
              <Button onClick={() => downloadReport(report)}>
                <Download className="mr-2 h-4 w-4" />
                Scarica PDF
              </Button>
            )}
          </div>

          <div className="border rounded-lg p-4 bg-muted/20 min-h-[400px] flex items-center justify-center">
            {report.url_file ? (
              <iframe
                src={report.url_file}
                className="w-full h-[500px] border-0"
                title="Anteprima Report PDF"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-2" />
                <p>File PDF non disponibile</p>
                <p className="text-sm">Il report potrebbe essere ancora in generazione</p>
              </div>
            )}
          </div>

          {report.errore_messaggio && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-medium">Errore nella generazione:</p>
              <p className="text-sm text-destructive/80">{report.errore_messaggio}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
