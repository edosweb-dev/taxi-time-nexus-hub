
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ArrowUpDown, AlertCircle } from 'lucide-react';
import { NuovoMovimentoSheet } from './NuovoMovimentoSheet';
import { IncassiDipendenteSheet } from './IncassiDipendenteSheet';
import { PagamentiPendingSheet } from './PagamentiPendingSheet';
import { TabellaSpeseMensili } from './TabellaSpeseMensili';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';

export function SpeseAziendaliDashboard() {
  const [nuovoMovimentoOpen, setNuovoMovimentoOpen] = useState(false);
  const [incassiDipendenteOpen, setIncassiDipendenteOpen] = useState(false);
  const [pagamentiPendingOpen, setPagamentiPendingOpen] = useState(false);
  const [tipoCausaleDefault, setTipoCausaleDefault] = useState<'generica' | 'f24' | 'stipendio' | undefined>();
  
  const { pendingCount } = useSpeseAziendali();

  return (
    <div className="space-y-6">
      {/* Card principali - Griglia 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setNuovoMovimentoOpen(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Registra nuovo movimento</h3>
                <p className="text-sm text-muted-foreground">Aggiungi spesa, incasso o prelievo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="hover:shadow-md transition-shadow cursor-pointer" 
          onClick={() => {
            setTipoCausaleDefault('stipendio');
            setNuovoMovimentoOpen(true);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Registra Stipendio</h3>
                <p className="text-sm text-muted-foreground">Pagamento dipendente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setIncassiDipendenteOpen(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <ArrowUpDown className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Incassi da dipendente</h3>
                <p className="text-sm text-muted-foreground">Converti spese dipendenti</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setPagamentiPendingOpen(true)}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-red-100 rounded-full relative">
                <AlertCircle className="h-8 w-8 text-red-600" />
                {pendingCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-600 text-white min-w-[20px] h-5 text-xs flex items-center justify-center">
                    {pendingCount}
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pagamenti pending</h3>
                <p className="text-sm text-muted-foreground">
                  {pendingCount > 0 ? `${pendingCount} pagamenti in sospeso` : 'Nessun pagamento in sospeso'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabella spese mensili */}
      <TabellaSpeseMensili />

      {/* Sheets */}
      <NuovoMovimentoSheet 
        open={nuovoMovimentoOpen} 
        onOpenChange={(open) => {
          setNuovoMovimentoOpen(open);
          if (!open) setTipoCausaleDefault(undefined);
        }}
        defaultTipoCausale={tipoCausaleDefault}
      />
      
      <IncassiDipendenteSheet 
        open={incassiDipendenteOpen} 
        onOpenChange={setIncassiDipendenteOpen} 
      />
      
      <PagamentiPendingSheet 
        open={pagamentiPendingOpen} 
        onOpenChange={setPagamentiPendingOpen} 
      />
    </div>
  );
}
