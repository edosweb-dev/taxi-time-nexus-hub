
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { useReports } from '../hooks/useReports';
import { formatItalianDate } from '../utils/formatUtils';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';
import { useAuth } from '@/contexts/AuthContext';

export const ReportsList = () => {
  const { reports, isLoading, downloadReport } = useReports();
  const { users } = useUsers();
  const { aziende } = useAziende();
  const { profile } = useAuth();
  
  // For client view, filter reports by their azienda
  const filteredReports = profile?.role === 'cliente' && profile?.azienda_id
    ? reports.filter(report => report.azienda_id === profile.azienda_id)
    : reports;
  
  const getAziendaName = (aziendaId: string) => {
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : 'Azienda sconosciuta';
  };
  
  const getReferenteName = (referenteId: string) => {
    const referente = users.find(u => u.id === referenteId);
    return referente 
      ? `${referente.first_name || ''} ${referente.last_name || ''}`
      : 'Referente sconosciuto';
  };
  
  const getCreatorName = (creatorId: string) => {
    const creator = users.find(u => u.id === creatorId);
    return creator 
      ? `${creator.first_name || ''} ${creator.last_name || ''}`
      : 'Utente sconosciuto';
  };
  
  const formatMonthYear = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return format(date, 'MMMM yyyy', { locale: it });
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Caricamento report in corso...</div>
        </CardContent>
      </Card>
    );
  }
  
  if (filteredReports.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">Nessun report disponibile.</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report generati</CardTitle>
        <CardDescription>
          Lista dei report PDF generati per i servizi consuntivati
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left font-medium px-4 py-2">Azienda</th>
                <th className="text-left font-medium px-4 py-2">Referente</th>
                <th className="text-left font-medium px-4 py-2">Periodo</th>
                <th className="text-left font-medium px-4 py-2">Data generazione</th>
                <th className="text-left font-medium px-4 py-2">Creato da</th>
                <th className="text-left font-medium px-4 py-2">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.map((report) => (
                <tr key={report.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">{getAziendaName(report.azienda_id)}</td>
                  <td className="px-4 py-2">{getReferenteName(report.referente_id)}</td>
                  <td className="px-4 py-2">{formatMonthYear(report.month, report.year)}</td>
                  <td className="px-4 py-2">{formatItalianDate(report.created_at)}</td>
                  <td className="px-4 py-2">{getCreatorName(report.created_by)}</td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadReport(report.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Scarica
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
