
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useReports } from '@/hooks/useReports';
import { useAziende } from '@/hooks/useAziende';
import { ReportActions } from './ReportActions';
import { ReportPreview } from './ReportPreview';
import { Filter, FileText } from 'lucide-react';
import { Report, ReportFilters } from '@/lib/types/reports';
import { format } from 'date-fns';

export function ReportList() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { reports, isLoading } = useReports(filters);
  const { aziende } = useAziende();

  const handleFilterChange = (key: keyof ReportFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handlePreview = (report: Report) => {
    setSelectedReport(report);
    setPreviewOpen(true);
  };

  const getStatusBadge = (stato: string) => {
    switch (stato) {
      case 'completato':
        return <Badge variant="default" className="bg-green-500">Completato</Badge>;
      case 'in_generazione':
        return <Badge variant="secondary">In Generazione</Badge>;
      case 'errore':
        return <Badge variant="destructive">Errore</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  const getTipoReportLabel = (tipo: string) => {
    switch (tipo) {
      case 'servizi':
        return 'Report Servizi';
      case 'finanziario':
        return 'Report Finanziario';
      case 'veicoli':
        return 'Report Veicoli';
      default:
        return tipo;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Elenco Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtri */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Azienda</label>
              <Select onValueChange={(value) => handleFilterChange('azienda_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutte le aziende" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le aziende</SelectItem>
                  {aziende.filter(azienda => azienda.id && azienda.id.trim() !== '').map((azienda) => (
                    <SelectItem key={azienda.id} value={azienda.id}>
                      {azienda.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo Report</label>
              <Select onValueChange={(value) => handleFilterChange('tipo_report', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tutti i tipi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="servizi">Report Servizi</SelectItem>
                  <SelectItem value="finanziario">Report Finanziario</SelectItem>
                  <SelectItem value="veicoli">Report Veicoli</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Inizio</label>
              <Input
                type="date"
                onChange={(e) => handleFilterChange('data_inizio', e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Data Fine</label>
              <Input
                type="date"
                onChange={(e) => handleFilterChange('data_fine', e.target.value)}
              />
            </div>
          </div>

          {/* Tabella Report */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Creazione</TableHead>
                  <TableHead>Azienda</TableHead>
                  <TableHead>Tipo Report</TableHead>
                  <TableHead>Periodo</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Caricamento report...
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 mb-2" />
                        <p>Nessun report trovato</p>
                        <p className="text-sm">Crea il tuo primo report usando il form a sinistra</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{report.azienda?.nome}</TableCell>
                      <TableCell>{getTipoReportLabel(report.tipo_report)}</TableCell>
                      <TableCell>
                        {format(new Date(report.data_inizio), 'dd/MM/yyyy')} - {' '}
                        {format(new Date(report.data_fine), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.stato)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {report.nome_file}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <ReportActions report={report} onPreview={handlePreview} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ReportPreview
        report={selectedReport}
        isOpen={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}
