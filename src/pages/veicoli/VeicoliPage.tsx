import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { VeicoliContent } from '@/components/veicoli/VeicoliContent';
import { ChevronRight, Home } from 'lucide-react';
import { useVeicoli } from '@/hooks/useVeicoli';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';
import { toast } from '@/components/ui/use-toast';
import { createVeicolo, updateVeicolo, deleteVeicolo } from '@/lib/api/veicoli';

export default function VeicoliPage() {
  const { veicoli, refetch } = useVeicoli();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedVeicolo, setSelectedVeicolo] = useState<Veicolo | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVeicolo = () => {
    setSelectedVeicolo(undefined);
    setIsSheetOpen(true);
  };

  const handleEditVeicolo = (veicolo: Veicolo) => {
    setSelectedVeicolo(veicolo);
    setIsSheetOpen(true);
  };

  const handleDeleteVeicolo = async (veicolo: Veicolo) => {
    if (confirm('Sei sicuro di voler eliminare questo veicolo?')) {
      try {
        await deleteVeicolo(veicolo.id);
        toast({
          title: "Veicolo eliminato",
          description: "Il veicolo è stato eliminato con successo.",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione del veicolo.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (data: VeicoloFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedVeicolo) {
        await updateVeicolo(selectedVeicolo.id, data);
        toast({
          title: "Veicolo aggiornato",
          description: "Il veicolo è stato aggiornato con successo.",
        });
      } else {
        await createVeicolo(data);
        toast({
          title: "Veicolo creato",
          description: "Il veicolo è stato creato con successo.",
        });
      }
      setIsSheetOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del veicolo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout 
      title="Veicoli" 
      showBottomNav={true}
    >
      <div className="space-y-3 md:space-y-6">
        {/* Header - Solo desktop */}
        <div className="space-y-4 hidden md:block">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title">Gestione Veicoli</h1>
              <p className="text-description">
                Amministra la flotta veicoli aziendale: modelli, targhe e disponibilità
              </p>
            </div>
          </div>
        </div>

        <VeicoliContent
          veicoli={veicoli}
          onEdit={handleEditVeicolo}
          onDelete={handleDeleteVeicolo}
          onAddVeicolo={handleAddVeicolo}
          onSubmit={handleSubmit}
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          selectedVeicolo={selectedVeicolo}
          isSubmitting={isSubmitting}
        />
      </div>
    </MainLayout>
  );
}
