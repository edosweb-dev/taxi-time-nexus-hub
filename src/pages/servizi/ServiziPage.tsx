
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ServiziContent } from '@/components/servizi/page/ServiziContent';
import { ServiziDialogManager } from '@/components/servizi/page/ServiziDialogManager';
import { ChevronRight, Home } from 'lucide-react';
import { useServiziPage } from '@/hooks/useServiziPage';
import { Servizio } from '@/lib/types/servizi';
import { RESPONSIVE_SPACING } from '@/hooks/useResponsiveSpacing';
import { MobileFirstServiziContent } from '@/components/servizi/mobile-first/MobileFirstServiziContent';

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

  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  const [showAssegnazioneDialog, setShowAssegnazioneDialog] = useState(false);
  const [showCompletaDialog, setShowCompletaDialog] = useState(false);
  const [showFirmaDialog, setShowFirmaDialog] = useState(false);

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
      <div className={`${RESPONSIVE_SPACING.SECTION_VERTICAL} pb-20 md:pb-0`}>
        {/* Breadcrumb Navigation - Solo su desktop */}
        <div className="hidden md:block">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Servizi</span>
          </nav>
        </div>

        {isMobile ? (
          <div className="-mx-5 sm:-mx-4 md:mx-0">
            <MobileFirstServiziContent 
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
          </div>
        ) : (

          <ServiziContent 
            servizi={servizi}
            users={users}
            isLoading={isLoading}
            error={error}
            isAdminOrSocio={isAdminOrSocio}
            isMobile={isMobile}
            onNavigateToDetail={handleNavigateToDetail}
            onNavigateToNewServizio={handleNavigateToNewServizio}
            onSelectServizio={handleSelectServizio}
            onCompleta={handleCompleta}
            onFirma={handleFirma}
            allServizi={servizi}
          />
        )}

        
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
      </div>
    </MainLayout>
  );
}
