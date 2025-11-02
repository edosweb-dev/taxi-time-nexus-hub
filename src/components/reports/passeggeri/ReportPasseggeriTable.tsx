import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { ReportPasseggeroRow } from '@/hooks/useReportPasseggeri';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface ReportPasseggeriTableProps {
  data: ReportPasseggeroRow[];
  isLoading: boolean;
}

export function ReportPasseggeriTable({ data, isLoading }: ReportPasseggeriTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            Nessun dato trovato per i filtri selezionati
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (date: string) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: it });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getStatoBadge = (stato: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      consuntivato: 'default',
      completato: 'secondary',
      in_corso: 'outline',
      da_assegnare: 'destructive',
    };

    return (
      <Badge variant={variants[stato] || 'outline'}>
        {stato.replace('_', ' ')}
      </Badge>
    );
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block">
        <Card>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead className="w-[120px]">Data</TableHead>
                    <TableHead>Passeggero</TableHead>
                    <TableHead>Percorso</TableHead>
                    <TableHead className="w-[120px] text-right">Importo</TableHead>
                    <TableHead className="w-[150px]">Consegna</TableHead>
                    <TableHead className="w-[100px]">Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, index) => (
                    <TableRow key={`${row.servizio_id}-${index}`}>
                      <TableCell className="font-mono text-sm">
                        {row.id_progressivo}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {formatDate(row.data_servizio)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {row.passeggero_nome}
                          </span>
                          {row.azienda_nome && (
                            <span className="text-xs text-muted-foreground">
                              {row.azienda_nome}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px] truncate text-sm">
                          {row.percorso}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        €{row.importo.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {row.metodo_pagamento === 'Contanti' ? (
                          row.consegnato_a_nome ? (
                            <Badge variant="default" className="bg-primary">
                              {row.consegnato_a_nome}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Non consegnato
                            </Badge>
                          )
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatoBadge(row.stato)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {data.map((row, index) => (
          <Card key={`${row.servizio_id}-${index}`}>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-mono text-sm font-semibold">{row.id_progressivo}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(row.data_servizio)} • {formatTime(row.orario_servizio)}
                  </p>
                </div>
                {getStatoBadge(row.stato)}
              </div>

              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground">Passeggero</p>
                  <p className="text-sm font-medium">{row.passeggero_nome}</p>
                  {row.azienda_nome && (
                    <p className="text-xs text-muted-foreground">{row.azienda_nome}</p>
                  )}
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Percorso</p>
                  <p className="text-sm break-words">{row.percorso}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Importo</p>
                  <p className="text-lg font-bold text-primary">
                    €{row.importo.toFixed(2)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-xs text-muted-foreground">Consegna</p>
                  {row.metodo_pagamento === 'Contanti' ? (
                    row.consegnato_a_nome ? (
                      <Badge variant="default" className="bg-primary">
                        {row.consegnato_a_nome}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Non consegnato
                      </Badge>
                    )
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-sm text-muted-foreground text-center py-4">
        Totale: {data.length} {data.length === 1 ? 'risultato' : 'risultati'}
      </div>
    </>
  );
}
