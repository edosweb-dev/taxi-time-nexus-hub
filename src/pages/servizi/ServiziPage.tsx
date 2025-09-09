
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ResponsiveServiziContent } from '@/components/servizi/ResponsiveServiziContent';
import { ServiziDialogManager } from '@/components/servizi/page/ServiziDialogManager';
import { ChevronRight, Home } from 'lucide-react';
import { useServiziPage } from '@/hooks/useServiziPage';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';
import { Servizio } from '@/lib/types/servizi';
import { MobileOptimizedServiziPage } from '@/components/mobile-first/MobileOptimizedServiziPage';


export default function ServiziPage() {
  const {
    servizi,
    isLoading,
    error,
    users,
    isAdminOrSocio,
    isMobile,
    refetch,
    handleNavigateToDetail,
    handleNavigateToNewServizio,
  } = useServiziPage();
  
  const { headingClass, sectionSpacing } = useResponsiveStyles();
  
  // All hooks must be called before any conditional returns
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  const [showAssegnazioneDialog, setShowAssegnazioneDialog] = useState(false);
  const [showCompletaDialog, setShowCompletaDialog] = useState(false);
  const [showFirmaDialog, setShowFirmaDialog] = useState(false);

  // Mobile optimization - return mobile component if on mobile
  if (isMobile) {
    return <MobileOptimizedServiziPage />;
  }

  const handleSelectServizio = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowAssegnazioneDialog(true);
  };

  const handleCompleta = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowCompletaDialog(true);
  };

  const handleFirma = (servizio: Servizio) => {
    setSelectedServizio(servizio);
    setShowFirmaDialog(true);
  };

  const handleCloseDialogs = () => {
    setSelectedServizio(null);
    setShowAssegnazioneDialog(false);
    setShowCompletaDialog(false);
    setShowFirmaDialog(false);
  };

  return (
    <MainLayout>
      {/* Breadcrumb Navigation - Solo su desktop */}
      {!isMobile && (
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Servizi</span>
          </nav>
        </div>
      )}

      {/* Responsive content optimized for mobile and desktop */}
      <ResponsiveServiziContent
        servizi={servizi}
        users={users}
        isLoading={isLoading}
        error={error}
        isAdminOrSocio={isAdminOrSocio}
        onNavigateToDetail={handleNavigateToDetail}
        onNavigateToNewServizio={handleNavigateToNewServizio}
        onSelectServizio={handleSelectServizio}
        onCompleta={handleCompleta}
        onFirma={handleFirma}
        allServizi={servizi}
      />
      
      <ServiziDialogManager
        onRefetch={refetch}
        selectedServizio={selectedServizio}
        showAssegnazioneDialog={showAssegnazioneDialog}
        setShowAssegnazioneDialog={setShowAssegnazioneDialog}
        showCompletaDialog={showCompletaDialog}
        setShowCompletaDialog={setShowCompletaDialog}
        showFirmaDialog={showFirmaDialog}
        setShowFirmaDialog={setShowFirmaDialog}
        onClose={handleCloseDialogs}
      />
    </MainLayout>
  );
}
