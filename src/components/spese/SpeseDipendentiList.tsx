
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Calendar, Clock } from 'lucide-react';
import { useSpeseDipendenti } from '@/hooks/useSpeseDipendenti';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
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
    const date = new Date(dateString);
    
    if (isToday(date)) return 'Oggi';
    if (isYesterday(date)) return 'Ieri';
    
    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff <= 7) return `${daysDiff} giorni fa`;
    
    return format(date, 'dd/MM/yyyy', { locale: it });
  };

  const getAmountBadgeColor = (amount: number) => {
    if (amount <= 20) return 'bg-green-100 text-green-800 border-green-200';
    if (amount <= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton per statistiche */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading skeleton per tabella */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-40 animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiche mese corrente */}
      {statsCurrentMonth && (
        <Card className="border-0 shadow-md bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Spese questo mese</p>
                  <p className="text-3xl font-bold text-primary">{formatCurrency(statsCurrentMonth.total)}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  <p className="text-sm font-medium">Numero spese</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{statsCurrentMonth.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista spese */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            Storico Spese
          </CardTitle>
        </CardHeader>
        <CardContent>
          {spese.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nessuna spesa registrata
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Non hai ancora registrato nessuna spesa. Utilizza il modulo qui accanto per aggiungere la tua prima spesa.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Importo</TableHead>
                    <TableHead className="font-semibold">Causale</TableHead>
                    <TableHead className="font-semibold">Note</TableHead>
                    <TableHead className="font-semibold">Stato</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {spese.map((spesa, index) => (
                    <TableRow 
                      key={spesa.id} 
                      className={`transition-colors hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                      }`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatDate(spesa.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`font-semibold ${getAmountBadgeColor(Number(spesa.importo))}`}
                        >
                          {formatCurrency(Number(spesa.importo))}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium text-foreground truncate" title={spesa.causale}>
                          {spesa.causale}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="text-muted-foreground truncate" title={spesa.note || ''}>
                          {spesa.note || (
                            <span className="italic text-gray-400">Nessuna nota</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={spesa.converted_to_spesa_aziendale ? "default" : "secondary"}
                          className={
                            spesa.converted_to_spesa_aziendale 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-blue-100 text-blue-800 border-blue-200"
                          }
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
