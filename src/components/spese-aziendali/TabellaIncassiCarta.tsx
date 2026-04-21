import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { useIncassiCarta } from '@/hooks/useIncassiCarta';
import { DatePickerField } from '@/components/ui/date-picker-field';
import { Badge } from '@/components/ui/badge';
import {
  Eye,
  Download,
  ArrowUpDown,
  Calendar,
  Banknote,
  FileText,
} from 'lucide-react';

const ITEMS_PER_PAGE = 20;

export function TabellaIncassiCarta() {
  const navigate = useNavigate();
  const oggi = new Date();

  const [dataInizio, setDataInizio] = useState<Date | undefined>(startOfMonth(oggi));
  const [dataFine, setDataFine] = useState<Date | undefined>(endOfMonth(oggi));

  const dataInizioStr = dataInizio ? format(dataInizio, 'yyyy-MM-dd') : '';
  const dataFineStr = dataFine ? format(dataFine, 'yyyy-MM-dd') : '';
  const [statoServizio, setStatoServizio] = useState<string>('tutti');

  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'data' | 'importo'>('data');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { incassi, isLoading, stats } = useIncassiCarta({
    dataInizio: dataInizioStr,
    dataFine: dataFineStr,
  });

  const datiProcessati = useMemo(() => {
    let filtered = incassi.filter((incasso) => {
      const matchStato = statoServizio === 'tutti' || incasso.stato === statoServizio;
      return matchStato;
    });

    filtered.sort((a, b) => {
      if (sortField === 'data') {
        const dateA = new Date(a.data_servizio).getTime();
        const dateB = new Date(b.data_servizio).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        const importoA = a.incasso_ricevuto || a.incasso_previsto || 0;
        const importoB = b.incasso_ricevuto || b.incasso_previsto || 0;
        return sortDirection === 'asc' ? importoA - importoB : importoB - importoA;
      }
    });

    return filtered;
  }, [incassi, statoServizio, sortField, sortDirection]);

  const totalPages = Math.ceil(datiProcessati.length / ITEMS_PER_PAGE);
  const datiPaginati = datiProcessati.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const toggleSort = (field: 'data' | 'importo') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const exportCSV = () => {
    const headers = [
      'Data',
      'ID Servizio',
      'Cliente',
      'Assegnato a',
      'Stato',
      'Importo (€)',
    ];

    const rows = datiProcessati.map((incasso) => [
      format(new Date(incasso.data_servizio), 'dd/MM/yyyy', { locale: it }),
      incasso.id_progressivo || '-',
      incasso.azienda_nome || incasso.cliente_privato_nome || '-',
      incasso.assegnato_a_nome || '-',
      incasso.stato,
      ((incasso.incasso_ricevuto ?? incasso.incasso_previsto) ?? 0).toFixed(2),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `incassi-carta-${format(oggi, 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiche */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Incassi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">€{stats.totaleIncassi.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Servizi con Carta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{stats.numeroServizi}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
          <CardDescription>Filtra i servizi con carta per periodo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>
                <Calendar className="h-4 w-4 inline mr-2" />
                Data Inizio
              </Label>
              <DatePickerField
                value={dataInizio}
                onChange={(date) => {
                  setDataInizio(date);
                  setCurrentPage(1);
                }}
                placeholder="Data inizio"
              />
            </div>

            <div className="space-y-2">
              <Label>
                <Calendar className="h-4 w-4 inline mr-2" />
                Data Fine
              </Label>
              <DatePickerField
                value={dataFine}
                onChange={(date) => {
                  setDataFine(date);
                  setCurrentPage(1);
                }}
                placeholder="Data fine"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="statoServizio">Stato Servizio</Label>
              <Select
                value={statoServizio}
                onValueChange={(val) => {
                  setStatoServizio(val);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger id="statoServizio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti</SelectItem>
                  <SelectItem value="completato">Completato</SelectItem>
                  <SelectItem value="consuntivato">Consuntivato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={exportCSV}
              disabled={datiProcessati.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Esporta CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabella */}
      <Card>
        <CardHeader>
          <CardTitle>Servizi con Carta ({datiProcessati.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {datiPaginati.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nessun servizio trovato con i filtri selezionati
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort('data')}
                          className="h-8 px-2"
                        >
                          Data
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead>ID Servizio</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Assegnato a</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort('importo')}
                          className="h-8 px-2"
                        >
                          Importo
                          <ArrowUpDown className="ml-2 h-3 w-3" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {datiPaginati.map((incasso) => (
                      <TableRow key={incasso.servizio_id}>
                        <TableCell className="font-medium">
                          {format(new Date(incasso.data_servizio), 'dd MMM yyyy', { locale: it })}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {incasso.id_progressivo || '-'}
                          </code>
                        </TableCell>
                        <TableCell>
                          {incasso.azienda_nome || incasso.cliente_privato_nome || '-'}
                        </TableCell>
                        <TableCell>{incasso.assegnato_a_nome || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{incasso.stato}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          €{((incasso.incasso_ricevuto ?? incasso.incasso_previsto) ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/servizi/${incasso.servizio_id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Paginazione */}
              {totalPages > 1 && (
                <div className="mt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>

                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, idx, arr) => (
                          <React.Fragment key={page}>
                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                              <PaginationItem>
                                <span className="px-4">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => setCurrentPage(page)}
                                isActive={currentPage === page}
                                className="cursor-pointer"
                              >
                                {page}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
