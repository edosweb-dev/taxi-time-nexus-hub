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
import { Input } from '@/components/ui/input';
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
import { useIncassiContanti } from '@/hooks/useIncassiContanti';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Download, 
  AlertCircle,
  ArrowUpDown,
  Calendar,
  User,
  Banknote,
  FileText
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ITEMS_PER_PAGE = 20;

export function TabellaIncassiContanti() {
  const navigate = useNavigate();
  const oggi = new Date();
  
  // Filtri
  const [dataInizio, setDataInizio] = useState(
    format(startOfMonth(oggi), 'yyyy-MM-dd')
  );
  const [dataFine, setDataFine] = useState(
    format(endOfMonth(oggi), 'yyyy-MM-dd')
  );
  const [consegnatoA, setConsegnatoA] = useState<string>('tutti');
  const [statoServizio, setStatoServizio] = useState<string>('tutti');
  
  // Paginazione e ordinamento
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<'data' | 'importo'>('data');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { incassi, isLoading, uniqueSoci, stats } = useIncassiContanti({
    dataInizio,
    dataFine,
  });

  // Filtra e ordina dati
  const datiProcessati = useMemo(() => {
    let filtered = incassi.filter((incasso) => {
      const matchConsegnato = consegnatoA === 'tutti' || 
        incasso.consegnato_a_id === consegnatoA;
      const matchStato = statoServizio === 'tutti' || 
        incasso.stato === statoServizio;
      return matchConsegnato && matchStato;
    });

    // Ordinamento
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
  }, [incassi, consegnatoA, statoServizio, sortField, sortDirection]);

  // Paginazione
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
      'Consegnato a',
      'Stato'
    ];
    
    const rows = datiProcessati.map(incasso => [
      format(new Date(incasso.data_servizio), 'dd/MM/yyyy', { locale: it }),
      incasso.id_progressivo || '-',
      incasso.azienda_nome || incasso.cliente_privato_nome || '-',
      incasso.assegnato_a_nome || '-',
      incasso.consegnato_a_nome || 'NON CONSEGNATO',
      incasso.stato
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `incassi-contanti-${format(oggi, 'yyyy-MM-dd')}.csv`;
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

  const incassiMancanti = datiProcessati.filter(i => !i.consegnato_a_id);

  return (
    <div className="space-y-6">
      {/* Statistiche */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Totale Incassi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">
                €{stats.totaleIncassi.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Servizi in Contanti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{stats.numeroServizi}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Consegne Mancanti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <p className="text-2xl font-bold text-destructive">
                {incassiMancanti.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert consegne mancanti */}
      {incassiMancanti.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Ci sono {incassiMancanti.length} servizi completati in contanti senza 
            registrazione della consegna.
          </AlertDescription>
        </Alert>
      )}

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle>Filtri</CardTitle>
          <CardDescription>
            Filtra i servizi in contanti per periodo e destinatario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="dataInizio">
                <Calendar className="h-4 w-4 inline mr-2" />
                Data Inizio
              </Label>
              <Input
                id="dataInizio"
                type="date"
                value={dataInizio}
                onChange={(e) => {
                  setDataInizio(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFine">
                <Calendar className="h-4 w-4 inline mr-2" />
                Data Fine
              </Label>
              <Input
                id="dataFine"
                type="date"
                value={dataFine}
                onChange={(e) => {
                  setDataFine(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="consegnatoA">
                <User className="h-4 w-4 inline mr-2" />
                Consegnato a
              </Label>
              <Select value={consegnatoA} onValueChange={(val) => {
                setConsegnatoA(val);
                setCurrentPage(1);
              }}>
                <SelectTrigger id="consegnatoA">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutti">Tutti</SelectItem>
                  {uniqueSoci.map(socio => (
                    <SelectItem key={socio.id} value={socio.id}>
                      {socio.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statoServizio">Stato Servizio</Label>
              <Select value={statoServizio} onValueChange={(val) => {
                setStatoServizio(val);
                setCurrentPage(1);
              }}>
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
          <CardTitle>
            Servizi in Contanti ({datiProcessati.length})
          </CardTitle>
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
                      <TableHead className="font-semibold">Consegna</TableHead>
                      <TableHead>Stato</TableHead>
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
                          {incasso.consegnato_a_nome ? (
                            <Badge variant="default" className="bg-primary">
                              {incasso.consegnato_a_nome}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Non consegnato
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {incasso.stato}
                          </Badge>
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
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Mostra sempre prima, ultima, corrente e adiacenti
                          return page === 1 || 
                                 page === totalPages || 
                                 Math.abs(page - currentPage) <= 1;
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
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
