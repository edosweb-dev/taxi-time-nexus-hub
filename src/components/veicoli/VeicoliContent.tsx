import { useState } from 'react';
import { VeicoloList } from './VeicoloList';
import { VeicoliStats } from './VeicoliStats';
import { VeicoloSheet } from './VeicoloSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';

interface VeicoliContentProps {
  veicoli: Veicolo[];
  onEdit: (veicolo: Veicolo) => void;
  onDelete: (veicolo: Veicolo) => void;
  onAddVeicolo: () => void;
  onSubmit: (data: VeicoloFormData) => Promise<void>;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  selectedVeicolo: Veicolo | undefined;
  isSubmitting: boolean;
}

export function VeicoliContent({
  veicoli,
  onEdit,
  onDelete,
  onAddVeicolo,
  onSubmit,
  isSheetOpen,
  setIsSheetOpen,
  selectedVeicolo,
  isSubmitting,
}: VeicoliContentProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Filter vehicles by status
  const veicoliAttivi = veicoli.filter(v => v.attivo);
  const veicoliInattivi = veicoli.filter(v => !v.attivo);
  
  // Filter vehicles based on selected status
  const filteredVeicoli = statusFilter === 'all' 
    ? veicoli 
    : statusFilter === 'active' 
    ? veicoliAttivi 
    : veicoliInattivi;

  return (
    <div className="space-y-6">
      <VeicoliStats veicoli={veicoli} />

      <Tabs defaultValue="tutti" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tutti">Tutti i Veicoli</TabsTrigger>
          <TabsTrigger value="attivi">Attivi ({veicoliAttivi.length})</TabsTrigger>
          <TabsTrigger value="inattivi">Inattivi ({veicoliInattivi.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tutti" className="space-y-4">
          <VeicoloList 
            veicoli={veicoli}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddVeicolo={onAddVeicolo}
            title="Tutti i Veicoli"
            description="Gestione completa della flotta veicoli"
          />
        </TabsContent>
        
        <TabsContent value="attivi" className="space-y-4">
          <VeicoloList 
            veicoli={veicoliAttivi}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddVeicolo={onAddVeicolo}
            title="Veicoli Attivi"
            description="Veicoli disponibili per i servizi"
            showOnlyActive={true}
          />
        </TabsContent>

        <TabsContent value="inattivi" className="space-y-4">
          <VeicoloList 
            veicoli={veicoliInattivi}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddVeicolo={onAddVeicolo}
            title="Veicoli Inattivi"
            description="Veicoli non disponibili per i servizi"
            showOnlyInactive={true}
          />
        </TabsContent>
      </Tabs>

      <VeicoloSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        veicolo={selectedVeicolo}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}