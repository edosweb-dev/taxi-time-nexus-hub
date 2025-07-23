import { useState } from 'react';
import { ShiftsStats } from './ShiftsStats';
import { ShiftCalendarView } from './calendar/ShiftCalendarView';
import { AddShiftDialog } from './AddShiftDialog';
import { UserFilterDropdown } from './filters/UserFilterDropdown';
import { ViewFilterDropdown } from './filters/ViewFilterDropdown';

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
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  return (
    <div className="w-full space-y-6">
      {/* Statistics Dashboard */}
      <ShiftsStats />

      {/* Main Content */}
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/50 rounded-lg p-4 border">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Calendario Turni</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filters Section */}
          <div className="flex items-center gap-2 px-3 py-1 bg-background rounded-md border">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Filtri:</span>
            <UserFilterDropdown 
              selectedUserIds={selectedUserIds}
              onSelectUsers={setSelectedUserIds}
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

      {/* Calendar Content */}
      <div className="w-full bg-background border rounded-lg p-4">
        <ShiftCalendarView 
          currentMonth={currentMonth}
          onMonthChange={onMonthChange}
          isAdminOrSocio={isAdminOrSocio}
          selectedUserIds={selectedUserIds}
        />
      </div>

      <AddShiftDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
      />
    </div>
  );
}