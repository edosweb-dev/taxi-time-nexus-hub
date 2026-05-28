import React, { useState, useEffect, useRef } from 'react';
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
  const { aziende, deleteCompany, isDeleting } = useAziende();
  const isMobile = useIsMobile();
  const { setPaddingMode } = useLayout();

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
    navigate('/aziende/nuovo');
  };

  const handleViewAzienda = (azienda: Azienda) => {
    navigate(`/aziende/${azienda.id}`);
  };

  const handleEditAzienda = (azienda: Azienda) => {
    navigate(`/aziende/${azienda.id}/modifica`);
  };

  const handleDeleteAzienda = (azienda: Azienda) => {
    setAziendaToDelete(azienda);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (aziendaToDelete) {
      deleteCompany(aziendaToDelete.id);
    }
  };

  const wasDeletingRef = useRef(false);
  useEffect(() => {
    if (isDeleting) {
      wasDeletingRef.current = true;
    } else if (wasDeletingRef.current) {
      wasDeletingRef.current = false;
      setDeleteDialogOpen(false);
      setAziendaToDelete(null);
    }
  }, [isDeleting]);

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

        <DeleteAziendaDialog
          azienda={aziendaToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDelete}
          isDeleting={isDeleting}
        />
        </div>
      </div>
    </MainLayout>
  );
}