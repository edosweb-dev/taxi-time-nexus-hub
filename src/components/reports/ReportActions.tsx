
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useReports } from '@/hooks/useReports';
import { Report } from '@/lib/types/reports';
import { Download, Eye, MoreVertical, Trash2 } from 'lucide-react';

interface ReportActionsProps {
  report: Report;
  onPreview: (report: Report) => void;
}

export function ReportActions({ report, onPreview }: ReportActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { deleteReport, downloadReport, isDeleting } = useReports();

  const handleDelete = () => {
    deleteReport(report.id);
    setDeleteDialogOpen(false);
  };

  const canDownload = report.stato === 'completato' && report.url_file;
  const canPreview = report.stato === 'completato' && report.url_file;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canPreview && (
            <DropdownMenuItem onClick={() => onPreview(report)}>
              <Eye className="mr-2 h-4 w-4" />
              Anteprima
            </DropdownMenuItem>
          )}
          
          {canDownload && (
            <DropdownMenuItem onClick={() => downloadReport(report)}>
              <Download className="mr-2 h-4 w-4" />
              Scarica
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={() => setDeleteDialogOpen(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Elimina
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo report? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminazione...' : 'Elimina'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
