
import { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaList } from '@/components/aziende/AziendaList';
import { AziendaSheet } from '@/components/aziende/AziendaSheet';
import { AziendaDeleteDialog } from '@/components/aziende/AziendaDeleteDialog';
import { useAziende } from '@/hooks/useAziende';
import { useAuth } from '@/contexts/AuthContext';
import { Azienda } from '@/lib/types';
import { AziendaFormData } from '@/lib/api/aziende';
import { Loader2 } from 'lucide-react';

export default function AziendePage() {
  const { user } = useAuth();
  const {
    aziende,
    isLoading,
    isError,
    error,
    createCompany,
    updateCompany,
    deleteCompany,
    isCreating,
    isUpdating,
    isDeleting,
  } = useAziende();

  const [isAziendaSheetOpen, setIsAziendaSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);

  const handleAddAzienda = () => {
    console.log('[AziendePage] Starting creation of new company');
    setSelectedAzienda(null);
    setIsAziendaSheetOpen(true);
  };

  const handleEditAzienda = (azienda: Azienda) => {
    console.log('[AziendePage] Editing company:', azienda);
    setSelectedAzienda(azienda);
    setIsAziendaSheetOpen(true);
  };

  const handleDeleteAzienda = (azienda: Azienda) => {
    console.log('[AziendePage] Request to delete company:', azienda);
    setSelectedAzienda(azienda);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAzienda = (data: AziendaFormData) => {
    console.log('[AziendePage] Submitting company data:', data);
    if (selectedAzienda) {
      console.log(`[AziendePage] Updating existing company ID: ${selectedAzienda.id}`);
      updateCompany(selectedAzienda.id, data);
    } else {
      console.log('[AziendePage] Creating new company');
      createCompany(data);
    }
    setIsAziendaSheetOpen(false);
  };

  const handleConfirmDelete = () => {
    if (selectedAzienda) {
      console.log(`[AziendePage] Deletion confirmed for company ID: ${selectedAzienda.id}`);
      deleteCompany(selectedAzienda.id);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Caricamento aziende...</span>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="text-center p-12 text-destructive">
          Si è verificato un errore nel caricamento delle aziende. Si prega di riprovare più tardi.
          <div className="mt-2 text-sm text-muted-foreground">
            Dettaglio errore: {error instanceof Error ? error.message : 'Errore sconosciuto'}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Gestione Aziende</h1>
        
        <AziendaList
          aziende={aziende}
          onEdit={handleEditAzienda}
          onDelete={handleDeleteAzienda}
          onAddAzienda={handleAddAzienda}
        />
        
        <AziendaSheet
          isOpen={isAziendaSheetOpen}
          onOpenChange={setIsAziendaSheetOpen}
          onSubmit={handleSubmitAzienda}
          azienda={selectedAzienda}
          isSubmitting={isCreating || isUpdating}
        />
        
        <AziendaDeleteDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          azienda={selectedAzienda}
          isDeleting={isDeleting}
        />
      </div>
    </MainLayout>
  );
}
