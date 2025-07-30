import { useState } from 'react';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';
import { ShiftCreateDialog } from './dialogs/ShiftCreateDialog';
import { ShiftEditDialog } from './dialogs/ShiftEditDialog';
import { BatchShiftForm } from '@/components/shifts/BatchShiftForm';
import { ShiftCreationProgressDialog } from '@/components/shifts/dialogs/ShiftCreationProgressDialog';
import { ShiftExportDialog } from './components/ShiftExportDialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
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
  const { users } = useUsers();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [batchFormOpen, setBatchFormOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  
  // Progress dialog state
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [totalShifts, setTotalShifts] = useState(0);
  const [createdShifts, setCreatedShifts] = useState(0);
  const [errorShifts, setErrorShifts] = useState(0);
  const [isCreationComplete, setIsCreationComplete] = useState(false);

  const handleCreateShift = (date: Date) => {
    setSelectedDate(date);
    setCreateDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setEditDialogOpen(true);
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
      {batchFormOpen && (
        <BatchShiftForm 
          currentMonth={currentDate}
          onClose={() => setBatchFormOpen(false)}
          onStartProgress={handleStartProgress}
          onUpdateProgress={handleUpdateProgress}
          onCompleteProgress={handleCompleteProgress}
        />
      )}

      <div className="h-[calc(100vh-220px)] flex">
        {/* Main Calendar - Full Width */}
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <Card className="flex-1 overflow-hidden">
            {/* Header with filters and actions */}
            <div className="border-b bg-white px-4 py-2">
              <div className="flex items-center justify-between gap-3">
                <CalendarHeader
                  currentDate={currentDate}
                  onDateChange={onDateChange}
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
                
                <div className="flex items-center gap-2">
                  {/* User Filter */}
                  {isAdminOrSocio && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Utente:</span>
                      <Select 
                        value={selectedUsers.length === 1 ? selectedUsers[0] : 'all'} 
                        onValueChange={(value) => setSelectedUsers(value === 'all' ? [] : [value])}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue placeholder="Filtra per utente" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tutti gli utenti</SelectItem>
                          {users
                            .filter(user => user.role === 'admin' || user.role === 'socio' || user.role === 'dipendente')
                            .map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: user.color || '#6B7280' }}
                                />
                                {user.first_name} {user.last_name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {isAdminOrSocio && (
                    <div className="flex items-center gap-1.5">
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