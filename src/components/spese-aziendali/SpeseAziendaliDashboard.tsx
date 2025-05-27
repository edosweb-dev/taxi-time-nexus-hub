
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ArrowUpDown, AlertCircle } from 'lucide-react';
import { NuovoMovimentoSheet } from './NuovoMovimentoSheet';
import { IncassiDipendenteSheet } from './IncassiDipendenteSheet';
import { PagamentiPendingSheet } from './PagamentiPendingSheet';
import { ReportMensile } from './ReportMensile';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';

export function SpeseAziendaliDashboard() {
  const [nuovoMovimentoOpen, setNuovoMovimentoOpen] = useState(false);
  const [incassiDipendenteOpen, setIncassiDipendenteOpen] = useState(false);
  const [pagamentiPendingOpen, setPagamentiPendingOpen] = useState(false);
  
  const { pendingCount } = useSpeseAziendali();

  return (
    <div className="space-y-6">
      {/* Griglia dei pulsanti principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setNuovoMovimentoOpen(true)}>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Registra nuovo movimento</h3>
              <p className="text-sm text-muted-foreground">Aggiungi spese, incassi o prelievi</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow opacity-60">
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-400">Stipendio dipendente</h3>
              <Badge variant="outline" className="text-xs">Coming soon</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setIncassiDipendenteOpen(true)}>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ArrowUpDown className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Incassi da dipendente</h3>
              <p className="text-sm text-muted-foreground">Converti spese dipendenti</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer relative" onClick={() => setPagamentiPendingOpen(true)}>
          <CardContent className="flex items-center justify-center p-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center relative">
                <AlertCircle className="h-6 w-6 text-red-600" />
                {pendingCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </div>
              <h3 className="font-semibold">Pagamenti pending</h3>
              <p className="text-sm text-muted-foreground">
                {pendingCount > 0 ? `${pendingCount} in sospeso` : 'Nessun pagamento in sospeso'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report mensile */}
      <ReportMensile />

      {/* Sheets */}
      <NuovoMovimentoSheet 
        open={nuovoMovimentoOpen} 
        onOpenChange={setNuovoMovimentoOpen} 
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
