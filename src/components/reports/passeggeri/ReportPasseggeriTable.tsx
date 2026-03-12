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
import { Users } from 'lucide-react';

interface ReportPasseggeriFiltersState {
  dataInizio: string;
  dataFine: string;
  aziendaId: string;
  referenteId: string;
  dipendenteId: string;
  socioId: string;
  stato: string;
}

interface ReportPasseggeriTableProps {
  data: ReportPasseggeroRow[];
  isLoading: boolean;
  hasActiveFilters?: boolean;
  filters?: ReportPasseggeriFiltersState;
}

interface MonthGroup {
  monthKey: string;
  label: string;
  rows: ReportPasseggeroRow[];
  totaleImporto: number;
  totaleOre: number;
  totalePasseggeri: number;
}

/** Extract city from a route segment like "VIA MONTANARA 10, LECCO" → "LECCO" */
function extractCity(segment: string): string {
  const trimmed = segment.trim();
  const commaIdx = trimmed.lastIndexOf(',');
  if (commaIdx !== -1) {
    return trimmed.substring(commaIdx + 1).trim();
  }
  return trimmed;
}

/** Build a city-only route from the full percorso */
function buildCityRoute(percorso: string): string {
  const segments = percorso.split(' → ');
  if (segments.length === 0) return percorso;
  
  const firstCity = extractCity(segments[0]);
  const lastCity = extractCity(segments[segments.length - 1]);
  
  if (segments.length <= 2) {
    return `${firstCity} → ${lastCity}`;
  }
  
  // Include intermediate cities
  const intermediateCities = segments.slice(1, -1).map(extractCity);
  return [firstCity, ...intermediateCities, lastCity].join(' → ');
}

export function ReportPasseggeriTable({ data, isLoading, hasActiveFilters = false, filters }: ReportPasseggeriTableProps) {
  const navigate = useNavigate();

  const handleViewServizio = (servizioId: string) => {
    navigate(`/servizi/${servizioId}`, {
      state: {
        from: 'report-passeggeri',
        filters,
      }
    });
  };

  // Group data by month when no specific filters are active
  const groupedByMonth = useMemo<MonthGroup[] | null>(() => {
    if (hasActiveFilters || data.length === 0) return null;
    
    const groups: Record<string, ReportPasseggeroRow[]> = {};
    
    data.forEach(row => {
      const monthKey = row.data_servizio.substring(0, 7);
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
        totaleOre: rows.reduce((sum, r) => sum + (r.ore_sosta || 0), 0),
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
    ore: data.reduce((sum, s) => sum + (s.ore_sosta || 0), 0),
  };

  /** Split passenger names and render vertically */
  const renderPasseggeri = (nomi: string) => {
    const names = nomi.split(',').map(n => n.trim()).filter(Boolean);
    return (
      <div className="flex flex-col gap-0.5">
        {names.map((name, i) => (
          <span key={i} className="text-sm leading-tight">{name}</span>
        ))}
      </div>
    );
  };

  const renderRow = (row: ReportPasseggeroRow, index: number) => (
    <TableRow 
      key={`${row.servizio_id}-${index}`} 
      className="cursor-pointer hover:bg-muted/50"
      onClick={() => handleViewServizio(row.servizio_id)}
    >
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
          {renderPasseggeri(row.passeggeri_nomi)}
          {row.azienda_nome && (
            <span className="text-xs text-muted-foreground mt-1">
              {row.azienda_nome}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-[250px] text-sm" title={row.percorso}>
          {buildCityRoute(row.percorso)}
        </div>
      </TableCell>
      <TableCell className="text-right font-semibold">
        €{row.importo.toFixed(2)}
      </TableCell>
      <TableCell className="text-right">
        {row.ore_sosta > 0 ? `${row.ore_sosta.toFixed(1)}h` : '-'}
      </TableCell>
      <TableCell>
        {getStatoBadge(row.stato)}
      </TableCell>
    </TableRow>
  );

  const renderMonthHeader = (group: MonthGroup) => (
    <TableRow key={`header-${group.monthKey}`} className="bg-muted/50 hover:bg-muted/50">
      <TableCell colSpan={8} className="font-semibold capitalize">
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
                    <TableHead className="w-[120px]">ID</TableHead>
                    <TableHead className="w-[100px]">Data</TableHead>
                    <TableHead className="w-[70px] text-center">N° Pass.</TableHead>
                    <TableHead>Passeggeri</TableHead>
                    <TableHead>Percorso</TableHead>
                    <TableHead className="w-[100px] text-right">Importo</TableHead>
                    <TableHead className="w-[100px] text-right">Ore Fatturate</TableHead>
                    <TableHead className="w-[100px]">Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedByMonth ? (
                    groupedByMonth.map((group) => (
                      <>
                        {renderMonthHeader(group)}
                        {group.rows.map((row, index) => renderRow(row, index))}
                      </>
                    ))
                  ) : (
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
                    <TableCell className="text-right">
                      {grandTotals.ore.toFixed(1)}h
                    </TableCell>
                    <TableCell></TableCell>
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
              <Card className="mb-2 bg-muted/50">
                <CardContent className="p-3">
                  <p className="font-semibold capitalize">{group.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {group.rows.length} servizi • €{group.totaleImporto.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
              {group.rows.map((row, index) => (
                <Card 
                  key={`${row.servizio_id}-${index}`} 
                  className="mb-2 cursor-pointer hover:bg-muted/30"
                  onClick={() => handleViewServizio(row.servizio_id)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm font-semibold">{row.id_progressivo}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(row.data_servizio)}
                        </p>
                      </div>
                      {getStatoBadge(row.stato)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Badge variant="outline" className="gap-1 shrink-0">
                          <Users className="h-3 w-3" />
                          {row.num_passeggeri}
                        </Badge>
                        {renderPasseggeri(row.passeggeri_nomi)}
                      </div>
                      {row.azienda_nome && (
                        <p className="text-xs text-muted-foreground">{row.azienda_nome}</p>
                      )}
                      <p className="text-sm break-words">{buildCityRoute(row.percorso)}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-lg font-bold text-primary">
                        €{row.importo.toFixed(2)}
                      </p>
                      {row.ore_sosta > 0 && (
                        <span className="text-sm text-muted-foreground">{row.ore_sosta.toFixed(1)}h</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))
        ) : (
          data.map((row, index) => (
            <Card 
              key={`${row.servizio_id}-${index}`}
              className="cursor-pointer hover:bg-muted/30"
              onClick={() => handleViewServizio(row.servizio_id)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-mono text-sm font-semibold">{row.id_progressivo}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(row.data_servizio)}
                    </p>
                  </div>
                  {getStatoBadge(row.stato)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge variant="outline" className="gap-1 shrink-0">
                      <Users className="h-3 w-3" />
                      {row.num_passeggeri}
                    </Badge>
                    {renderPasseggeri(row.passeggeri_nomi)}
                  </div>
                  {row.azienda_nome && (
                    <p className="text-xs text-muted-foreground">{row.azienda_nome}</p>
                  )}
                  <p className="text-sm break-words">{buildCityRoute(row.percorso)}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <p className="text-lg font-bold text-primary">
                    €{row.importo.toFixed(2)}
                  </p>
                  {row.ore_sosta > 0 && (
                    <span className="text-sm text-muted-foreground">{row.ore_sosta.toFixed(1)}h</span>
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
              {grandTotals.ore.toFixed(1)}h fatturate
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
