
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Clock, RefreshCw, Loader2 } from 'lucide-react';

import { 
  StipendiHeader,
  StipendiGuida
} from '@/components/stipendi';
import { TabellaStipendAutomatici } from '@/components/stipendi/TabellaStipendAutomatici';
import { TabellaStipendiDipendenti } from '@/components/stipendi/TabellaStipendiDipendenti';
import { DettaglioStipendioSheet } from '@/components/stipendi/DettaglioStipendioSheet';
import { useStipendiAutomatici } from '@/hooks/useStipendiAutomatici';
import { useStipendiDipendenti } from '@/hooks/useStipendiDipendenti';
import { useState, useMemo } from 'react';
import { StipendiAutomaticoUtente } from '@/lib/api/stipendi/calcoloAutomaticoStipendi';
import { StipendioManualeDipendente } from '@/lib/api/stipendi/getStipendiDipendenti';
import { toast } from 'sonner';
import { createStipendio } from '@/lib/api/stipendi/createStipendio';
import { ricalcolaTuttiStipendiMese } from '@/lib/api/stipendi/ricalcolaStipendio';
import { useQueryClient } from '@tanstack/react-query';

export default function StipendiPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedStipendioSocio, setSelectedStipendioSocio] = useState<StipendiAutomaticoUtente | null>(null);
  const [selectedStipendiodiPendente, setSelectedStipendiodiPendente] = useState<StipendioManualeDipendente | null>(null);
  const [isRecalculatingAll, setIsRecalculatingAll] = useState(false);

  // Verifica accesso solo per admin e soci
  if (profile && !['admin', 'socio'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Recupera stipendi automatici per soci (admin e soci)
  const { data: stipendiSoci, isLoading: isLoadingSoci, refetch: refetchSoci } = useStipendiAutomatici(selectedMonth, selectedYear);
  
  // Recupera stipendi manuali per dipendenti
  const { data: stipendiDipendenti, isLoading: isLoadingDipendenti, refetch: refetchDipendenti } = useStipendiDipendenti(selectedMonth, selectedYear);

  // Gestori azioni
  const handleSalvaStipendio = async (stipendio: StipendiAutomaticoUtente) => {
    if (!stipendio.calcoloCompleto || !profile) return;

    try {
      await createStipendio({
        formData: {
          user_id: stipendio.userId,
          km: stipendio.kmTotali,
          ore_attesa: stipendio.oreAttesa,
        },
        mese: selectedMonth,
        anno: selectedYear,
        calcolo: stipendio.calcoloCompleto,
      });

      toast.success('Stipendio salvato correttamente');
      queryClient.invalidateQueries({ queryKey: ['stipendi-automatici'] });
      refetchSoci();
    } catch (error) {
      console.error('Errore salvataggio stipendio:', error);
      toast.error('Errore durante il salvataggio dello stipendio');
    }
  };

  const handleViewDetails = (stipendio: StipendiAutomaticoUtente) => {
    setSelectedStipendioSocio(stipendio);
  };

  const handleViewDetailsDipendente = (dipendente: StipendioManualeDipendente) => {
    setSelectedStipendiodiPendente(dipendente);
  };

  // Conta stipendi in bozza
  const countBozza = useMemo(() => {
    return (stipendiSoci || []).filter(
      s => s.stipendioEsistente?.stato === 'bozza'
    ).length;
  }, [stipendiSoci]);

  // Handler per ricalcolare tutti gli stipendi del mese
  const handleRicalcolaTutti = async () => {
    setIsRecalculatingAll(true);
    try {
      const result = await ricalcolaTuttiStipendiMese(selectedMonth, selectedYear);
      
      if (result.errors === 0) {
        toast.success(`${result.success} stipendi ricalcolati con successo`);
      } else {
        toast.warning(`${result.success} ricalcolati, ${result.errors} errori`);
      }
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['stipendi-automatici'] });
      queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      refetchSoci();
    } catch (error) {
      console.error('[handleRicalcolaTutti] Error:', error);
      toast.error('Errore durante il ricalcolo degli stipendi');
    } finally {
      setIsRecalculatingAll(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con controlli */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <StipendiHeader
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
              onMonthChange={setSelectedMonth}
              onYearChange={setSelectedYear}
              onNewStipendio={() => toast.info('Usa il pulsante "Salva" nella tabella per salvare gli stipendi')}
            />
          </div>
          
          <div className="flex gap-3 items-center">
            {countBozza > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRicalcolaTutti}
                disabled={isRecalculatingAll}
              >
                {isRecalculatingAll ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Ricalcola Tutti
              </Button>
            )}
            <StipendiGuida />
          </div>
        </div>

        {/* Tabs Soci / Dipendenti */}
        <Tabs defaultValue="soci" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="soci">
              Soci ({(stipendiSoci || []).length})
            </TabsTrigger>
            <TabsTrigger value="dipendenti">
              Dipendenti ({(stipendiDipendenti || []).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="soci" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stipendi Soci - {getMonthName(selectedMonth)} {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <TabellaStipendAutomatici
                  stipendi={stipendiSoci || []}
                  isLoading={isLoadingSoci}
                  onSalvaStipendio={handleSalvaStipendio}
                  onViewDetails={handleViewDetails}
                  mese={selectedMonth}
                  anno={selectedYear}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dipendenti" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stipendi Dipendenti - {getMonthName(selectedMonth)} {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <TabellaStipendiDipendenti
                  dipendenti={stipendiDipendenti || []}
                  isLoading={isLoadingDipendenti}
                  onViewDetails={handleViewDetailsDipendente}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sheet dettagli soci */}
        <DettaglioStipendioSheet
          open={!!selectedStipendioSocio}
          onOpenChange={(open) => !open && setSelectedStipendioSocio(null)}
          stipendio={selectedStipendioSocio}
          tipo="socio"
          mese={selectedMonth}
          anno={selectedYear}
        />

        {/* Sheet dettagli dipendenti */}
        <DettaglioStipendioSheet
          open={!!selectedStipendiodiPendente}
          onOpenChange={(open) => !open && setSelectedStipendiodiPendente(null)}
          stipendio={selectedStipendiodiPendente}
          tipo="dipendente"
          mese={selectedMonth}
          anno={selectedYear}
        />
      </div>
    </MainLayout>
  );
}

function getMonthName(month: number): string {
  const months = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];
  return months[month - 1] || '';
}
