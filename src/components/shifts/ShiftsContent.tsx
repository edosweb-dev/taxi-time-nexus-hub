import { useState } from 'react';
import { ShiftGridView } from './grid/ShiftGridView';
import { ShiftCalendarView } from './calendar/ShiftCalendarView';
import { BatchShiftForm } from './BatchShiftForm';
import { UserFilterDropdown } from './filters/UserFilterDropdown';
import { ViewFilterDropdown } from './filters/ViewFilterDropdown';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Download } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  const handleUsersChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
  };

  const handleViewModeChange = (mode: "month" | "week" | "day") => {
    setViewMode(mode);
  };

  return (
    <div className="space-y-6">
      {/* Batch Shift Form */}
      {isDialogOpen && (
        <BatchShiftForm 
          currentMonth={currentMonth}
          onClose={() => setIsDialogOpen(false)}
        />
      )}

      {/* Main Content Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="border-b bg-muted/20 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Current Period Display */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <h2 className="text-base font-semibold text-primary">
                    {format(currentMonth, 'MMMM yyyy', { locale: it })}
                  </h2>
                </div>
              </div>

              {/* Filters and Actions */}
              <div className="flex items-center gap-2">
                <ViewFilterDropdown 
                  viewMode={viewMode}
                  onViewModeChange={handleViewModeChange}
                />
                
                <UserFilterDropdown 
                  onSelectUsers={handleUsersChange}
                  selectedUserIds={selectedUserIds}
                />
                
                <Separator orientation="vertical" className="h-6" />
                
                {isAdminOrSocio && (
                  <>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Esporta
                    </Button>
                    
                    <Button size="sm" onClick={() => setIsDialogOpen(true)} className="gap-2">
                      <Plus className="h-4 w-4" />
                      Inserisci turni
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Views */}
          {viewMode === "month" ? (
            <ShiftGridView 
              currentMonth={currentMonth}
              selectedUserIds={selectedUserIds}
            />
          ) : (
            <ShiftCalendarView
              currentMonth={currentMonth}
              onMonthChange={onMonthChange}
              isAdminOrSocio={isAdminOrSocio}
              selectedUserIds={selectedUserIds}
            />
          )}
        </CardContent>
      </Card>

    </div>
  );
}