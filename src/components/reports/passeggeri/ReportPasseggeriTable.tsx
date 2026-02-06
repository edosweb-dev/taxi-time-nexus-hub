import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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
import { Button } from '@/components/ui/button';
import { AlertCircle, Eye, Users } from 'lucide-react';

interface ReportPasseggeriTableProps {
  data: ReportPasseggeroRow[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
}

interface MonthGroup {
  monthKey: string;
  label: string;
  rows: ReportPasseggeroRow[];
  totaleImporto: number;
  totaleOre: number;
  totalePasseggeri: number;
}

export function ReportPasseggeriTable({ data, isLoading, hasActiveFilters = false }: ReportPasseggeriTableProps) {
  const navigate = useNavigate();

  // Group data by month when no specific filters are active
  const groupedByMonth = useMemo<MonthGroup[] | null>(() => {
    if (hasActiveFilters || data.length === 0) return null;
    
    const groups: Record<string, ReportPasseggeroRow[]> = {};
    
    data.forEach(row => {
      const monthKey = row.data_servizio.substring(0, 7); // "2026-01"
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(row);
    });
    
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([monthKey, rows]) => ({
        monthKey,
        label: format(new Date(monthKey + '-01'), 'MMMM yyyy', { locale: it }),
        rows,
        totaleImporto: rows.reduce((sum, r) => sum + (r.importo || 0), 0),
        totaleOre: rows.reduce((sum, r) => sum + (r.ore_fatturate || 0), 0),
        totalePasseggeri: rows.reduce((sum, r) => sum + (r.num_passeggeri || 0), 0),
      }));
  }, [data, hasActiveFilters]);

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

  // Calculate grand totals
  const grandTotals = {
    servizi: data.length,
    passeggeri: data.reduce((sum, s) => sum + (s.num_passeggeri || 0), 0),
    importo: data.reduce((sum, s) => sum + (s.importo || 0), 0),
    ore: data.reduce((sum, s) => sum + (s.ore_fatturate || 0), 0),
  };

  const renderRow = (row: ReportPasseggeroRow, index: number) => (
    <TableRow key={`${row.servizio_id}-${index}`}>
      <TableCell className="font-mono text-sm">
        {row.id_progressivo}
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium">
          {formatDate(row.data_servizio)}
        </span>
      </TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className="gap-1">
          <Users className="h-3 w-3" />
          {row.num_passeggeri}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="text-sm font-medium max-w-[200px] truncate" title={row.passeggeri_nomi}>
            {row.passeggeri_nomi}
          </span>
          {row.azienda_nome && (
            <span className="text-xs text-muted-foreground">
              {row.azienda_nome}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[250px] truncate text-sm" title={row.percorso}>
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
      <TableCell>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/servizi/${row.servizio_id}`)}
          title="Visualizza servizio"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );

  const renderMonthHeader = (group: MonthGroup) => (
    <TableRow key={`header-${group.monthKey}`} className="bg-muted/50 hover:bg-muted/50">
      <TableCell colSpan={9} className="font-semibold capitalize">
        {group.label}
        <span className="ml-4 text-muted-foreground font-normal">
          {group.rows.length} servizi • {group.totalePasseggeri} passeggeri • €{group.totaleImporto.toFixed(2)} • {group.totaleOre.toFixed(1)}h
        </span>
      </TableCell>
    </TableRow>
  );

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
                    <TableHead className="w-[100px]">Data</TableHead>
                    <TableHead className="w-[70px] text-center">N° Pass.</TableHead>
                    <TableHead>Passeggeri</TableHead>
                    <TableHead>Percorso</TableHead>
                    <TableHead className="w-[100px] text-right">Importo</TableHead>
                    <TableHead className="w-[130px]">Consegna</TableHead>
                    <TableHead className="w-[100px]">Stato</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedByMonth ? (
                    // Grouped by month (default view without filters)
                    groupedByMonth.map((group) => (
                      <>
                        {renderMonthHeader(group)}
                        {group.rows.map((row, index) => renderRow(row, index))}
                      </>
                    ))
                  ) : (
                    // Flat list (when filters are active)
                    data.map((row, index) => renderRow(row, index))
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell colSpan={2}>
                      Totale: {grandTotals.servizi} servizi
                    </TableCell>
                    <TableCell className="text-center">
                      {grandTotals.passeggeri}
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                    <TableCell className="text-right">
                      €{grandTotals.importo.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {grandTotals.ore.toFixed(1)}h
                    </TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {groupedByMonth ? (
          groupedByMonth.map((group) => (
            <div key={group.monthKey}>
              {/* Month Header Card */}
              <Card className="mb-2 bg-muted/50">
                <CardContent className="p-3">
                  <p className="font-semibold capitalize">{group.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {group.rows.length} servizi • €{group.totaleImporto.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              {/* Service Cards */}
              {group.rows.map((row, index) => (
                <Card key={`${row.servizio_id}-${index}`} className="mb-2">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm font-semibold">{row.id_progressivo}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(row.data_servizio)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatoBadge(row.stato)}
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => navigate(`/servizi/${row.servizio_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Users className="h-3 w-3" />
                          {row.num_passeggeri}
                        </Badge>
                        <span className="text-sm">{row.passeggeri_nomi}</span>
                      </div>
                      {row.azienda_nome && (
                        <p className="text-xs text-muted-foreground">{row.azienda_nome}</p>
                      )}
                      <p className="text-sm break-words">{row.percorso}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-lg font-bold text-primary">
                        €{row.importo.toFixed(2)}
                      </p>
                      {row.metodo_pagamento === 'Contanti' && (
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
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))
        ) : (
          data.map((row, index) => (
            <Card key={`${row.servizio_id}-${index}`}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm font-semibold">{row.id_progressivo}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(row.data_servizio)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatoBadge(row.stato)}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/servizi/${row.servizio_id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <Users className="h-3 w-3" />
                      {row.num_passeggeri}
                    </Badge>
                    <span className="text-sm">{row.passeggeri_nomi}</span>
                  </div>
                  {row.azienda_nome && (
                    <p className="text-xs text-muted-foreground">{row.azienda_nome}</p>
                  )}
                  <p className="text-sm break-words">{row.percorso}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-lg font-bold text-primary">
                    €{row.importo.toFixed(2)}
                  </p>
                  {row.metodo_pagamento === 'Contanti' && (
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
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden mt-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <span className="font-semibold">
              {grandTotals.servizi} servizi
            </span>
            <span className="text-sm text-muted-foreground ml-2">
              ({grandTotals.passeggeri} passeggeri)
            </span>
          </div>
          <div className="text-right">
            <p className="font-bold text-primary">
              €{grandTotals.importo.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              {grandTotals.ore.toFixed(1)}h attesa
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
