import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReportSocioRow } from '@/lib/types/report-soci';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TabellaDatiSociProps {
  data: ReportSocioRow[] | undefined;
  isLoading: boolean;
}

export function TabellaDatiSoci({ data, isLoading }: TabellaDatiSociProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getPercentageBadgeVariant = (percentage: number) => {
    if (percentage >= 30) return 'default';
    if (percentage >= 15) return 'secondary';
    return 'outline';
  };

  const getTotaleMeseClass = (value: number) => {
    if (value > 0) return 'bg-emerald-50 text-emerald-700';
    if (value < 0) return 'bg-red-50 text-red-700';
    return '';
  };

  const totals = data?.reduce(
    (acc, row) => ({
      riporto: acc.riporto + row.riporto,
      stipendio: acc.stipendio + row.stipendio,
      prelievi: acc.prelievi + row.prelievi,
      speseEffettuate: acc.speseEffettuate + row.speseEffettuate,
      versamenti: acc.versamenti + row.versamenti,
      incassiDaDipendenti: acc.incassiDaDipendenti + row.incassiDaDipendenti,
      incassiPersonali: acc.incassiPersonali + row.incassiPersonali,
      totaleMese: acc.totaleMese + row.totaleMese,
      incrementaleStipendi: acc.incrementaleStipendi + row.incrementaleStipendi,
    }),
    {
      riporto: 0,
      stipendio: 0,
      prelievi: 0,
      speseEffettuate: 0,
      versamenti: 0,
      incassiDaDipendenti: 0,
      incassiPersonali: 0,
      totaleMese: 0,
      incrementaleStipendi: 0,
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dati Soci</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dati Soci</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Nessun dato disponibile per il periodo selezionato
          </p>
        </CardContent>
      </Card>
    );
  }

  const stickyCol = "sticky left-0 z-10 bg-background";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dati Soci - Dettaglio Mensile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className={`min-w-[120px] p-2 px-3 ${stickyCol}`}>Socio</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3 hidden lg:table-cell">Riporto</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3">Stipendio</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3">Prelievi</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3">Spese</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3">Versam.</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3">Inc. Dip.</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3">Inc. Pers.</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3 font-bold">Tot. Mese</TableHead>
                <TableHead className="text-center min-w-[70px] p-2 px-3">Totale %</TableHead>
                <TableHead className="text-right min-w-[85px] p-2 px-3 hidden lg:table-cell">Increm.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.userId}>
                  <TableCell className={`font-medium p-2 px-3 ${stickyCol}`}>{row.fullName}</TableCell>
                  <TableCell className="text-right p-2 px-3 hidden lg:table-cell">{formatCurrency(row.riporto)}</TableCell>
                  <TableCell className="text-right p-2 px-3">{formatCurrency(row.stipendio)}</TableCell>
                  <TableCell className="text-right p-2 px-3">{formatCurrency(row.prelievi)}</TableCell>
                  <TableCell className="text-right p-2 px-3">{formatCurrency(row.speseEffettuate)}</TableCell>
                  <TableCell className="text-right p-2 px-3">{formatCurrency(row.versamenti)}</TableCell>
                  <TableCell className="text-right p-2 px-3">{formatCurrency(row.incassiDaDipendenti)}</TableCell>
                  <TableCell className="text-right p-2 px-3">{formatCurrency(row.incassiPersonali)}</TableCell>
                  <TableCell className={`text-right font-bold p-2 px-3 ${getTotaleMeseClass(row.totaleMese)}`}>
                    {formatCurrency(row.totaleMese)}
                  </TableCell>
                  <TableCell className="text-center p-2 px-3">
                    <Badge variant={getPercentageBadgeVariant(row.totalePercentuale)}>
                      {formatPercentage(row.totalePercentuale)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right p-2 px-3 hidden lg:table-cell">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <span className="cursor-help border-b border-dashed border-muted-foreground">
                            {formatCurrency(row.incrementaleStipendi)}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">Somma stipendi da Gennaio a mese corrente</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            {totals && (
              <TableFooter>
                <TableRow>
                  <TableCell className={`font-bold p-2 px-3 ${stickyCol}`}>TOTALI</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3 hidden lg:table-cell">{formatCurrency(totals.riporto)}</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3">{formatCurrency(totals.stipendio)}</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3">{formatCurrency(totals.prelievi)}</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3">{formatCurrency(totals.speseEffettuate)}</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3">{formatCurrency(totals.versamenti)}</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3">{formatCurrency(totals.incassiDaDipendenti)}</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3">{formatCurrency(totals.incassiPersonali)}</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3">{formatCurrency(totals.totaleMese)}</TableCell>
                  <TableCell className="text-center font-bold p-2 px-3">100%</TableCell>
                  <TableCell className="text-right font-bold p-2 px-3 hidden lg:table-cell">{formatCurrency(totals.incrementaleStipendi)}</TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
