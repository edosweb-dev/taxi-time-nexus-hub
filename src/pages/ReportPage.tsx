import React, { useState, useMemo } from 'react';
import { ArrowLeft, BarChart3, Download, Share2, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ReportFilters, ReportFiltersData } from '@/components/report/ReportFilters';
import { ReportStats } from '@/components/report/ReportStats';
import { ReportCharts } from '@/components/report/ReportCharts';
import { ReportTables } from '@/components/report/ReportTables';
import { useServizi } from '@/hooks/useServizi';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';
import { useVeicoli } from '@/hooks/useVeicoli';
import { toast } from '@/hooks/use-toast';

export default function ReportPage() {
  const navigate = useNavigate();
  const { servizi = [], isLoading } = useServizi();
  const { users = [] } = useUsers();
  const { aziende = [] } = useAziende();
  const { veicoli = [] } = useVeicoli();

  const [filters, setFilters] = useState<ReportFiltersData>({
    aziendaId: '',
    referenteId: '',
    conducenteId: '',
    veicoloId: '',
    statoServizi: [],
    dataInizio: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Primo del mese corrente
    dataFine: new Date()
  });

  // Filter data by user roles
  const referenti = users.filter(user => user.role === 'cliente');
  const conducenti = users.filter(user => ['dipendente', 'admin', 'socio'].includes(user.role));

  // Apply filters to servizi
  const filteredServizi = useMemo(() => {
    return servizi.filter(servizio => {
      // Filter by azienda
      if (filters.aziendaId && servizio.azienda_id !== filters.aziendaId) {
        return false;
      }

      // Filter by referente
      if (filters.referenteId && servizio.referente_id !== filters.referenteId) {
        return false;
      }

      // Filter by conducente
      if (filters.conducenteId && servizio.assegnato_a !== filters.conducenteId) {
        return false;
      }

      // Filter by veicolo
      if (filters.veicoloId && servizio.veicolo_id !== filters.veicoloId) {
        return false;
      }

      // Filter by stati
      if (filters.statoServizi.length > 0 && !filters.statoServizi.includes(servizio.stato)) {
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

  // Calculate statistics
  const stats = useMemo(() => {
    const totalServizi = filteredServizi.length;
    const serviziCompletati = filteredServizi.filter(s => s.stato === 'completato').length;
    const totalFatturato = filteredServizi.reduce((sum, s) => sum + (s.incasso_ricevuto || s.incasso_previsto || 0), 0);
    const totalOre = filteredServizi.reduce((sum, s) => sum + (s.ore_effettive || 2), 0); // Default 2h per servizio
    const totalKm = filteredServizi.length * 25; // Stima 25km per servizio
    
    // Unique conducenti attivi
    const conducentiAttivi = new Set(filteredServizi.filter(s => s.assegnato_a).map(s => s.assegnato_a)).size;
    
    // Unique veicoli utilizzati
    const veicoliUtilizzati = new Set(filteredServizi.filter(s => s.veicolo_id).map(s => s.veicolo_id)).size;

    return {
      totalServizi,
      totalFatturato,
      totalKm,
      totalOre,
      serviziCompletati,
      conducentiAttivi,
      veicoliUtilizzati
    };
  }, [filteredServizi]);

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    toast({
      title: "Export PDF",
      description: "Funzionalità in sviluppo. Il report sarà disponibile a breve.",
    });
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: 'Report Servizi Taxi Time',
        text: `Report dal ${filters.dataInizio?.toLocaleDateString('it-IT')} al ${filters.dataFine?.toLocaleDateString('it-IT')}`,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copiato",
          description: "Il link del report è stato copiato negli appunti.",
        });
      });
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header con back button */}
        <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="min-h-[44px]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Report Servizi
                </h1>
                <p className="text-sm text-muted-foreground">
                  {filteredServizi.length} servizi nel periodo selezionato
                </p>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleExportPDF}
                className="min-h-[44px]"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShare}
                className="min-h-[44px]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Condividi
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-4">
          {/* Filtri Report */}
          <ReportFilters
            filters={filters}
            onFiltersChange={setFilters}
            aziende={aziende}
            referenti={referenti}
            conducenti={conducenti}
            veicoli={veicoli}
          />

          {/* Statistiche Overview */}
          <ReportStats
            totalServizi={stats.totalServizi}
            totalFatturato={stats.totalFatturato}
            totalKm={stats.totalKm}
            totalOre={stats.totalOre}
            serviziCompletati={stats.serviziCompletati}
            conducentiAttivi={stats.conducentiAttivi}
            veicoliUtilizzati={stats.veicoliUtilizzati}
          />

          {/* Grafici e Dettagli */}
          <ReportCharts
            servizi={filteredServizi}
            aziende={aziende}
            conducenti={conducenti}
            veicoli={veicoli}
          />

          {/* Tabelle Dettagliate */}
          <ReportTables
            servizi={filteredServizi}
            aziende={aziende}
            conducenti={conducenti}
            veicoli={veicoli}
          />
        </div>
      </div>
    </MainLayout>
  );
}