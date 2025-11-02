import React, { useState } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';

const MESI = [
  { value: 1, label: 'Gennaio' },
  { value: 2, label: 'Febbraio' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Aprile' },
  { value: 5, label: 'Maggio' },
  { value: 6, label: 'Giugno' },
  { value: 7, label: 'Luglio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Settembre' },
  { value: 10, label: 'Ottobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Dicembre' },
];

export function TabellaMovimentiPending() {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const { getPendingByMonth, updateStatoPagamento } = useSpeseAziendali();
  const { data: movimenti = [], isLoading } = getPendingByMonth(selectedYear, selectedMonth);

  const handleTogglePagamento = async (id: string, currentStato: string) => {
    const nuovoStato = currentStato === 'pending' ? 'completato' : 'pending';
    await updateStatoPagamento.mutateAsync({ id, stato: nuovoStato });
  };

  const totalePending = movimenti.reduce((sum, movimento) => sum + Number(movimento.importo), 0);

  const getTipologiaBadgeVariant = (tipologia: string) => {
    switch (tipologia) {
      case 'spesa':
        return 'destructive';
      case 'incasso':
        return 'default';
      case 'prelievo':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const years = [selectedYear - 1, selectedYear, selectedYear + 1];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Mese</label>
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MESI.map((mese) => (
                <SelectItem key={mese.value} value={mese.value.toString()}>
                  {mese.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">Anno</label>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabella Desktop / Cards Mobile */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Caricamento...</div>
        ) : movimenti.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-lg font-medium">✓ Nessun pagamento pending</div>
            <div className="text-sm mt-1">per questo mese</div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Causale</TableHead>
                    <TableHead>Tipologia</TableHead>
                    <TableHead className="text-right">Importo</TableHead>
                    <TableHead>Modalità Pagamento</TableHead>
                    <TableHead>Socio/Dipendente</TableHead>
                    <TableHead className="text-center">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimenti.map((movimento) => (
                    <TableRow key={movimento.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(movimento.data_movimento), 'dd/MM/yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{movimento.causale}</div>
                          {movimento.tipo_causale && movimento.tipo_causale !== 'generica' && (
                            <Badge variant="outline" className="text-xs">
                              {movimento.tipo_causale.replace(/_/g, ' ')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTipologiaBadgeVariant(movimento.tipologia)}>
                          {movimento.tipologia}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        €{Number(movimento.importo).toFixed(2)}
                      </TableCell>
                      <TableCell>{movimento.modalita_pagamento?.nome || '-'}</TableCell>
                      <TableCell>
                        {movimento.socio
                          ? `${movimento.socio.first_name} ${movimento.socio.last_name}`
                          : movimento.dipendente
                          ? `${movimento.dipendente.first_name} ${movimento.dipendente.last_name}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={movimento.stato_pagamento === 'completato'}
                          onCheckedChange={() =>
                            handleTogglePagamento(movimento.id, movimento.stato_pagamento)
                          }
                          disabled={updateStatoPagamento.isPending}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {movimenti.map((movimento) => (
                <Card key={movimento.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="font-medium">{movimento.causale}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(movimento.data_movimento), 'dd/MM/yyyy')}
                          </div>
                        </div>
                        <Switch
                          checked={movimento.stato_pagamento === 'completato'}
                          onCheckedChange={() =>
                            handleTogglePagamento(movimento.id, movimento.stato_pagamento)
                          }
                          disabled={updateStatoPagamento.isPending}
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={getTipologiaBadgeVariant(movimento.tipologia)}>
                          {movimento.tipologia}
                        </Badge>
                        <span className="text-lg font-medium">€{Number(movimento.importo).toFixed(2)}</span>
                      </div>

                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>📌 {movimento.modalita_pagamento?.nome || '-'}</div>
                        {(movimento.socio || movimento.dipendente) && (
                          <div>
                            👤{' '}
                            {movimento.socio
                              ? `${movimento.socio.first_name} ${movimento.socio.last_name}`
                              : `${movimento.dipendente?.first_name} ${movimento.dipendente?.last_name}`}
                          </div>
                        )}
                      </div>

                      {movimento.tipo_causale && movimento.tipo_causale !== 'generica' && (
                        <Badge variant="outline" className="text-xs">
                          {movimento.tipo_causale.replace(/_/g, ' ')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer con totale */}
      {movimenti.length > 0 && (
        <div className="border-t pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{movimenti.length} movimenti</Badge>
          </div>
          <div className="text-lg font-semibold">
            Totale: <span className="text-destructive">€{totalePending.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
