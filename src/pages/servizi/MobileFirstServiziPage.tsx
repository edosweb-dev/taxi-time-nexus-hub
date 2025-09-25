import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { MobileFirstServiziContent } from '@/components/servizi/mobile-first/MobileFirstServiziContent';
import { ServiziDialogManager } from '@/components/servizi/page/ServiziDialogManager';
import { useServiziPage } from '@/hooks/useServiziPage';
import { Servizio } from '@/lib/types/servizi';

export default function MobileFirstServiziPage() {
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
      <div className="min-h-screen bg-gray-50">
        {/* Mobile-First Content with clean container system */}
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