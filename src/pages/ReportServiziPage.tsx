import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  Home, 
  ChevronRight, 
  BarChart3, 
  Filter,
  Download,
  Calendar,
  Building2,
  User,
  Users,
  Search,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ServizioTable } from '@/components/servizi/ServizioTable';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { useServizi } from '@/hooks/useServizi';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';
import { cn } from '@/lib/utils';

interface ReportFilters {
  aziendaId: string;
  referenteId: string;
  dipendenteId: string;
  dataInizio: Date | undefined;
  dataFine: Date | undefined;
}

export default function ReportServiziPage() {
  const navigate = useNavigate();
  const { servizi, isLoading } = useServizi();
  const { users } = useUsers();
  const { aziende } = useAziende();

  const [filters, setFilters] = useState<ReportFilters>({
    aziendaId: '',
    referenteId: '',
    dipendenteId: '',
    dataInizio: undefined,
    dataFine: undefined
  });

  // Get referenti (role: cliente)
  const referenti = users?.filter(user => user.role === 'cliente') || [];
  
  // Get dipendenti (role: dipendente, admin, socio)
  const dipendenti = users?.filter(user => 
    ['dipendente', 'admin', 'socio'].includes(user.role)
  ) || [];

  // Filter servizi based on current filters
  const filteredServizi = useMemo(() => {
    if (!servizi) return [];

    return servizi.filter(servizio => {
      // Filter by azienda
      if (filters.aziendaId && servizio.azienda_id !== filters.aziendaId) {
        return false;
      }

      // Filter by referente
      if (filters.referenteId && servizio.referente_id !== filters.referenteId) {
        return false;
      }

      // Filter by dipendente (assegnato_a)
      if (filters.dipendenteId && servizio.assegnato_a !== filters.dipendenteId) {
        return false;
      }

      // Filter by date range
      const serviceDate = new Date(servizio.data_servizio);
      
      if (filters.dataInizio) {
        const startDate = new Date(filters.dataInizio);
        startDate.setHours(0, 0, 0, 0);
        if (serviceDate < startDate) return false;
      }

      if (filters.dataFine) {
        const endDate = new Date(filters.dataFine);
        endDate.setHours(23, 59, 59, 999);
        if (serviceDate > endDate) return false;
      }

      return true;
    });
  }, [servizi, filters]);

  // Statistics
  const stats = useMemo(() => {
    const total = filteredServizi.length;
    const completati = filteredServizi.filter(s => s.stato === 'completato').length;
    const inCorso = filteredServizi.filter(s => s.stato === 'assegnato').length;
    const daAssegnare = filteredServizi.filter(s => s.stato === 'da_assegnare').length;
    
    // Calcola totale incassi
    const totaleIncassi = filteredServizi
      .filter(s => s.incasso_ricevuto)
      .reduce((sum, s) => sum + (s.incasso_ricevuto || 0), 0);

    return {
      total,
      completati,
      inCorso,
      daAssegnare,
      totaleIncassi
    };
  }, [filteredServizi]);

  const handleFilterChange = (key: keyof ReportFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      aziendaId: '',
      referenteId: '',
      dipendenteId: '',
      dataInizio: undefined,
      dataFine: undefined
    });
  };

  const getAziendaName = (id: string) => {
    const azienda = aziende?.find(a => a.id === id);
    return azienda?.nome || 'Sconosciuta';
  };

  const getUserName = (id: string) => {
    const user = users?.find(u => u.id === id);
    return user ? `${user.first_name} ${user.last_name}` : 'Sconosciuto';
  };

  const exportToCSV = () => {
    if (filteredServizi.length === 0) return;

    const headers = [
      'Data',
      'Orario',
      'Azienda',
      'Referente',
      'Dipendente',
      'Partenza',
      'Destinazione',
      'Stato',
      'Incasso Ricevuto',
      'Note'
    ];

    const csvData = filteredServizi.map(servizio => [
      format(new Date(servizio.data_servizio), 'dd/MM/yyyy'),
      servizio.orario_servizio || '',
      getAziendaName(servizio.azienda_id),
      getUserName(servizio.referente_id),
      servizio.assegnato_a ? getUserName(servizio.assegnato_a) : 'Non assegnato',
      servizio.indirizzo_presa,
      servizio.indirizzo_destinazione,
      servizio.stato,
      servizio.incasso_ricevuto || '',
      servizio.note || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_servizi_${format(new Date(), 'dd-MM-yyyy')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con breadcrumb */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span 
              className="cursor-pointer hover:text-foreground" 
              onClick={() => navigate('/servizi')}
            >
              Servizi
            </span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Report</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title flex items-center gap-2">
                <BarChart3 className="h-8 w-8" />
                Report Servizi
              </h1>
              <p className="text-description">
                Analizza e filtra i servizi per azienda, referente, dipendente e periodo
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={exportToCSV}
                disabled={filteredServizi.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Esporta CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Filtri */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtri Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro Azienda */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Azienda
                </Label>
                <Select value={filters.aziendaId} onValueChange={(value) => handleFilterChange('aziendaId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutte le aziende" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutte le aziende</SelectItem>
                    {aziende?.map(azienda => (
                      <SelectItem key={azienda.id} value={azienda.id}>
                        {azienda.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Referente */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Referente
                </Label>
                <Select value={filters.referenteId} onValueChange={(value) => handleFilterChange('referenteId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i referenti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i referenti</SelectItem>
                    {referenti.map(referente => (
                      <SelectItem key={referente.id} value={referente.id}>
                        {referente.first_name} {referente.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Dipendente */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Dipendente
                </Label>
                <Select value={filters.dipendenteId} onValueChange={(value) => handleFilterChange('dipendenteId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti i dipendenti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti i dipendenti</SelectItem>
                    {dipendenti.map(dipendente => (
                      <SelectItem key={dipendente.id} value={dipendente.id}>
                        {dipendente.first_name} {dipendente.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro Data */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Periodo
                </Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        {filters.dataInizio ? format(filters.dataInizio, 'dd/MM/yy') : 'Da'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dataInizio}
                        onSelect={(date) => handleFilterChange('dataInizio', date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        {filters.dataFine ? format(filters.dataFine, 'dd/MM/yy') : 'A'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={filters.dataFine}
                        onSelect={(date) => handleFilterChange('dataFine', date)}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* Filtri attivi e reset */}
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.aziendaId && (
                  <Badge variant="secondary" className="gap-1">
                    Azienda: {getAziendaName(filters.aziendaId)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('aziendaId', '')}
                    />
                  </Badge>
                )}
                {filters.referenteId && (
                  <Badge variant="secondary" className="gap-1">
                    Referente: {getUserName(filters.referenteId)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('referenteId', '')}
                    />
                  </Badge>
                )}
                {filters.dipendenteId && (
                  <Badge variant="secondary" className="gap-1">
                    Dipendente: {getUserName(filters.dipendenteId)}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleFilterChange('dipendenteId', '')}
                    />
                  </Badge>
                )}
                {(filters.dataInizio || filters.dataFine) && (
                  <Badge variant="secondary" className="gap-1">
                    Periodo: {filters.dataInizio ? format(filters.dataInizio, 'dd/MM/yy') : '∞'} - {filters.dataFine ? format(filters.dataFine, 'dd/MM/yy') : '∞'}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => {
                        handleFilterChange('dataInizio', undefined);
                        handleFilterChange('dataFine', undefined);
                      }}
                    />
                  </Badge>
                )}
              </div>
              
              {(filters.aziendaId || filters.referenteId || filters.dipendenteId || filters.dataInizio || filters.dataFine) && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Reset Filtri
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Statistiche */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-muted-foreground">Totale Servizi</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completati}</div>
                <div className="text-sm text-muted-foreground">Completati</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.inCorso}</div>
                <div className="text-sm text-muted-foreground">In Corso</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.daAssegnare}</div>
                <div className="text-sm text-muted-foreground">Da Assegnare</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">€{stats.totaleIncassi.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Totale Incassi</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabella risultati */}
        <Card>
          <CardHeader>
            <CardTitle>
              Risultati ({filteredServizi.length} servizi)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border h-[600px] flex flex-col">
              <ServizioTable
                servizi={filteredServizi}
                users={users || []}
                onNavigateToDetail={(id) => navigate(`/servizi/${id}`)}
                isAdminOrSocio={true}
                allServizi={servizi || []}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}