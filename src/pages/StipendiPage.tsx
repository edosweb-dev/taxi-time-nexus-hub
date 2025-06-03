
import { MainLayout } from '@/components/layouts/MainLayout';
import { useAuth } from '@/hooks/useAuth';
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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useStipendi } from '@/hooks/useStipendi';
import { 
  Banknote, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Plus 
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function StipendiPage() {
  const { profile } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedTab, setSelectedTab] = useState<'tutti' | 'dipendenti' | 'soci'>('tutti');
  const [selectedStato, setSelectedStato] = useState<string>('tutti');

  // Verifica accesso solo per admin
  if (profile && profile.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Genera array degli anni (ultimi 3 anni + prossimi 2)
  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);
  }, []);

  // Genera array dei mesi
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

  // Recupera stipendi per il mese/anno selezionato
  const { stipendi, isLoading } = useStipendi({
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', { 
      style: 'currency', 
      currency: 'EUR' 
    }).format(value);
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">Gestione Stipendi</h1>
            
            {/* Selettori Mese/Anno */}
            <div className="flex gap-2">
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value.toString()}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                <SelectTrigger className="w-24">
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

          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Stipendio
          </Button>
        </div>

        {/* Card riassuntive */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Stipendi</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(stats.totaleStipendi)}</div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stipendi Elaborati</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.numeroStipendi}</div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Media Stipendi</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{formatCurrency(stats.mediaStipendi)}</div>
              )}
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Da Pagare</CardTitle>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                {stats.daPagare > 0 && (
                  <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
                    {stats.daPagare}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.daPagare}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filtri */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          {/* Tab per tipo */}
          <div className="flex gap-2">
            <Button
              variant={selectedTab === 'tutti' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('tutti')}
            >
              Tutti
            </Button>
            <Button
              variant={selectedTab === 'dipendenti' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('dipendenti')}
            >
              Dipendenti
            </Button>
            <Button
              variant={selectedTab === 'soci' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTab('soci')}
            >
              Soci
            </Button>
          </div>

          {/* Filtro stato */}
          <Select value={selectedStato} onValueChange={setSelectedStato}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtra per stato" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tutti">Tutti gli stati</SelectItem>
              <SelectItem value="bozza">Bozza</SelectItem>
              <SelectItem value="confermato">Confermato</SelectItem>
              <SelectItem value="pagato">Pagato</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Contenuto tabella stipendi - placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Stipendi {months.find(m => m.value === selectedMonth)?.label} {selectedYear}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : stipendiFiltrati.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nessun stipendio trovato per il periodo selezionato.
              </p>
            ) : (
              <p className="text-muted-foreground">
                Tabella stipendi verrà implementata nel prossimo step. 
                Trovati {stipendiFiltrati.length} stipendi.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
