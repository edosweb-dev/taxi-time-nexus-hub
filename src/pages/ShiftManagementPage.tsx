import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftManagementContent } from '@/components/shift-management/ShiftManagementContent';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ShiftManagementPage() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  return (
    <MainLayout>
      <ShiftProvider>
        <div className="space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Gestione Turni</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h1 className="page-title">Gestione Turni - Calendario</h1>
                <p className="text-description">
                  Visualizza e gestisci i turni in stile Google Calendar
                </p>
              </div>
            </div>
          </div>

          <ShiftManagementContent
            currentDate={currentDate}
            onDateChange={handleDateChange}
            isAdminOrSocio={isAdminOrSocio}
          />
        </div>
      </ShiftProvider>
    </MainLayout>
  );
}