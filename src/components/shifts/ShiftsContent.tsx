import { useState } from 'react';
import { ShiftGridView } from './grid/ShiftGridView';
import { BatchShiftForm } from './BatchShiftForm';
import { ShiftCreationProgressDialog } from './dialogs/ShiftCreationProgressDialog';
import { UserFilterDropdown } from './filters/UserFilterDropdown';
import { ViewFilterDropdown } from './filters/ViewFilterDropdown';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plus, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfWeek, endOfWeek } from 'date-fns';
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
  
  // Progress dialog state
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [totalShifts, setTotalShifts] = useState(0);
  const [createdShifts, setCreatedShifts] = useState(0);
  const [errorShifts, setErrorShifts] = useState(0);
  const [isCreationComplete, setIsCreationComplete] = useState(false);

  const handleUsersChange = (userIds: string[]) => {
    setSelectedUserIds(userIds);
  };

  const handleViewModeChange = (mode: "month" | "week" | "day") => {
    setViewMode(mode);
  };

  const handlePrevious = () => {
    let newDate: Date;
    switch (viewMode) {
      case 'month':
        newDate = subMonths(currentMonth, 1);
        break;
      case 'week':
        newDate = subWeeks(currentMonth, 1);
        break;
      case 'day':
        newDate = subDays(currentMonth, 1);
        break;
      default:
        newDate = subMonths(currentMonth, 1);
    }
    onMonthChange(newDate);
  };

  const handleNext = () => {
    let newDate: Date;
    switch (viewMode) {
      case 'month':
        newDate = addMonths(currentMonth, 1);
        break;
      case 'week':
        newDate = addWeeks(currentMonth, 1);
        break;
      case 'day':
        newDate = addDays(currentMonth, 1);
        break;
      default:
        newDate = addMonths(currentMonth, 1);
    }
    onMonthChange(newDate);
  };

  const getPeriodDisplay = () => {
    switch (viewMode) {
      case 'month':
        return format(currentMonth, 'MMMM yyyy', { locale: it });
      case 'week':
        const weekStart = startOfWeek(currentMonth, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentMonth, { weekStartsOn: 1 });
        return `${format(weekStart, 'd MMM', { locale: it })} - ${format(weekEnd, 'd MMM yyyy', { locale: it })}`;
      case 'day':
        return format(currentMonth, 'd MMMM yyyy', { locale: it });
      default:
        return format(currentMonth, 'MMMM yyyy', { locale: it });
    }
  };

  const handleStartProgress = (total: number) => {
    setTotalShifts(total);
    setCreatedShifts(0);
    setErrorShifts(0);
    setIsCreationComplete(false);
    setShowProgressDialog(true);
  };

  const handleUpdateProgress = (created: number, errors: number) => {
    setCreatedShifts(created);
    setErrorShifts(errors);
  };

  const handleCompleteProgress = () => {
    setIsCreationComplete(true);
  };

  const handleProgressDialogClose = () => {
    setShowProgressDialog(false);
    setTotalShifts(0);
    setCreatedShifts(0);
    setErrorShifts(0);
    setIsCreationComplete(false);
  };

  return (
    <div className="space-y-6">
      {/* Batch Shift Form */}
      {isDialogOpen && (
        <BatchShiftForm 
          currentMonth={currentMonth}
          onClose={() => setIsDialogOpen(false)}
          onStartProgress={handleStartProgress}
          onUpdateProgress={handleUpdateProgress}
          onCompleteProgress={handleCompleteProgress}
        />
      )}

      {/* Main Content Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="border-b bg-muted/20 p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Current Period Display con controlli di navigazione */}
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePrevious}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-center min-w-[200px]">
                  <h2 className="text-base font-semibold text-primary">
                    {getPeriodDisplay()}
                  </h2>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNext}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
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

          {/* Griglia sempre uguale per tutte le viste */}
          <ShiftGridView 
            currentMonth={currentMonth}
            selectedUserIds={selectedUserIds}
            viewMode={viewMode}
          />
        </CardContent>
      </Card>

      {/* Progress Dialog */}
      <ShiftCreationProgressDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        totalShifts={totalShifts}
        createdShifts={createdShifts}
        errorShifts={errorShifts}
        isComplete={isCreationComplete}
        onClose={handleProgressDialogClose}
      />
    </div>
  );
}