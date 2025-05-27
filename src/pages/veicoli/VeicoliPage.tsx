
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { VeicoloList } from '@/components/veicoli/VeicoloList';
import { VeicoloDialog } from '@/components/veicoli/VeicoloDialog';
import { ChevronRight, Home } from 'lucide-react';
import { useVeicoli } from '@/hooks/useVeicoli';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';
import { toast } from '@/components/ui/use-toast';
import { createVeicolo, updateVeicolo, deleteVeicolo } from '@/lib/api/veicoli';

export default function VeicoliPage() {
  const { veicoli, refetch } = useVeicoli();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVeicolo, setSelectedVeicolo] = useState<Veicolo | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVeicolo = () => {
    setSelectedVeicolo(undefined);
    setIsDialogOpen(true);
  };

  const handleEditVeicolo = (veicolo: Veicolo) => {
    setSelectedVeicolo(veicolo);
    setIsDialogOpen(true);
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
      setIsDialogOpen(false);
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
    <MainLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Veicoli</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Veicoli</h1>
                <p className="text-muted-foreground text-lg">
                  Gestisci la flotta veicoli
                </p>
              </div>
            </div>
          </div>

          <VeicoloList 
            veicoli={veicoli}
            onEdit={handleEditVeicolo}
            onDelete={handleDeleteVeicolo}
          />

          <VeicoloDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            veicolo={selectedVeicolo}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </MainLayout>
  );
}
