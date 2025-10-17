
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
import { 
  StipendiHeader,
  StipendiGuida
} from '@/components/stipendi';
import { TabellaStipendAutomatici } from '@/components/stipendi/TabellaStipendAutomatici';
import { useStipendiAutomatici } from '@/hooks/useStipendiAutomatici';
import { useState, useMemo } from 'react';
import { StipendiAutomaticoUtente } from '@/lib/api/stipendi/calcoloAutomaticoStipendi';
import { toast } from 'sonner';
import { createStipendio } from '@/lib/api/stipendi/createStipendio';
import { useQueryClient } from '@tanstack/react-query';

export default function StipendiPage() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  // Verifica accesso solo per admin e soci
  if (profile && !['admin', 'socio'].includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Recupera stipendi automatici per il mese/anno selezionato
  const { data: stipendiAutomatici, isLoading, refetch } = useStipendiAutomatici(selectedMonth, selectedYear);

  // Filtra per tipo
  const stipendiAdmin = useMemo(() => 
    stipendiAutomatici?.filter(s => s.role === 'admin') || [], 
    [stipendiAutomatici]
  );
  
  const stipendiSoci = useMemo(() => 
    stipendiAutomatici?.filter(s => s.role === 'socio') || [], 
    [stipendiAutomatici]
  );
  
  const stipendiDipendenti = useMemo(() => 
    stipendiAutomatici?.filter(s => s.role === 'dipendente') || [], 
    [stipendiAutomatici]
  );

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
      refetch();
    } catch (error) {
      console.error('Errore salvataggio stipendio:', error);
      toast.error('Errore durante il salvataggio dello stipendio');
    }
  };

  const handleViewDetails = (stipendio: StipendiAutomaticoUtente) => {
    toast.info('Dettaglio stipendio - Feature in sviluppo');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con controlli */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <StipendiHeader
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onNewStipendio={() => toast.info('Usa il pulsante "Salva" nella tabella per salvare gli stipendi')}
          />
          
          <StipendiGuida />
        </div>

        {/* Tabs per admin/soci/dipendenti */}
        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="admin">Admin ({stipendiAdmin.length})</TabsTrigger>
            <TabsTrigger value="soci">Soci ({stipendiSoci.length})</TabsTrigger>
            <TabsTrigger value="dipendenti">Dipendenti ({stipendiDipendenti.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="admin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stipendi Admin - {getMonthName(selectedMonth)} {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <TabellaStipendAutomatici
                  stipendi={stipendiAdmin}
                  isLoading={isLoading}
                  onSalvaStipendio={handleSalvaStipendio}
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="soci" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Stipendi Soci - {getMonthName(selectedMonth)} {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <TabellaStipendAutomatici
                  stipendi={stipendiSoci}
                  isLoading={isLoading}
                  onSalvaStipendio={handleSalvaStipendio}
                  onViewDetails={handleViewDetails}
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
                <TabellaStipendAutomatici
                  stipendi={stipendiDipendenti}
                  isLoading={isLoading}
                  onSalvaStipendio={handleSalvaStipendio}
                  onViewDetails={handleViewDetails}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
