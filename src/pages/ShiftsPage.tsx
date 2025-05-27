
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftCalendar } from '@/components/shifts/ShiftCalendar';
import { AddShiftDialog } from '@/components/shifts/AddShiftDialog';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function ShiftsPage() {
  const { profile } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  return (
    <MainLayout>
      <ShiftProvider>
        <div className="min-h-screen bg-gray-50/30">
          <div className="container mx-auto p-4 md:p-6 space-y-6">
            {/* Header con breadcrumb */}
            <div className="space-y-4">
              <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">Turni</span>
              </nav>
              
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">Turni</h1>
                  <p className="text-muted-foreground text-lg">
                    Gestisci i turni di lavoro
                  </p>
                </div>
                
                <AddShiftDialog 
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  isAdminOrSocio={isAdminOrSocio}
                />
              </div>
            </div>

            <ShiftCalendar 
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              isAdminOrSocio={isAdminOrSocio}
            />
          </div>
        </div>
      </ShiftProvider>
    </MainLayout>
  );
}
