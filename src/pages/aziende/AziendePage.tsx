import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { MobileAziendaList } from '@/components/aziende/mobile-first/MobileAziendaList';
import { AziendaFormManager } from '@/components/aziende/AziendaFormManager';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Building2 } from 'lucide-react';
import { useAziende } from '@/hooks/useAziende';
import { Azienda } from '@/lib/types';
import { AziendaFormData } from '@/lib/api/aziende';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AziendePage() {
  const navigate = useNavigate();
  const { aziende, createCompany, updateCompany, deleteCompany, isCreating, isUpdating, isDeleting } = useAziende();
  const isMobile = useIsMobile();
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);

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
    if (confirm('Sei sicuro di voler eliminare questa azienda?')) {
      deleteCompany(azienda.id);
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
      <div className="space-y-6">
        {/* Header with breadcrumb and controls */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Aziende</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="page-title">Aziende</h1>
              <p className="text-description hidden sm:block">
                Gestisci le aziende clienti
              </p>
            </div>
            <Button onClick={handleAddAzienda}>
              <Building2 className="h-4 w-4 mr-2" />
              Nuova Azienda
            </Button>
          </div>
        </div>

        <MobileAziendaList 
          aziende={aziende}
          onEdit={handleEditAzienda}
          onDelete={handleDeleteAzienda}
          onView={handleViewAzienda}
          onAddAzienda={handleAddAzienda}
        />

        <AziendaFormManager
          mode={isMobile ? 'sheet' : 'dialog'}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleFormSubmit}
          azienda={selectedAzienda}
          isSubmitting={isCreating || isUpdating}
        />
      </div>
    </MainLayout>
  );
}