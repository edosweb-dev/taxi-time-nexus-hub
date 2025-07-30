import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { CalendarIcon, Download, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useShifts } from '@/hooks/useShifts';
import { useUsers } from '@/hooks/useUsers';
import { Shift } from '@/types/shifts';

export default function ShiftReportsPage() {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [reportData, setReportData] = useState<{
    totalShifts: number;
    workHours: number;
    shiftsByType: Record<string, number>;
    shiftsByUser: Record<string, number>;
  } | null>(null);

  const { shifts, loading, fetchShifts } = useShifts();
  const { users, isLoading: usersLoading } = useUsers();

  // Filter only employees (admin, socio, dipendente)
  const employees = users.filter(user => ['admin', 'socio', 'dipendente'].includes(user.role));

  useEffect(() => {
    const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');
    
    const filters = {
      start_date: startDate,
      end_date: endDate,
      ...(selectedUser !== 'all' && { user_ids: [selectedUser] })
    };

    fetchShifts(filters);
  }, [selectedMonth, selectedUser, fetchShifts]);

  useEffect(() => {
    if (shifts.length > 0) {
      generateReportData(shifts);
    }
  }, [shifts]);

  const generateReportData = (shiftsData: Shift[]) => {
    const totalShifts = shiftsData.length;
    
    // Calculate work hours
    let workHours = 0;
    shiftsData.forEach(shift => {
      if (shift.shift_type === 'work' && shift.start_time && shift.end_time) {
        const start = new Date(`2023-01-01 ${shift.start_time}`);
        const end = new Date(`2023-01-01 ${shift.end_time}`);
        const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        workHours += diff;
      }
    });

    // Group by shift type
    const shiftsByType: Record<string, number> = {};
    shiftsData.forEach(shift => {
      shiftsByType[shift.shift_type] = (shiftsByType[shift.shift_type] || 0) + 1;
    });

    // Group by user
    const shiftsByUser: Record<string, number> = {};
    shiftsData.forEach(shift => {
      const user = employees.find(u => u.id === shift.user_id);
      const userName = user ? `${user.first_name} ${user.last_name}` : 'Utente sconosciuto';
      shiftsByUser[userName] = (shiftsByUser[userName] || 0) + 1;
    });

    setReportData({
      totalShifts,
      workHours,
      shiftsByType,
      shiftsByUser
    });
  };

  const shiftTypeLabels = {
    work: 'Lavoro',
    sick_leave: 'Malattia',
    vacation: 'Ferie',
    unavailable: 'Non disponibile'
  };

  const exportToCSV = () => {
    if (!shifts.length) return;

    const csvHeaders = ['Data', 'Utente', 'Tipo', 'Ora Inizio', 'Ora Fine', 'Note'];
    const csvRows = shifts.map(shift => {
      const user = employees.find(u => u.id === shift.user_id);
      const userName = user ? `${user.first_name} ${user.last_name}` : 'Utente sconosciuto';
      return [
        format(new Date(shift.shift_date), 'dd/MM/yyyy'),
        userName,
        shiftTypeLabels[shift.shift_type as keyof typeof shiftTypeLabels] || shift.shift_type,
        shift.start_time || '',
        shift.end_time || '',
        shift.notes || ''
      ];
    });

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `turni_${format(selectedMonth, 'yyyy-MM')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (usersLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Caricamento...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Report Turni</h1>
            <p className="text-muted-foreground">
              Analizza i dati dei turni di lavoro
            </p>
          </div>
          <Button onClick={exportToCSV} disabled={!shifts.length}>
            <Download className="h-4 w-4 mr-2" />
            Esporta CSV
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Utente</label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona utente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti gli utenti</SelectItem>
                    {employees.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mese</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !selectedMonth && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedMonth ? (
                        format(selectedMonth, 'MMMM yyyy', { locale: it })
                      ) : (
                        <span>Seleziona mese</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedMonth}
                      onSelect={(date) => date && setSelectedMonth(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        {reportData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totale Turni</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalShifts}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ore Lavorate</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.workHours.toFixed(1)}h</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turni di Lavoro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.shiftsByType.work || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Assenze</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(reportData.shiftsByType.sick_leave || 0) + 
                   (reportData.shiftsByType.vacation || 0) + 
                   (reportData.shiftsByType.unavailable || 0)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shifts by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Turni per Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData ? (
                <div className="space-y-3">
                  {Object.entries(reportData.shiftsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">
                        {shiftTypeLabels[type as keyof typeof shiftTypeLabels] || type}
                      </span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nessun dato disponibile</p>
              )}
            </CardContent>
          </Card>

          {/* Shifts by User */}
          <Card>
            <CardHeader>
              <CardTitle>Turni per Utente</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData && selectedUser === 'all' ? (
                <div className="space-y-3">
                  {Object.entries(reportData.shiftsByUser).map(([user, count]) => (
                    <div key={user} className="flex items-center justify-between">
                      <span className="text-sm">{user}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {selectedUser === 'all' ? 'Nessun dato disponibile' : 'Seleziona "Tutti gli utenti" per vedere la distribuzione'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}