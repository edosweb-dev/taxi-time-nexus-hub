import { useState } from 'react';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarSidebar } from './calendar/CalendarSidebar';
import { ShiftCreateDialog } from './dialogs/ShiftCreateDialog';
import { ShiftEditDialog } from './dialogs/ShiftEditDialog';
import { BatchShiftForm } from '@/components/shifts/BatchShiftForm';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Shift } from '@/components/shifts/types';

interface ShiftManagementContentProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isAdminOrSocio: boolean;
}

export function ShiftManagementContent({
  currentDate,
  onDateChange,
  isAdminOrSocio
}: ShiftManagementContentProps) {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [batchFormOpen, setBatchFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

  const handleCreateShift = (date: Date) => {
    setSelectedDate(date);
    setCreateDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Batch Shift Form */}
      {batchFormOpen && (
        <BatchShiftForm 
          currentMonth={currentDate}
          onClose={() => setBatchFormOpen(false)}
        />
      )}

      <div className="h-[calc(100vh-200px)] flex">
        {/* Main Calendar - Full Width */}
        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 overflow-hidden">
            {/* Header with Batch Creation Button */}
            <div className="border-b bg-muted/20 p-3">
              <div className="flex items-center justify-between">
                <CalendarHeader
                  currentDate={currentDate}
                  onDateChange={onDateChange}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
                
                {isAdminOrSocio && (
                  <Button 
                    size="sm" 
                    onClick={() => setBatchFormOpen(true)} 
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Inserisci turni
                  </Button>
                )}
              </div>
            </div>

            {/* Calendar Grid */}
            <CalendarGrid
              currentDate={currentDate}
              viewMode={viewMode}
              selectedUsers={[]} // Show all users by default
              onCreateShift={handleCreateShift}
              onEditShift={handleEditShift}
            />
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <ShiftCreateDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        selectedDate={selectedDate}
        isAdminOrSocio={isAdminOrSocio}
      />

      <ShiftEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        shift={selectedShift}
        isAdminOrSocio={isAdminOrSocio}
      />
    </div>
  );
}