
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ShiftCalendar } from '@/components/shifts/ShiftCalendar';
import { ShiftList } from '@/components/shifts/ShiftList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AddShiftDialog } from '@/components/shifts/AddShiftDialog';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';
import { Plus, Calendar, List } from 'lucide-react';
import { ShiftProvider, useShifts } from '@/components/shifts/ShiftContext';

export default function ShiftsPage() {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>(isMobile ? 'list' : 'calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';

  const handleMonthChange = (newMonth: Date) => {
    setCurrentMonth(newMonth);
  };

  return (
    <MainLayout>
      <ShiftProvider>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestione Turni</h1>
              <p className="text-muted-foreground">
                {viewMode === 'calendar' 
                  ? `Visualizza e gestisci i turni` 
                  : 'Elenco turni'}
              </p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Tabs 
                defaultValue={viewMode} 
                value={viewMode}
                onValueChange={(value) => setViewMode(value as 'calendar' | 'list')}
                className="w-full sm:w-auto"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendario
                  </TabsTrigger>
                  <TabsTrigger value="list">
                    <List className="h-4 w-4 mr-2" />
                    Elenco
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="whitespace-nowrap">
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Turno
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow">
            {viewMode === 'calendar' ? (
              <ShiftCalendar 
                currentMonth={currentMonth}
                onMonthChange={handleMonthChange}
                isAdminOrSocio={isAdminOrSocio}
              />
            ) : (
              <ShiftList 
                currentMonth={currentMonth}
                onMonthChange={handleMonthChange}
                isAdminOrSocio={isAdminOrSocio}
              />
            )}
          </div>
        </div>

        <AddShiftDialog 
          open={isAddDialogOpen} 
          onOpenChange={setIsAddDialogOpen}
          isAdminOrSocio={isAdminOrSocio}
        />
      </ShiftProvider>
    </MainLayout>
  );
}
