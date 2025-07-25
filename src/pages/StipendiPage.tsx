
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
import { useStipendi, useUpdateStatoStipendio } from '@/hooks/useStipendi';
import { 
  TabellaStipendi, 
  StipendiStats, 
  StipendiFilters, 
  StipendiHeader,
  NuovoStipendioSheet,
  DettaglioStipendioSheet,
  StipendiGuida
} from '@/components/stipendi';
import { ConfermaStatoDialog } from '@/components/stipendi/ConfermaStatoDialog';
import { useState, useMemo } from 'react';
import { Stipendio, StatoStipendio } from '@/lib/api/stipendi';
import { toast } from '@/components/ui/sonner';

export default function StipendiPage() {
  const { profile } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedTab, setSelectedTab] = useState<'tutti' | 'dipendenti' | 'soci'>('tutti');
  const [selectedStato, setSelectedStato] = useState<string>('tutti');
  const [nuovoStipendioOpen, setNuovoStipendioOpen] = useState(false);
  const [dettaglioStipendioOpen, setDettaglioStipendioOpen] = useState(false);
  const [selectedStipendioId, setSelectedStipendioId] = useState<string>('');
  
  // Stati per il dialog di conferma cambio stato
  const [confermaStatoOpen, setConfermaStatoOpen] = useState(false);
  const [stipendioPerCambioStato, setStipendioPerCambioStato] = useState<Stipendio | null>(null);
  const [nuovoStatoSelezionato, setNuovoStatoSelezionato] = useState<StatoStipendio>('confermato');

  // Hook per cambio stato
  const updateStatoMutation = useUpdateStatoStipendio();

  // Verifica accesso solo per admin
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Recupera stipendi per il mese/anno selezionato
  const { stipendi, isLoading, refetch } = useStipendi({
    anno: selectedYear,
    mese: selectedMonth,
    ...(selectedTab !== 'tutti' && { tipo_calcolo: selectedTab === 'dipendenti' ? 'dipendente' : 'socio' })
  });

  // Filtra stipendi per stato se selezionato
  const stipendiFiltrati = useMemo(() => {
    if (selectedStato === 'tutti') return stipendi;
    return stipendi.filter(stipendio => stipendio.stato === selectedStato);
  }, [stipendi, selectedStato]);

  // Calcola statistiche per le card
  const stats = useMemo(() => {
    const totaleStipendi = stipendiFiltrati.reduce((sum, s) => sum + (Number(s.totale_netto) || 0), 0);
    const numeroStipendi = stipendiFiltrati.length;
    const mediaStipendi = numeroStipendi > 0 ? totaleStipendi / numeroStipendi : 0;
    const daPagare = stipendiFiltrati.filter(s => s.stato === 'confermato').length;

    return {
      totaleStipendi,
      numeroStipendi,
      mediaStipendi,
      daPagare
    };
  }, [stipendiFiltrati]);

  const months = [
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

  // Gestori azioni tabella
  const handleViewDetails = (stipendio: Stipendio) => {
    setSelectedStipendioId(stipendio.id);
    setDettaglioStipendioOpen(true);
  };

  const handleEdit = (stipendio: Stipendio) => {
    console.log('Modifica stipendio:', stipendio);
    toast.info('Modifica stipendio - Feature in sviluppo');
  };

  const handleChangeStatus = (stipendio: Stipendio, newStatus: string) => {
    console.log('Cambia stato:', stipendio, 'to', newStatus);
    setStipendioPerCambioStato(stipendio);
    setNuovoStatoSelezionato(newStatus as StatoStipendio);
    setConfermaStatoOpen(true);
  };

  const handleDelete = (stipendio: Stipendio) => {
    console.log('Elimina stipendio:', stipendio);
    toast.info('Elimina stipendio - Feature in sviluppo');
  };

  const handleNewStipendio = () => {
    setNuovoStipendioOpen(true);
  };

  const handleStipendioCreated = () => {
    refetch();
  };

  // Gestori azioni dettaglio
  const handleEditFromDetail = (stipendioId: string) => {
    setDettaglioStipendioOpen(false);
    toast.info('Modifica stipendio - Feature in sviluppo');
  };

  const handleConfirmStipendio = (stipendioId: string) => {
    const stipendio = stipendi.find(s => s.id === stipendioId);
    if (stipendio) {
      setStipendioPerCambioStato(stipendio);
      setNuovoStatoSelezionato('confermato');
      setConfermaStatoOpen(true);
      setDettaglioStipendioOpen(false);
    }
  };

  const handleMarkPaid = (stipendioId: string) => {
    const stipendio = stipendi.find(s => s.id === stipendioId);
    if (stipendio) {
      setStipendioPerCambioStato(stipendio);
      setNuovoStatoSelezionato('pagato');
      setConfermaStatoOpen(true);
      setDettaglioStipendioOpen(false);
    }
  };

  const handlePrintStipendio = (stipendioId: string) => {
    toast.info('Stampa stipendio - Feature in sviluppo');
  };

  // Conferma cambio stato
  const handleConfirmaCambioStato = () => {
    if (!stipendioPerCambioStato) return;

    updateStatoMutation.mutate(
      {
        stipendioId: stipendioPerCambioStato.id,
        nuovoStato: nuovoStatoSelezionato
      },
      {
        onSuccess: () => {
          setConfermaStatoOpen(false);
          setStipendioPerCambioStato(null);
          refetch(); // Ricarica la lista
        }
      }
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Stipendi</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header con controlli */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <StipendiHeader
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
            onNewStipendio={handleNewStipendio}
          />
          
          {/* Guida al calcolo stipendi */}
          <StipendiGuida />
        </div>

        {/* Card riassuntive */}
        <StipendiStats stats={stats} isLoading={isLoading} />

        {/* Filtri */}
        <StipendiFilters
          selectedTab={selectedTab}
          selectedStato={selectedStato}
          onTabChange={setSelectedTab}
          onStatoChange={setSelectedStato}
        />

        {/* Contenuto tabella stipendi */}
        <Card>
          <CardHeader>
            <CardTitle>Stipendi {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            <TabellaStipendi
              stipendi={stipendiFiltrati}
              isLoading={isLoading}
              selectedTab={selectedTab}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onChangeStatus={handleChangeStatus}
              onDelete={handleDelete}
            />
          </CardContent>
        </Card>

        {/* Nuovo Stipendio Sheet */}
        <NuovoStipendioSheet
          open={nuovoStipendioOpen}
          onOpenChange={setNuovoStipendioOpen}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onStipendioCreated={handleStipendioCreated}
        />

        {/* Dettaglio Stipendio Sheet */}
        <DettaglioStipendioSheet
          stipendioId={selectedStipendioId}
          open={dettaglioStipendioOpen}
          onOpenChange={setDettaglioStipendioOpen}
          onEdit={handleEditFromDetail}
          onConfirm={handleConfirmStipendio}
          onMarkPaid={handleMarkPaid}
          onPrint={handlePrintStipendio}
        />

        {/* Dialog conferma cambio stato */}
        <ConfermaStatoDialog
          open={confermaStatoOpen}
          onOpenChange={setConfermaStatoOpen}
          stipendio={stipendioPerCambioStato}
          nuovoStato={nuovoStatoSelezionato}
          onConfirm={handleConfirmaCambioStato}
          isLoading={updateStatoMutation.isPending}
        />
      </div>
    </MainLayout>
  );
}
