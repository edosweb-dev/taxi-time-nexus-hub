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
    if (isMobile) {
      setPaddingMode('full-width');
    }
    return () => setPaddingMode('default');
  }, [isMobile, setPaddingMode]);

  return (
    <MainLayout>
      <div className="w-full px-0 md:px-4">
        <ShiftProvider>
          <div className="flex flex-col items-start w-full">
            {isMobile ? (
              <MobileCalendarioView isAdminOrSocio={isAdminOrSocio} />
            ) : (
              <>
                <CalendarioTurniContent isAdminOrSocio={isAdminOrSocio} />
              </>
            )}
          </div>
        </ShiftProvider>
      </div>
    </MainLayout>
  );
}