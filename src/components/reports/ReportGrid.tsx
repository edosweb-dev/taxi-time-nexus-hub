
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useReports } from '@/hooks/useReports';
import { useAziende } from '@/hooks/useAziende';
import { ReportActions } from './ReportActions';
import { ReportPreview } from './ReportPreview';
import { Report, ReportFilters } from '@/lib/types/reports';
import { format } from 'date-fns';
import { FileText, Search, Filter, Calendar, Building2 } from 'lucide-react';

export function ReportGrid() {
  const [filters, setFilters] = useState<ReportFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { reports, isLoading } = useReports(filters);
  const { aziende } = useAziende();

  const filteredReports = reports.filter(report =>
    report.azienda?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.nome_file.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        return <Badge className="bg-green-500 hover:bg-green-600">Completato</Badge>;
      case 'in_generazione':
        return <Badge variant="secondary">In Generazione</Badge>;
      case 'errore':
        return <Badge variant="destructive">Errore</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtri e Ricerca
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca report..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select onValueChange={(value) => handleFilterChange('azienda_id', value)}>
                <SelectTrigger>
                  <Building2 className="h-4 w-4 mr-2" />
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

              <Input
                type="date"
                placeholder="Data inizio"
                onChange={(e) => handleFilterChange('data_inizio', e.target.value)}
              />

              <Input
                type="date"
                placeholder="Data fine"
                onChange={(e) => handleFilterChange('data_fine', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessun report trovato</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                {searchTerm || Object.values(filters).some(v => v) 
                  ? 'Prova a modificare i filtri di ricerca'
                  : 'Crea il tuo primo report utilizzando il tab "Nuovo Report"'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">
                        {report.azienda?.nome}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(report.created_at), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </div>
                    {getStatusBadge(report.stato)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Periodo:</span>
                      <span className="font-medium">
                        {format(new Date(report.data_inizio), 'dd/MM')} - {format(new Date(report.data_fine), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Servizi:</span>
                      <span className="font-medium">{report.numero_servizi}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Totale:</span>
                      <span className="font-bold text-primary">
                        €{report.totale_documento.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <ReportActions report={report} onPreview={handlePreview} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ReportPreview
        report={selectedReport}
        isOpen={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}
