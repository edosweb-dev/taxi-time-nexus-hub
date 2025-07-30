import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { CalendarioTurniContent } from '@/components/calendario-turni/CalendarioTurniContent';
import { ChevronRight, Home, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLayout } from '@/contexts/LayoutContext';

export default function CalendarioTurniPage() {
  const { profile } = useAuth();
  const { setPaddingMode } = useLayout();

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  useEffect(() => {
    // Attiva padding ridotto quando si monta la pagina
    setPaddingMode('minimal');
    
    // Ripristina padding default quando si smonta
    return () => {
      setPaddingMode('default');
    };
  }, [setPaddingMode]);

  return (
    <MainLayout>
      <ShiftProvider>
        <div className="space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Calendario Turni</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h1 className="page-title flex items-center gap-2">
                  <Calendar className="h-8 w-8" />
                  Calendario Turni
                </h1>
                <p className="text-description">
                  Visualizza e gestisci i turni con calendario in stile Google Calendar
                </p>
              </div>
            </div>
          </div>

          <CalendarioTurniContent isAdminOrSocio={isAdminOrSocio} />
        </div>
      </ShiftProvider>
    </MainLayout>
  );
}