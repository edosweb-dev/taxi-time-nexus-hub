
import { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useReports } from '@/hooks/useReports';
import { useAziende } from '@/hooks/useAziende';
import { ReportActions } from './ReportActions';
import { ReportPreview } from './ReportPreview';
import { Report } from '@/lib/types/reports';
import { Loader2 } from 'lucide-react';

const getStateBadge = (stato: string) => {
  switch (stato) {
    case 'completato':
      return <Badge variant="default" className="bg-green-500">Completato</Badge>;
    case 'in_generazione':
      return <Badge variant="secondary" className="bg-blue-500 text-white">In generazione</Badge>;
    case 'errore':
      return <Badge variant="destructive">Errore</Badge>;
    default:
      return <Badge variant="outline">{stato}</Badge>;
  }
};

const getTipoReportLabel = (tipo: string) => {
  switch (tipo) {
    case 'servizi':
      return 'Servizi';
    case 'finanziario':
      return 'Finanziario';
    case 'veicoli':
      return 'Veicoli';
    default:
      return tipo;
  }
};

export function ReportList() {
  const [filters, setFilters] = useState({});
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const { reports, isLoading } = useReports(filters);
  const { aziende } = useAziende();

  const handlePreview = (report: Report) => {
    setSelectedReport(report);
    setPreviewOpen(true);
  };

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Caricamento report...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="azienda-filter">Azienda</Label>
            <Select onValueChange={(value) => updateFilter('azienda_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tutte le aziende" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutte le aziende</SelectItem>
                {aziende.map((azienda) => (
                  <SelectItem key={azienda.id} value={azienda.id}>
                    {azienda.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipo-filter">Tipo Report</Label>
            <Select onValueChange={(value) => updateFilter('tipo_report', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Tutti i tipi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tutti i tipi</SelectItem>
                <SelectItem value="servizi">Servizi</SelectItem>
                <SelectItem value="finanziario">Finanziario</SelectItem>
                <SelectItem value="veicoli">Veicoli</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data-inizio">Data Inizio</Label>
            <Input
              id="data-inizio"
              type="date"
              onChange={(e) => updateFilter('data_inizio', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="data-fine">Data Fine</Label>
            <Input
              id="data-fine"
              type="date"
              onChange={(e) => updateFilter('data_fine', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Report ({reports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Creazione</TableHead>
                <TableHead>Azienda</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Periodo</TableHead>
                <TableHead>Stato</TableHead>
                <TableHead>Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm', { locale: it })}
                  </TableCell>
                  <TableCell>{report.azienda?.nome || 'N/A'}</TableCell>
                  <TableCell>{getTipoReportLabel(report.tipo_report)}</TableCell>
                  <TableCell>
                    {format(new Date(report.data_inizio), 'dd/MM/yyyy', { locale: it })} - {' '}
                    {format(new Date(report.data_fine), 'dd/MM/yyyy', { locale: it })}
                  </TableCell>
                  <TableCell>{getStateBadge(report.stato)}</TableCell>
                  <TableCell>
                    <ReportActions
                      report={report}
                      onPreview={handlePreview}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nessun report trovato
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReportPreview
        report={selectedReport}
        isOpen={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
