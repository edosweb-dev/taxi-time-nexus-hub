
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';

export function TabellaSpeseMensili() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const { movimentiCompleti, isLoadingCompleti } = useSpeseAziendali();

  const startDate = startOfMonth(selectedMonth);
  const endDate = endOfMonth(selectedMonth);

  // Filtra movimenti per il mese selezionato
  const movimentiMese = movimentiCompleti.filter(movimento => {
    const dataMovimento = new Date(movimento.data);
    return dataMovimento >= startDate && dataMovimento <= endDate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: it });
  };

  const getTipologiaIcon = (tipologia: string) => {
    switch (tipologia) {
      case 'spesa':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'incasso':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'prelievo':
        return <Minus className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getTipologiaBadge = (tipologia: string) => {
    const variants = {
      spesa: 'destructive',
      incasso: 'default',
      prelievo: 'secondary'
    } as const;

    return (
      <Badge variant={variants[tipologia as keyof typeof variants] || 'outline'} className="flex items-center gap-1">
        {getTipologiaIcon(tipologia)}
        {tipologia.charAt(0).toUpperCase() + tipologia.slice(1)}
      </Badge>
    );
  };

  const getStatoBadge = (stato: string) => {
    return (
      <Badge variant={stato === 'completato' ? 'default' : 'destructive'}>
        {stato === 'completato' ? 'Completato' : 'Pending'}
      </Badge>
    );
  };

  const totaliMese = movimentiMese
    .filter(m => m.tipo === 'aziendale') // Escludi pending dai totali
    .reduce(
      (acc, movimento) => {
        switch (movimento.tipologia) {
          case 'spesa':
            acc.spese += Number(movimento.importo);
            break;
          case 'incasso':
            acc.incassi += Number(movimento.importo);
            break;
          case 'prelievo':
            acc.prelievi += Number(movimento.importo);
            break;
        }
        return acc;
      },
      { spese: 0, incassi: 0, prelievi: 0 }
    );

  const totalePending = movimentiMese
    .filter(m => m.tipo === 'pending')
    .reduce((sum, m) => sum + Number(m.importo), 0);

  const saldo = totaliMese.incassi - totaliMese.spese - totaliMese.prelievi;

  const previousMonth = () => {
    setSelectedMonth(subMonths(selectedMonth, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(addMonths(selectedMonth, 1));
  };

  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  if (isLoadingCompleti) {
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Movimenti per mese</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-lg font-semibold min-w-[140px] text-center">
              {format(selectedMonth, 'MMMM yyyy', { locale: it })}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={nextMonth}
              disabled={isCurrentMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Statistiche del mese */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Spese</p>
            <p className="text-lg font-bold text-red-600">{formatCurrency(totaliMese.spese)}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Incassi</p>
            <p className="text-lg font-bold text-green-600">{formatCurrency(totaliMese.incassi)}</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Prelievi</p>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(totaliMese.prelievi)}</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Pending Dipendenti</p>
            <p className="text-lg font-bold text-yellow-600">{formatCurrency(totalePending)}</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className={`text-lg font-bold ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(saldo)}
            </p>
          </div>
        </div>

        {/* Tabella movimenti */}
        {movimentiMese.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nessun movimento registrato per {format(selectedMonth, 'MMMM yyyy', { locale: it })}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Tipologia</TableHead>
                  <TableHead>Causale</TableHead>
                  <TableHead>Modalità</TableHead>
                  <TableHead>Importo</TableHead>
                  <TableHead>Socio</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead>Note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimentiMese
                  .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                  .map((movimento) => (
                    <TableRow 
                      key={movimento.id}
                      className={movimento.tipo === 'pending' ? 'bg-yellow-50' : ''}
                    >
                      <TableCell className="font-medium">
                        {movimento.tipo === 'pending' && (
                          <Badge variant="outline" className="mb-1 bg-yellow-100 text-yellow-800 border-yellow-300">
                            ⏳ In Attesa Approvazione
                          </Badge>
                        )}
                        {formatDate(movimento.data)}
                      </TableCell>
                      <TableCell>
                        {movimento.tipo === 'aziendale' && getTipologiaBadge(movimento.tipologia)}
                        {movimento.tipo === 'pending' && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            📤 Spesa Dipendente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {/* Emoji per tipo causale */}
                        {movimento.tipo === 'aziendale' && movimento.tipo_causale === 'f24' && '📄 '}
                        {movimento.tipo === 'aziendale' && movimento.tipo_causale === 'stipendio' && '💰 '}
                        <div className="truncate" title={movimento.causale}>
                          {movimento.causale}
                        </div>
                        
                        {/* Sotto-info dipendente per stipendi */}
                        {movimento.tipo === 'aziendale' && movimento.dipendente && (
                          <div className="text-xs text-muted-foreground mt-1">
                            👤 {movimento.dipendente.first_name} {movimento.dipendente.last_name}
                          </div>
                        )}
                        
                        {/* Sotto-info per pending */}
                        {movimento.tipo === 'pending' && movimento.user_profile && (
                          <div className="text-xs text-muted-foreground mt-1">
                            👤 {movimento.user_profile.first_name} {movimento.user_profile.last_name}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {movimento.tipo === 'aziendale' 
                          ? movimento.modalita_pagamento?.nome || 'N/A'
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="font-semibold">
                        <span className={
                          movimento.tipo === 'pending' ? 'text-yellow-600' :
                          movimento.tipologia === 'spesa' ? 'text-red-600' :
                          movimento.tipologia === 'incasso' ? 'text-green-600' :
                          'text-blue-600'
                        }>
                          {movimento.tipo === 'pending' || movimento.tipologia === 'spesa' ? '-' : '+'}
                          {formatCurrency(Number(movimento.importo))}
                        </span>
                      </TableCell>
                      <TableCell>
                        {movimento.tipo === 'aziendale' && movimento.socio 
                          ? `${movimento.socio.first_name || ''} ${movimento.socio.last_name || ''}`.trim() || 'N/A'
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        {movimento.tipo === 'pending' 
                          ? <Badge variant="outline" className="bg-yellow-100">In Attesa</Badge>
                          : getStatoBadge(movimento.stato_pagamento)
                        }
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={movimento.note || ''}>
                          {movimento.note || '-'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
