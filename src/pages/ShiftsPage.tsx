
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftCalendar } from '@/components/shifts/ShiftCalendar';
import { AddShiftDialog } from '@/components/shifts/AddShiftDialog';
import { ShiftProvider } from '@/components/shifts/ShiftContext';
import { ChevronRight, Home, Plus, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ShiftsPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
  };

  return (
    <MainLayout>
      <ShiftProvider>
        <div className="h-full flex flex-col bg-gray-50/30">
          {/* Header con breadcrumb - fixed height */}
          <div className="flex-shrink-0 px-4 md:px-6 py-4 space-y-4 border-b bg-background/95 backdrop-blur">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Turni</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Turni</h1>
                <p className="text-muted-foreground">
                  Gestisci i turni di lavoro
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/turni/report')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Report
                </Button>
                
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Turno
                </Button>
              </div>
            </div>
          </div>

          {/* Calendar content - fills remaining space */}
          <div className="flex-1 px-2 md:px-4 py-2 md:py-4 overflow-hidden">
            <ShiftCalendar 
              currentMonth={currentMonth}
              onMonthChange={handleMonthChange}
              isAdminOrSocio={isAdminOrSocio}
            />
          </div>
        </div>

        <AddShiftDialog 
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          isAdminOrSocio={isAdminOrSocio}
        />
      </ShiftProvider>
    </MainLayout>
  );
}
