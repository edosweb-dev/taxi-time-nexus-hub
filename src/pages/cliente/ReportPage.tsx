
import React, { useEffect, useState } from 'react';
import { ClientDashboardLayout } from '@/components/layouts/ClientDashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, DownloadIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/components/servizi/hooks/useReports';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

export default function ReportPage() {
  const { profile } = useAuth();
  const { reports, downloadReport } = useReports();
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().getMonth() + 1 + '');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear() + '');
  const [filteredReports, setFilteredReports] = useState<any[]>([]);

  useEffect(() => {
    if (reports && profile) {
      // Filter reports for this client and selected month/year
      setFilteredReports(
        reports.filter(
          (report) => 
            report.referente_id === profile.id && 
            report.month === parseInt(selectedMonth) && 
            report.year === parseInt(selectedYear)
        )
      );
    }
  }, [reports, selectedMonth, selectedYear, profile]);

  const monthOptions = [
    { value: '1', label: 'Gennaio' },
    { value: '2', label: 'Febbraio' },
    { value: '3', label: 'Marzo' },
    { value: '4', label: 'Aprile' },
    { value: '5', label: 'Maggio' },
    { value: '6', label: 'Giugno' },
    { value: '7', label: 'Luglio' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Settembre' },
    { value: '10', label: 'Ottobre' },
    { value: '11', label: 'Novembre' },
    { value: '12', label: 'Dicembre' },
  ];

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  return (
    <ClientDashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Mensili</h1>
          <p className="text-muted-foreground">
            Visualizza e scarica i report dei servizi mensili
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-primary" />
              Report
            </CardTitle>
            <CardDescription>
              Seleziona il mese e l'anno per visualizzare il report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 max-w-md mb-6">
              <Select 
                value={selectedMonth}
                onValueChange={setSelectedMonth}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Mese" />
                </SelectTrigger>
                <SelectContent>
                  {monthOptions.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select 
                value={selectedYear} 
                onValueChange={setSelectedYear}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Anno" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {filteredReports.length > 0 ? (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div 
                    key={report.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md hover:bg-muted/30 transition-colors"
                  >
                    <div className="space-y-1 mb-3 sm:mb-0">
                      <h3 className="font-medium">
                        Report {format(new Date(report.year, report.month - 1), 'MMMM yyyy', { locale: it })}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Generato il: {format(new Date(report.created_at), 'dd/MM/yyyy')} | 
                        Servizi: {report.servizi_ids.length}
                      </p>
                    </div>
                    <Button 
                      onClick={() => downloadReport(report.id)}
                    >
                      <DownloadIcon className="mr-2 h-4 w-4" />
                      Scarica Report
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-muted/30 p-6 rounded-lg text-center">
                <h2 className="text-xl font-medium mb-2">Nessun report disponibile</h2>
                <p className="text-muted-foreground mb-4">
                  Non ci sono dati disponibili per il periodo selezionato.
                </p>
                <Button variant="outline" disabled>
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  Scarica Report
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ClientDashboardLayout>
  );
}
