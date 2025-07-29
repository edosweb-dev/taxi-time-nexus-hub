import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaList } from '@/components/aziende/AziendaList';
import { AziendaSheet } from '@/components/aziende/AziendaSheet';
import { ChevronRight, Home } from 'lucide-react';
import { useAziende } from '@/hooks/useAziende';
import { Azienda } from '@/lib/types';
import { AziendaFormData } from '@/lib/api/aziende';
import { toast } from '@/components/ui/use-toast';
import { createAzienda, updateAzienda, deleteAzienda } from '@/lib/api/aziende';

export default function AziendePage() {
  const navigate = useNavigate();
  const { aziende, refetch } = useAziende();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAzienda = () => {
    navigate('/nuova-azienda');
  };

  const handleViewAzienda = (azienda: Azienda) => {
    navigate(`/aziende/${azienda.id}`);
  };

  const handleEditAzienda = (azienda: Azienda) => {
    setSelectedAzienda(azienda);
    setIsSheetOpen(true);
  };

  const handleDeleteAzienda = async (azienda: Azienda) => {
    if (confirm('Sei sicuro di voler eliminare questa azienda?')) {
      try {
        await deleteAzienda(azienda.id);
        toast({
          title: "Azienda eliminata",
          description: "L'azienda è stata eliminata con successo.",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione dell'azienda.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (data: AziendaFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedAzienda) {
        await updateAzienda(selectedAzienda.id, data);
        toast({
          title: "Azienda aggiornata",
          description: "L'azienda è stata aggiornata con successo.",
        });
      } else {
        await createAzienda(data);
        toast({
          title: "Azienda creata",
          description: "L'azienda è stata creata con successo.",
        });
      }
      setIsSheetOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dell'azienda.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con breadcrumb */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Aziende</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title">Aziende</h1>
              <p className="text-description">
                Gestisci le aziende clienti
              </p>
            </div>
          </div>
        </div>

        <AziendaList 
          aziende={aziende}
          onEdit={handleEditAzienda}
          onDelete={handleDeleteAzienda}
          onView={handleViewAzienda}
          onAddAzienda={handleAddAzienda}
        />

        <AziendaSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onSubmit={handleSubmit}
          azienda={selectedAzienda}
          isSubmitting={isSubmitting}
        />
      </div>
    </MainLayout>
  );
}