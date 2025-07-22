
import React, { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { UserShiftReportList } from '@/components/shifts/reports/UserShiftReportList';
import { UserShiftDetailReport } from '@/components/shifts/reports/UserShiftDetailReport';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight, Home, BarChart3, Download } from 'lucide-react';
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
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">Report Turni</h1>
                  <p className="text-muted-foreground text-lg">
                    Analisi dettagliata dei turni per ogni utente
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Seleziona periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current_month">Mese corrente</SelectItem>
                      <SelectItem value="last_month">Mese scorso</SelectItem>
                      <SelectItem value="last_3_months">Ultimi 3 mesi</SelectItem>
                      <SelectItem value="current_year">Anno corrente</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="outline"
                    onClick={handleExportCSV}
                    disabled={!allUsersStats || allUsersStats.users.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Esporta CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Layout principale a due colonne */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
              {/* Colonna sinistra - Lista utenti */}
              <div className="lg:col-span-1">
                <UserShiftReportList
                  userStats={allUsersStats?.users || []}
                  selectedUserId={selectedUserId}
                  onUserSelect={handleUserSelect}
                  isLoading={isLoadingStats}
                />
              </div>
              
              {/* Colonna destra - Dettaglio utente */}
              <div className="lg:col-span-2">
                <UserShiftDetailReport
                  userStats={selectedUserStats}
                  userShifts={selectedUserShifts}
                  period={allUsersStats?.period || { start_date: '', end_date: '' }}
                  isLoading={isLoadingDetails}
                />
              </div>
            </div>
        </div>
      </ShiftProvider>
    </MainLayout>
  );
}
