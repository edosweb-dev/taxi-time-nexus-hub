
import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { UserSelectDropdown } from '@/components/shifts/reports/UserSelectDropdown';
import { UserShiftDetailReport } from '@/components/shifts/reports/UserShiftDetailReport';
import { DayServicesModal } from '@/components/shifts/reports/DayServicesModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, Home, BarChart3, Download, Calendar as CalendarIcon, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchAllUsersShiftStats, 
  fetchUserShiftDetails, 
  UserShiftStats,
  AllUsersShiftStats 
} from '@/components/shifts/reports/shiftReportsApi';
import { Shift } from '@/components/shifts/types';

export default function ShiftReportsPage() {
  const { profile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current_month');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [allUsersStats, setAllUsersStats] = useState<AllUsersShiftStats | null>(null);
  const [selectedUserStats, setSelectedUserStats] = useState<UserShiftStats | null>(null);
  const [selectedUserShifts, setSelectedUserShifts] = useState<Shift[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  // Modal for day services
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dayServices, setDayServices] = useState<any[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  // Calcola date periodo in base alla selezione
  const getPeriodDates = (period: string): { start: Date; end: Date } => {
    const now = new Date();
    switch (period) {
      case 'current_month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
      case 'last_3_months':
        return { start: startOfMonth(subMonths(now, 2)), end: endOfMonth(now) };
      case 'current_year':
        return { start: new Date(now.getFullYear(), 0, 1), end: new Date(now.getFullYear(), 11, 31) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  // Carica statistiche di tutti gli utenti
  const loadAllUsersStats = async () => {
    setIsLoadingStats(true);
    try {
      const { start, end } = getPeriodDates(selectedPeriod);
      const stats = await fetchAllUsersShiftStats(start, end);
      setAllUsersStats(stats);
      
      // Se non c'è un utente selezionato e ci sono utenti, seleziona il primo
      if (!selectedUserId && stats.users.length > 0) {
        setSelectedUserId(stats.users[0].user_id);
      }
    } catch (error) {
      console.error('Error loading users stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Carica dettagli utente selezionato
  const loadUserDetails = async (userId: string) => {
    if (!allUsersStats) return;
    
    setIsLoadingDetails(true);
    try {
      const { start, end } = getPeriodDates(selectedPeriod);
      
      // Trova le statistiche dell'utente selezionato
      const userStats = allUsersStats.users.find(u => u.user_id === userId);
      setSelectedUserStats(userStats || null);
      
      // Carica i turni dettagliati
      const shifts = await fetchUserShiftDetails(userId, start, end);
      setSelectedUserShifts(shifts);
    } catch (error) {
      console.error('Error loading user details:', error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Effetti per caricare i dati
  useEffect(() => {
    loadAllUsersStats();
  }, [selectedPeriod]);

  useEffect(() => {
    if (selectedUserId) {
      loadUserDetails(selectedUserId);
    }
  }, [selectedUserId, allUsersStats]);

  // Gestione selezione utente
  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  // Handle day click to show services
  const handleDayClick = async (date: Date) => {
    if (!selectedUserId) return;
    
    setSelectedDate(date);
    setIsLoadingServices(true);
    
    try {
      // TODO: Implementare API per recuperare servizi per data specifica
      // Per ora mock data
      const mockServices = [
        {
          id: '1',
          azienda_nome: 'Azienda Test',
          indirizzo_partenza: 'Via Roma 1, Milano',
          indirizzo_destinazione: 'Via Venezia 10, Roma',
          orario_partenza: '08:00',
          orario_arrivo: '10:30',
          stato: 'completato',
          nome_contatto: 'Mario Rossi',
          telefono_contatto: '+39 123 456 789',
          note: 'Servizio express con urgenza'
        }
      ];
      
      setDayServices(mockServices);
    } catch (error) {
      console.error('Error loading day services:', error);
      setDayServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  // Export CSV (funzionalità base)
  const handleExportCSV = () => {
    if (!allUsersStats) return;
    
    const csvContent = [
      ['Nome', 'Email', 'Ore Totali', 'Giorni Lavorativi', 'Giorni Malattia', 'Giorni Non Disponibile'].join(','),
      ...allUsersStats.users.map(user => [
        `"${user.user_first_name || ''} ${user.user_last_name || ''}"`.trim(),
        user.user_email || '',
        user.total_hours,
        user.working_days,
        user.sick_days,
        user.unavailable_days
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `report_turni_${selectedPeriod}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <MainLayout>
      <ShiftProvider>
        <div className="space-y-6">
            {/* Header con breadcrumb */}
            <div className="space-y-4">
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span>Turni</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">Report</span>
              </nav>
              
              <div className="space-y-6">
                {/* Header principale */}
                <div className="flex items-center gap-3">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground">Report Turni</h1>
                    <p className="text-muted-foreground">
                      Analisi dettagliata dei turni con selezione rapida utente
                    </p>
                  </div>
                </div>

                {/* Controlli di selezione */}
                <Card className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Selezione Utente e Periodo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                      {/* Selezione utente */}
                      <div className="space-y-2 flex-1">
                        <label className="text-sm font-medium">Utente da analizzare:</label>
                        <UserSelectDropdown
                          users={allUsersStats?.users || []}
                          selectedUserId={selectedUserId}
                          onSelectUser={setSelectedUserId}
                          isLoading={isLoadingStats}
                        />
                      </div>

                      {/* Selezione periodo */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Periodo di analisi:</label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder="Seleziona periodo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="current_month">📅 Mese corrente</SelectItem>
                            <SelectItem value="last_month">📆 Mese scorso</SelectItem>
                            <SelectItem value="last_3_months">📊 Ultimi 3 mesi</SelectItem>
                            <SelectItem value="current_year">🗓️ Anno corrente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Export */}
                      <Button 
                        variant="outline"
                        onClick={handleExportCSV}
                        disabled={!allUsersStats || allUsersStats.users.length === 0}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Esporta CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Report dettagliato a colonna singola */}
            <div className="w-full">
              <UserShiftDetailReport
                userStats={selectedUserStats}
                userShifts={selectedUserShifts}
                period={allUsersStats?.period || { start_date: '', end_date: '' }}
                isLoading={isLoadingDetails}
                onDayClick={handleDayClick}
              />
            </div>
            
            {/* Modal per servizi del giorno */}
            <DayServicesModal
              open={!!selectedDate}
              onOpenChange={(open) => !open && setSelectedDate(null)}
              date={selectedDate}
              services={dayServices}
              isLoading={isLoadingServices}
            />
        </div>
      </ShiftProvider>
    </MainLayout>
  );
}
