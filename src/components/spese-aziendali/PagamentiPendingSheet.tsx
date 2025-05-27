
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';

interface PagamentiPendingSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PagamentiPendingSheet({ open, onOpenChange }: PagamentiPendingSheetProps) {
  const { movimenti, updateStatoPagamento } = useSpeseAziendali();

  const movimentiPending = movimenti.filter(m => m.stato_pagamento === 'pending');

  const handleTogglePagamento = async (id: string, currentStato: string) => {
    const nuovoStato = currentStato === 'pending' ? 'completato' : 'pending';
    await updateStatoPagamento.mutateAsync({ id, stato: nuovoStato });
  };

  const totalePending = movimentiPending.reduce((sum, movimento) => sum + Number(movimento.importo), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            Pagamenti in Sospeso
            <Badge variant="destructive">
              €{totalePending.toFixed(2)}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {movimentiPending.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Nessun pagamento in sospeso</p>
            </div>
          ) : (
            movimentiPending
              .sort((a, b) => new Date(a.data_movimento).getTime() - new Date(b.data_movimento).getTime())
              .map((movimento) => (
                <Card key={movimento.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="font-medium">{movimento.causale}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(movimento.data_movimento), 'dd/MM/yyyy')} • 
                          €{Number(movimento.importo).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {movimento.modalita_pagamento?.nome}
                        </div>
                      </div>
                      <Switch
                        checked={movimento.stato_pagamento === 'completato'}
                        onCheckedChange={() => handleTogglePagamento(movimento.id, movimento.stato_pagamento)}
                        disabled={updateStatoPagamento.isPending}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
