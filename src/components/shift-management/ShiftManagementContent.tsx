import { useState } from 'react';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { CalendarSidebar } from './calendar/CalendarSidebar';
import { ShiftCreateDialog } from './dialogs/ShiftCreateDialog';
import { ShiftEditDialog } from './dialogs/ShiftEditDialog';
import { BatchShiftForm } from '@/components/shifts/BatchShiftForm';
import { ShiftFilters } from './components/ShiftFilters';
import { ShiftExportDialog } from './components/ShiftExportDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
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
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
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

      <div className="h-[calc(100vh-200px)] flex gap-6">
        {/* Sidebar with filters */}
        <div className="w-80 flex-shrink-0 space-y-4">
          <ShiftFilters
            selectedUsers={selectedUsers}
            onUsersChange={setSelectedUsers}
            isAdminOrSocio={isAdminOrSocio}
          />
        </div>

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
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => setExportDialogOpen(true)} 
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Esporta
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => setBatchFormOpen(true)} 
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Inserisci turni
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Calendar Grid */}
            <CalendarGrid
              currentDate={currentDate}
              viewMode={viewMode}
              selectedUsers={selectedUsers}
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

      <ShiftExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        currentDate={currentDate}
      />
    </div>
  );
}