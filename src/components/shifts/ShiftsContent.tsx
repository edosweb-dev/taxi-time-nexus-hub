import { useState } from 'react';
import { ShiftsStats } from './ShiftsStats';
import { ShiftCalendarView } from './calendar/ShiftCalendarView';
import { AddShiftDialog } from './AddShiftDialog';
import { UserFilterDropdown } from './filters/UserFilterDropdown';
import { ViewFilterDropdown } from './filters/ViewFilterDropdown';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Filter, Calendar, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ShiftsContentProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  isAdminOrSocio: boolean;
}

export function ShiftsContent({
  currentMonth,
  onMonthChange,
  isAdminOrSocio
}: ShiftsContentProps) {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  return (
    <div className="w-full space-y-6">
      {/* Statistics Dashboard */}
      <ShiftsStats />

      {/* Main Content */}
      <Tabs defaultValue="calendar" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-xs grid-cols-2">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendario
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Report
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            {/* Filters */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <UserFilterDropdown 
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
                showOnlyAdminAndSocio={false}
              />
              <ViewFilterDropdown 
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => navigate('/turni/report')}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Report Completo
              </Button>
              
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuovo Turno
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="calendar" className="w-full space-y-4">
          <div className="w-full bg-background border rounded-lg p-4">
            <ShiftCalendarView 
              currentMonth={currentMonth}
              onMonthChange={onMonthChange}
              isAdminOrSocio={isAdminOrSocio}
              selectedUserId={selectedUserId}
            />
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="bg-background border rounded-lg p-6">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Report Turni</h3>
              <p className="text-muted-foreground mb-4">
                Visualizza report dettagliati sui turni di lavoro
              </p>
              <Button onClick={() => navigate('/turni/report')}>
                Vai ai Report
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <AddShiftDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
      />
    </div>
  );
}