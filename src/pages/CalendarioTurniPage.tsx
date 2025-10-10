import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { CalendarioTurniContent } from '@/components/calendario-turni/CalendarioTurniContent';
import { MobileCalendarioView } from '@/components/calendario-turni/mobile/MobileCalendarioView';
import { ChevronRight, Home, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLayout } from '@/contexts/LayoutContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function CalendarioTurniPage() {
  const { profile } = useAuth();
  const { setPaddingMode } = useLayout();
  const isMobile = useIsMobile();

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  useEffect(() => {
    // Nessun padding per mobile
    setPaddingMode('full-width');
    
    // Ripristina padding default quando si smonta
    return () => {
      setPaddingMode('default');
    };
  }, [setPaddingMode]);

  return (
    <MainLayout>
      <ShiftProvider>
        {isMobile ? (
          <MobileCalendarioView isAdminOrSocio={isAdminOrSocio} />
        ) : (
          <>
            <CalendarioTurniContent isAdminOrSocio={isAdminOrSocio} />
          </>
        )}
      </ShiftProvider>
    </MainLayout>
  );
}