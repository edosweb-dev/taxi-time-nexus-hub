
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftsContent } from '@/components/shifts/ShiftsContent';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ShiftsPage() {
  const { profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  return (
    <MainLayout>
      <ShiftProvider>
        <div className="max-w-none w-full space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Turni</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h1 className="page-title">Gestione Turni</h1>
                <p className="text-description">
                  Pianifica e monitora i turni di lavoro del personale
                </p>
              </div>
            </div>
          </div>

          <ShiftsContent
            currentMonth={currentMonth}
            onMonthChange={handleMonthChange}
            isAdminOrSocio={isAdminOrSocio}
          />
        </div>
      </ShiftProvider>
    </MainLayout>
  );
}
