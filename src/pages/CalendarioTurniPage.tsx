import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { CalendarioTurniContent } from '@/components/calendario-turni/CalendarioTurniContent';
import { MobileCalendarioView } from '@/components/calendario-turni/mobile/MobileCalendarioView';
import { AddShiftMobileEntry } from '@/components/shifts/mobile/AddShiftMobileEntry';
import { useAuth } from '@/contexts/AuthContext';
import { useLayout } from '@/contexts/LayoutContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSearchParams } from 'react-router-dom';
import { parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarioTurniPageProps {
  filterUserId?: string;
  showUserFilter?: boolean;
  layout?: 'main' | 'dipendente';
}

export default function CalendarioTurniPage({ 
  filterUserId, 
  showUserFilter = true,
  layout = 'main'
}: CalendarioTurniPageProps = {}) {
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

  const content = (
    <div className="w-full">
      <ShiftProvider>
        <div className={cn(
          "flex flex-col w-full",
          !isMobile && "px-4"
        )}>
          {isMobile ? (
            <MobileCalendarioView 
              isAdminOrSocio={isAdminOrSocio} 
              filterUserId={filterUserId}
            />
          ) : (
            <>
              <CalendarioTurniContent 
                isAdminOrSocio={isAdminOrSocio} 
                initialDate={initialDate}
                initialViewMode={initialViewMode}
                filterUserId={filterUserId}
                showUserFilter={showUserFilter}
              />
            </>
          )}
        </div>
        <AddShiftMobileEntry />
      </ShiftProvider>
    </div>
  );

  // Return content without layout wrapper if layout is 'dipendente'
  // (will be wrapped by DipendenteLayout)
  if (layout === 'dipendente') {
    return content;
  }

  return <MainLayout>{content}</MainLayout>;
}