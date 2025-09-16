import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { MobileAziendaList } from '@/components/aziende/mobile-first/MobileAziendaList';
import { AziendaTableView } from '@/components/aziende/AziendaTableView';
import { AziendaFormManager } from '@/components/aziende/AziendaFormManager';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ChevronRight, Home, ArrowLeft, Grid3X3, List, Building2 } from 'lucide-react';
import { useAziende } from '@/hooks/useAziende';
import { Azienda } from '@/lib/types';
import { AziendaFormData } from '@/lib/api/aziende';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AziendePage() {
  const navigate = useNavigate();
  const { aziende, createCompany, updateCompany, deleteCompany, isCreating, isUpdating, isDeleting } = useAziende();
  const isMobile = useIsMobile();
  
  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    return localStorage.getItem('aziende-view-mode') as 'grid' | 'list' || 'grid';
  });
  
  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);

  // Update view mode with persistence
  const updateViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('aziende-view-mode', mode);
  };

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

  // Vista Lista = Full-page (no sidebar)
  if (viewMode === 'list') {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-40 bg-background border-b">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => updateViewMode('grid')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Torna a Griglia
              </Button>
              <h1 className="text-xl font-semibold">Aziende - Vista Lista</h1>
            </div>
            <Button onClick={handleAddAzienda}>
              <Building2 className="h-4 w-4 mr-2" />
              Nuova Azienda
            </Button>
          </div>
        </div>
        <div className="px-6 py-6">
          <AziendaTableView
            onEdit={handleEditAzienda}
            onDelete={handleDeleteAzienda}
            onView={handleViewAzienda}
            onAddAzienda={handleAddAzienda}
          />
        </div>
        
        <AziendaFormManager
          mode={isMobile ? 'sheet' : 'dialog'}
          isOpen={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleFormSubmit}
          azienda={selectedAzienda}
          isSubmitting={isCreating || isUpdating}
        />
      </div>
    );
  }

  // Vista Griglia = Layout standard con sidebar
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
            <div className="flex items-center gap-2">
              {!isMobile && (
                <ToggleGroup 
                  type="single" 
                  value={viewMode} 
                  onValueChange={(value) => value && updateViewMode(value as 'grid' | 'list')}
                  className="border"
                >
                  <ToggleGroupItem value="grid" className="px-3">
                    <Grid3X3 className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="list" className="px-3">
                    <List className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              )}
              <Button onClick={handleAddAzienda}>
                <Building2 className="h-4 w-4 mr-2" />
                Nuova Azienda
              </Button>
            </div>
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