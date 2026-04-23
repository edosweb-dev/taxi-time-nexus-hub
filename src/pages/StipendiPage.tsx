
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
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
import { Clock, Loader2, History } from 'lucide-react';

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
import { ricalcolaTuttiStipendiCascata } from '@/lib/api/stipendi/ricalcolaStipendio';
import { useQueryClient } from '@tanstack/react-query';

export default function StipendiPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const [searchParams] = useSearchParams();
  const [selectedMonth, setSelectedMonth] = useState(
    searchParams.get('mese') ? parseInt(searchParams.get('mese')!) : currentDate.getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    searchParams.get('anno') ? parseInt(searchParams.get('anno')!) : currentDate.getFullYear()
  );
  const [selectedStipendioSocio, setSelectedStipendioSocio] = useState<StipendiAutomaticoUtente | null>(null);
  const [selectedStipendiodiPendente, setSelectedStipendiodiPendente] = useState<StipendioManualeDipendente | null>(null);
  const [isRecalculatingAll, setIsRecalculatingAll] = useState(false);
  const [isRealigningAnno, setIsRealigningAnno] = useState(false);

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
      const result = await ricalcolaTuttiStipendiCascata(selectedMonth, selectedYear);

      if (result.errori === 0) {
        toast.success(`${result.successi} stipendi ricalcolati e propagati ai mesi successivi`);
      } else {
        toast.warning(`${result.successi} ricalcolati, ${result.errori} errori`);
      }

      // Refresh data
      queryClient.invalidateQueries({ queryKey: ['stipendi-automatici'] });
      queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      queryClient.invalidateQueries({ queryKey: ['report-soci'] });
      refetchSoci();
    } catch (error) {
      console.error('[handleRicalcolaTutti] Error:', error);
      toast.error('Errore durante il ricalcolo degli stipendi');
    } finally {
      setIsRecalculatingAll(false);
    }
  };

  const handleRiallineaAnno = async () => {
    const conferma = window.confirm(
      `Questa operazione ricalcolerà tutti gli stipendi dell'anno ${selectedYear} per tutti i soci. Gli stipendi in stato 'confermato' o 'pagato' non verranno modificati. Continuare?`
    );
    if (!conferma) return;

    setIsRealigningAnno(true);
    try {
      const result = await ricalcolaTuttiStipendiCascata(1, selectedYear);
      if (result.errori === 0) {
        toast.success(`Storico anno ${selectedYear} riallineato: ${result.successi} soci`);
      } else {
        toast.warning(`${result.successi} riallineati, ${result.errori} errori. Vedi console.`);
        console.warn('[handleRiallineaAnno] Dettagli errori:', result.dettagli.filter(d => !d.ok));
      }
      queryClient.invalidateQueries({ queryKey: ['stipendi-automatici'] });
      queryClient.invalidateQueries({ queryKey: ['stipendi'] });
      queryClient.invalidateQueries({ queryKey: ['report-soci'] });
      refetchSoci();
    } catch (error) {
      console.error('[handleRiallineaAnno] Error:', error);
      toast.error('Errore durante il riallineamento dello storico');
    } finally {
      setIsRealigningAnno(false);
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleRiallineaAnno}
              disabled={isRealigningAnno}
              title={`Ricalcola tutti gli stipendi dell'anno ${selectedYear} da gennaio a oggi, per tutti i soci.`}
            >
              {isRealigningAnno ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <History className="h-4 w-4 mr-2" />
              )}
              Riallinea storico anno
            </Button>
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
