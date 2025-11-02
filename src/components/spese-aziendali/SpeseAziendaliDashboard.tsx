
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, ArrowUpDown, AlertCircle, Coins } from 'lucide-react';
import { NuovoMovimentoSheet } from './NuovoMovimentoSheet';
import { IncassiDipendenteSheet } from './IncassiDipendenteSheet';
import { PagamentiPendingDialog } from './PagamentiPendingDialog';
import { TabellaSpeseMensili } from './TabellaSpeseMensili';
import { useSpeseAziendali } from '@/hooks/useSpeseAziendali';

export function SpeseAziendaliDashboard() {
  const navigate = useNavigate();
  const [nuovoMovimentoOpen, setNuovoMovimentoOpen] = useState(false);
  const [incassiDipendenteOpen, setIncassiDipendenteOpen] = useState(false);
  const [pagamentiPendingOpen, setPagamentiPendingOpen] = useState(false);
  const [tipoCausaleDefault, setTipoCausaleDefault] = useState<'generica' | 'f24' | 'pagamento_fornitori' | 'spese_gestione' | 'multe' | 'fattura_conducenti_esterni' | undefined>();
  
  const { pendingCount } = useSpeseAziendali();

  return (
    <div className="space-y-6">
      {/* Card principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            setTipoCausaleDefault('pagamento_fornitori');
            setNuovoMovimentoOpen(true);
          }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Pagamento Fornitori</h3>
                <p className="text-sm text-muted-foreground">Registra pagamento a fornitori</p>
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
                <h3 className="text-lg font-semibold">Converti Spese Dipendenti</h3>
                <p className="text-sm text-muted-foreground">Converti spese personali</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/spese-aziendali/incassi-contanti')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Coins className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Incassi Contanti</h3>
                <p className="text-sm text-muted-foreground">Servizi in contanti</p>
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
      
      <PagamentiPendingDialog 
        open={pagamentiPendingOpen} 
        onOpenChange={setPagamentiPendingOpen}
      />
    </div>
  );
}
