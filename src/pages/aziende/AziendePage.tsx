import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { DesktopAziendaList } from '@/components/aziende/DesktopAziendaList';
import { MobileAziendaList } from '@/components/aziende/mobile-first/MobileAziendaList';
import { AziendaFormManager } from '@/components/aziende/AziendaFormManager';
import { DeleteAziendaDialog } from '@/components/aziende/DeleteAziendaDialog';
import { ChevronRight, Home } from 'lucide-react';
import { useAziende } from '@/hooks/useAziende';
import { Azienda } from '@/lib/types';
import { AziendaFormData } from '@/lib/api/aziende';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLayout } from '@/contexts/LayoutContext';

export default function AziendePage() {
  const navigate = useNavigate();
  const { aziende, createCompany, updateCompany, deleteCompany, isCreating, isUpdating, isDeleting } = useAziende();
  const isMobile = useIsMobile();
  const { setPaddingMode } = useLayout();
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);

  useEffect(() => {
    if (isMobile) {
      setPaddingMode('full-width');
    }
    return () => setPaddingMode('default');
  }, [isMobile, setPaddingMode]);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [aziendaToDelete, setAziendaToDelete] = useState<Azienda | null>(null);

  const handleAddAzienda = () => {
    setSelectedAzienda(null);
    setIsFormOpen(true);
  };

  const handleViewAzienda = (azienda: Azienda) => {
    navigate(`/aziende/${azienda.id}`);
  };

  const handleEditAzienda = (azienda: Azienda) => {
    setSelectedAzienda(azienda);
    setIsFormOpen(true);
  };

  const handleDeleteAzienda = (azienda: Azienda) => {
    setAziendaToDelete(azienda);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (aziendaToDelete) {
      deleteCompany(aziendaToDelete.id);
      setDeleteDialogOpen(false);
      setAziendaToDelete(null);
    }
  };

  const handleFormSubmit = (data: AziendaFormData) => {
    if (selectedAzienda) {
      updateCompany(selectedAzienda.id, data);
    } else {
      createCompany(data);
    }
    setIsFormOpen(false);
    setSelectedAzienda(null);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedAzienda(null);
  };

  // Vista Griglia - Layout standard con sidebar
  return (
    <MainLayout 
      title="Aziende" 
      showBottomNav={true}
    >
      <div className="w-full px-0 md:px-4">
        <div className="space-y-6">
          {isMobile ? (
            <MobileAziendaList
            aziende={aziende}
            onEdit={handleEditAzienda}
            onDelete={handleDeleteAzienda}
            onView={handleViewAzienda}
            onAddAzienda={handleAddAzienda}
          />
        ) : (
          <DesktopAziendaList 
            aziende={aziende}
            onEdit={handleEditAzienda}
            onDelete={handleDeleteAzienda}
            onView={handleViewAzienda}
            onAddAzienda={handleAddAzienda}
          />
        )}

        <AziendaFormManager
          mode={isMobile ? 'sheet' : 'dialog'}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleFormSubmit}
          azienda={selectedAzienda}
          isSubmitting={isCreating || isUpdating}
        />

        <DeleteAziendaDialog
          azienda={aziendaToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
        />
        </div>
      </div>
    </MainLayout>
  );
}