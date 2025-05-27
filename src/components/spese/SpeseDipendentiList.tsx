
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, Euro } from 'lucide-react';
import { useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export function SpeseDipendentiList() {
  const { spese, isLoading, statsCurrentMonth } = useSpeseDipendenti();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: it });
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
      {/* Statistiche mese corrente */}
      {statsCurrentMonth && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Spese questo mese</p>
                <p className="text-2xl font-bold">{formatCurrency(statsCurrentMonth.total)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Numero spese</p>
                <p className="text-2xl font-bold">{statsCurrentMonth.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista spese */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Storico Spese
          </CardTitle>
        </CardHeader>
        <CardContent>
          {spese.length === 0 ? (
            <div className="text-center py-8">
              <Euro className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nessuna spesa registrata
              </h3>
              <p className="text-sm text-muted-foreground">
                Utilizza il form sopra per inserire la tua prima spesa.
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
                    <TableHead>Note</TableHead>
                    <TableHead>Stato</TableHead>
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
                      <TableCell>{spesa.causale}</TableCell>
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
