import { useState } from 'react';
import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { StipendiStats } from '@/components/dipendente/stipendi/StipendiStats';
import { StipendiFilters } from '@/components/dipendente/stipendi/StipendiFilters';
import { StipendiList } from '@/components/dipendente/stipendi/StipendiList';
import { StipendioDetailSheet } from '@/components/dipendente/stipendi/StipendioDetailSheet';
import { useStipendiDipendente, useAnniDisponibili } from '@/hooks/dipendente/useStipendiDipendente';

export default function StipendiPage() {
  const currentYear = new Date().getFullYear();
  
  // Filter states
  const [selectedAnno, setSelectedAnno] = useState<number>(currentYear);
  const [selectedStato, setSelectedStato] = useState<string>('tutti');
  const [selectedStipendioId, setSelectedStipendioId] = useState<string | null>(null);

  // Fetch available years
  const { data: anniDisponibili = [currentYear] } = useAnniDisponibili();

  // Build filters
  const filters = {
    anno: selectedAnno,
    stato: selectedStato !== 'tutti' ? (selectedStato as 'confermato' | 'pagato') : undefined,
  };

  // Fetch data
  const { stipendi, stats, isLoading } = useStipendiDipendente(filters);

  // Find selected stipendio for detail view
  const selectedStipendio = stipendi.find(s => s.id === selectedStipendioId) || null;

  const handleAnnoChange = (anno: number) => {
    setSelectedAnno(anno);
  };

  const handleStatoChange = (stato: string) => {
    setSelectedStato(stato);
  };

  const handleStipendioClick = (stipendioId: string) => {
    setSelectedStipendioId(stipendioId);
  };

  const handleCloseDetail = () => {
    setSelectedStipendioId(null);
  };

  return (
    <DipendenteLayout title="I Miei Stipendi">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span>💰</span>
            I Miei Stipendi
          </h1>
        </div>

        {/* Stats */}
        {!isLoading && stipendi.length > 0 && (
          <StipendiStats stats={stats} anno={selectedAnno} />
        )}

        {/* Filters */}
        <StipendiFilters
          anni={anniDisponibili}
          selectedAnno={selectedAnno}
          onAnnoChange={handleAnnoChange}
          selectedStato={selectedStato}
          onStatoChange={handleStatoChange}
        />

        {/* List */}
        <StipendiList
          stipendi={stipendi}
          isLoading={isLoading}
          anno={selectedAnno}
          onStipendioClick={handleStipendioClick}
        />

        {/* Detail Sheet */}
        <StipendioDetailSheet
          open={!!selectedStipendioId}
          onOpenChange={(open) => !open && handleCloseDetail()}
          stipendio={selectedStipendio}
        />
      </div>
    </DipendenteLayout>
  );
}
