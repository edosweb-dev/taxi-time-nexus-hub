
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileBarChart, ArrowRightLeft } from 'lucide-react';
import { useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';
import { SpeseFilters as SpeseFiltersType } from '@/hooks/useSpeseDipendenti';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface SpeseAziendaliReportProps {
  filters: SpeseFiltersType;
}

export function SpeseAziendaliReport({ filters }: SpeseAziendaliReportProps) {
  const { spese, isLoading } = useSpeseDipendenti(filters);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: it });
  };

  const totaleSpese = spese.reduce((sum, spesa) => sum + Number(spesa.importo), 0);
  const numeroSpese = spese.length;

  const getDipendenteName = (spesa: any) => {
    if (spesa.profiles) {
      return `${spesa.profiles.first_name || ''} ${spesa.profiles.last_name || ''}`.trim();
    }
    return 'N/A';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistiche riassuntive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Totale Spese</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(totaleSpese)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Numero Spese</p>
              <p className="text-2xl font-bold">{numeroSpese}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Media per Spesa</p>
              <p className="text-2xl font-bold">
                {numeroSpese > 0 ? formatCurrency(totaleSpese / numeroSpese) : '€ 0,00'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabella report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" />
            Report Spese Dipendenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          {spese.length === 0 ? (
            <div className="text-center py-8">
              <FileBarChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nessuna spesa trovata
              </h3>
              <p className="text-sm text-muted-foreground">
                Modifica i filtri per visualizzare le spese dei dipendenti.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Importo</TableHead>
                    <TableHead>Causale</TableHead>
                    <TableHead>Dipendente</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spese.map((spesa) => (
                    <TableRow key={spesa.id}>
                      <TableCell>
                        {formatDate(spesa.created_at)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(Number(spesa.importo))}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={spesa.causale}>
                          {spesa.causale}
                        </div>
                      </TableCell>
                      <TableCell>{getDipendenteName(spesa)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={spesa.note || ''}>
                          {spesa.note || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={spesa.converted_to_spesa_aziendale ? "default" : "secondary"}
                        >
                          {spesa.converted_to_spesa_aziendale ? "Convertita" : "In attesa"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={spesa.converted_to_spesa_aziendale}
                          className="text-xs"
                        >
                          <ArrowRightLeft className="h-3 w-3 mr-1" />
                          Converti
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
