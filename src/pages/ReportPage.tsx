
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, FileText, BugIcon } from 'lucide-react';
import { ReportsList } from '@/components/servizi/report/ReportsList';
import { ReportGeneratorDialog } from '@/components/servizi/report/ReportGeneratorDialog';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { useDebugReporting } from '@/components/servizi/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAziende } from '@/hooks/useAziende';
import { useUsers } from '@/hooks/useUsers';

export default function ReportPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const { profile } = useAuth();
  const { debugInfo, checkServizi } = useDebugReporting();
  const { aziende } = useAziende();
  const { users } = useUsers();
  
  const [debugAziendaId, setDebugAziendaId] = useState<string>('');
  const [debugReferenteId, setDebugReferenteId] = useState<string>('');
  const [debugMonth, setDebugMonth] = useState<number>(new Date().getMonth() + 1);
  const [debugYear, setDebugYear] = useState<number>(new Date().getFullYear());
  const [debugReferenti, setDebugReferenti] = useState<any[]>([]);

  // When azienda changes, filter referenti
  useEffect(() => {
    if (debugAziendaId) {
      const filteredReferenti = users.filter(user => 
        user.role === 'cliente' && user.azienda_id === debugAziendaId
      );
      setDebugReferenti(filteredReferenti);
      setDebugReferenteId('');
    }
  }, [debugAziendaId, users]);

  const handleDebugCheck = () => {
    if (debugAziendaId && debugReferenteId && debugMonth && debugYear) {
      checkServizi(debugAziendaId, debugReferenteId, debugMonth, debugYear);
    }
  };

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report Aziende</h1>
            <p className="text-muted-foreground">
              Gestisci i report mensili dei servizi consuntivati per azienda e referente
            </p>
          </div>
          <div className="flex gap-2">
            {isAdminOrSocio && (
              <>
                {process.env.NODE_ENV === 'development' && (
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDebugMode(!isDebugMode)}
                  >
                    <BugIcon className="mr-2 h-4 w-4" />
                    {isDebugMode ? 'Nascondi Debug' : 'Debug Mode'}
                  </Button>
                )}
                <Button onClick={() => setIsGenerateDialogOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Genera Report
                </Button>
              </>
            )}
          </div>
        </div>

        {isDebugMode && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="text-amber-800">Debug Reports</CardTitle>
              <CardDescription className="text-amber-700">
                Usa questo pannello per verificare i dati dei report e risolvere problemi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Azienda</label>
                  <Select value={debugAziendaId} onValueChange={setDebugAziendaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona azienda" />
                    </SelectTrigger>
                    <SelectContent>
                      {aziende.map(azienda => (
                        <SelectItem key={azienda.id} value={azienda.id}>
                          {azienda.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Referente</label>
                  <Select value={debugReferenteId} onValueChange={setDebugReferenteId} disabled={!debugAziendaId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona referente" />
                    </SelectTrigger>
                    <SelectContent>
                      {debugReferenti.map(referente => (
                        <SelectItem key={referente.id} value={referente.id}>
                          {referente.first_name} {referente.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Mese</label>
                  <Select value={debugMonth.toString()} onValueChange={(v) => setDebugMonth(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona mese" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 12}, (_, i) => (
                        <SelectItem key={i+1} value={(i+1).toString()}>
                          {new Date(2022, i).toLocaleString('it-IT', {month: 'long'})}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-800 mb-1">Anno</label>
                  <Select value={debugYear.toString()} onValueChange={(v) => setDebugYear(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona anno" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({length: 5}, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 mb-4"
                onClick={handleDebugCheck}
                disabled={!debugAziendaId || !debugReferenteId}
              >
                Verifica dati servizi
              </Button>
              
              {debugInfo && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3 sm:col-span-1">
                      <div className="text-sm font-medium mb-1 text-amber-800">Aziende</div>
                      <div className="text-sm text-amber-700">
                        {debugInfo?.aziende ? debugInfo.aziende.length : 0} aziende trovate
                      </div>
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <div className="text-sm font-medium mb-1 text-amber-800">Referenti</div>
                      <div className="text-sm text-amber-700">
                        {debugInfo?.referenti ? debugInfo.referenti.length : 0} referenti trovati
                      </div>
                    </div>
                    <div className="col-span-3 sm:col-span-1">
                      <div className="text-sm font-medium mb-1 text-amber-800">Servizi</div>
                      <div className="text-sm text-amber-700">
                        Totali: {debugInfo?.allServizi ? debugInfo.allServizi.count : 0}
                        <br />
                        Consuntivati: {debugInfo?.consuntivati ? debugInfo.consuntivati.count : 0}
                      </div>
                    </div>
                  </div>

                  {debugInfo?.statuses && (
                    <div>
                      <div className="text-sm font-medium mb-1 text-amber-800">Stati servizi</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(debugInfo.statuses).map(([stato, count]) => (
                          <div key={stato} className="px-2 py-1 bg-amber-100 rounded text-xs">
                            {stato}: {String(count)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {debugInfo?.dateRange && (
                    <div>
                      <div className="text-sm font-medium mb-1 text-amber-800">Intervallo date</div>
                      <div className="text-sm text-amber-700">
                        Da: {debugInfo.dateRange.startDateString} a {debugInfo.dateRange.endDateString}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3 text-muted-foreground">
            <FileText className="h-5 w-5" />
            <h2 className="text-lg font-medium">Report generati</h2>
          </div>
          <ReportsList />
        </div>
        
        <ReportGeneratorDialog 
          open={isGenerateDialogOpen} 
          onOpenChange={setIsGenerateDialogOpen} 
        />
      </div>
    </MainLayout>
  );
}
