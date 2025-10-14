import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { CalendarioTurniContent } from '@/components/calendario-turni/CalendarioTurniContent';
import { MobileCalendarioView } from '@/components/calendario-turni/mobile/MobileCalendarioView';
import { AddShiftMobileEntry } from '@/components/shifts/mobile/AddShiftMobileEntry';
import { ChevronRight, Home, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLayout } from '@/contexts/LayoutContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams } from 'react-router-dom';
import { parseISO, isValid } from 'date-fns';

export default function CalendarioTurniPage() {
  const { profile } = useAuth();
  const { setPaddingMode } = useLayout();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();

  // Parse URL parameters
  const initialDate = React.useMemo(() => {
    const dateParam = searchParams.get('date');
    if (dateParam) {
      const parsedDate = parseISO(dateParam);
      return isValid(parsedDate) ? parsedDate : undefined;
    }
    return undefined;
  }, [searchParams]);

  const initialViewMode = React.useMemo(() => {
    const viewParam = searchParams.get('view');
    if (viewParam === 'day' || viewParam === 'week' || viewParam === 'month') {
      return viewParam;
    }
    return undefined;
  }, [searchParams]);

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
                <CalendarioTurniContent 
                  isAdminOrSocio={isAdminOrSocio} 
                  initialDate={initialDate}
                  initialViewMode={initialViewMode}
                />
              </>
            )}
          </div>
          <AddShiftMobileEntry />
        </ShiftProvider>
      </div>
    </MainLayout>
  );
}