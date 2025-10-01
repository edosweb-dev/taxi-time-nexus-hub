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
    // Per mobile view, nessun padding; per desktop, minimal
    setPaddingMode(isMobile ? 'full-width' : 'minimal');
    
    // Ripristina padding default quando si smonta
    return () => {
      setPaddingMode('default');
    };
  }, [setPaddingMode, isMobile]);

  return (
    <MainLayout>
      <ShiftProvider>
        {isMobile ? (
          <MobileCalendarioView isAdminOrSocio={isAdminOrSocio} />
        ) : (
          <>
            {/* Breadcrumb Navigation compatto */}
            <div className="mb-4">
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">Calendario Turni</span>
              </nav>
            </div>

            <CalendarioTurniContent isAdminOrSocio={isAdminOrSocio} />
          </>
        )}
      </ShiftProvider>
    </MainLayout>
  );
}