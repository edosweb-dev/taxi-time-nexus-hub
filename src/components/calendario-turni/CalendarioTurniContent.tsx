import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Download, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Grid3X3, 
  Rows3, 
  Square,
  Users,
  Filter
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useShifts } from '@/components/shifts/ShiftContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { AddShiftDialog } from '@/components/shifts/AddShiftDialog';
import { EditShiftDialog } from '@/components/shifts/dialogs/EditShiftDialog';
import { ShiftQuickViewDialog } from '@/components/shifts/dialogs/ShiftQuickViewDialog';
import { BatchShiftForm } from '@/components/shifts/BatchShiftForm';
import { ShiftCreationProgressDialog } from '@/components/shifts/dialogs/ShiftCreationProgressDialog';
import { CalendarioView } from './CalendarioView';
import { InserimentoMassivoDialog } from './InserimentoMassivoDialog';
import { Shift } from '@/components/shifts/types';

interface CalendarioTurniContentProps {
  isAdminOrSocio: boolean;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarioTurniContent({ isAdminOrSocio }: CalendarioTurniContentProps) {
  const { users } = useUsers();
  const { shifts, isLoading, loadShifts } = useShifts();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [editShiftDialogOpen, setEditShiftDialogOpen] = useState(false);
  const [quickViewDialogOpen, setQuickViewDialogOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [inserimentoMassivoOpen, setInserimentoMassivoOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Progress dialog state
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [totalShifts, setTotalShifts] = useState(0);
  const [createdShifts, setCreatedShifts] = useState(0);
  const [errorShifts, setErrorShifts] = useState(0);
  const [isCreationComplete, setIsCreationComplete] = useState(false);

  // Get employees only (admin, socio, dipendente)
  const employees = users?.filter(user => 
    ['admin', 'socio', 'dipendente'].includes(user.role)
  ) || [];

  // Load shifts based on current date and view mode
  useEffect(() => {
    let start: Date, end: Date;
    
    switch (viewMode) {
      case 'month':
        start = startOfMonth(currentDate);
        end = endOfMonth(currentDate);
        break;
      case 'week':
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = endOfWeek(currentDate, { weekStartsOn: 1 });
        break;
      case 'day':
        start = startOfDay(currentDate);
        end = endOfDay(currentDate);
        break;
    }
    
    loadShifts(start, end);
  }, [currentDate, viewMode, loadShifts]);

  // Filter shifts by selected users
  const filteredShifts = selectedUsers.length === 0 
    ? shifts 
    : shifts.filter(shift => selectedUsers.includes(shift.user_id));

  // Navigation functions
  const navigatePrevious = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format period display
  const formatPeriod = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy', { locale: it });
      case 'week':
        const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
        return `${format(weekStart, 'd MMM', { locale: it })} - ${format(weekEnd, 'd MMM yyyy', { locale: it })}`;
      case 'day':
        return format(currentDate, 'EEEE d MMMM yyyy', { locale: it });
    }
  };

  // Event handlers
  const handleCreateShift = (date: Date) => {
    setSelectedDate(date);
    setSelectedShift(null);
    setAddShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setQuickViewDialogOpen(true);
  };

  const handleEditFromQuickView = (shift: Shift) => {
    setQuickViewDialogOpen(false);
    setSelectedDate(new Date(shift.shift_date));
    setEditShiftDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    // The actual delete logic will be handled by the mutation in the dialog
    setQuickViewDialogOpen(false);
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
      {/* Inserimento Massivo Dialog */}
      {inserimentoMassivoOpen && (
        <InserimentoMassivoDialog 
          currentDate={currentDate}
          onClose={() => setInserimentoMassivoOpen(false)}
          onStartProgress={handleStartProgress}
          onUpdateProgress={handleUpdateProgress}
          onCompleteProgress={handleCompleteProgress}
        />
      )}

      <div className="min-h-[600px] max-h-[calc(100vh-120px)] flex flex-col">
        <Card className="flex-1 overflow-hidden">
          {/* Header Controls - Responsive Layout */}
          <div className="border-b bg-white px-3 md:px-6 py-3 md:py-4">
            {/* Mobile Layout */}
            <div className="block lg:hidden space-y-3">
              {/* Top row - Navigation and period */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigatePrevious}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={navigateNext}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="text-xs"
                  >
                    Oggi
                  </Button>
                </div>
                
                {/* View Mode Selector - Mobile */}
                <div className="flex items-center gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className="p-1"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className="p-1"
                  >
                    <Rows3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'day' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                    className="p-1"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Period title */}
              <div className="text-center">
                <h2 className="font-semibold text-base md:text-lg">
                  {formatPeriod()}
                </h2>
              </div>

              {/* Filters and actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Select 
                  value={selectedUsers.length === 1 ? selectedUsers[0] : selectedUsers.length > 1 ? 'multiple' : 'all'} 
                  onValueChange={(value) => {
                    if (value === 'all') {
                      setSelectedUsers([]);
                    } else if (value === 'multiple') {
                      // Keep current selection
                    } else {
                      setSelectedUsers([value]);
                    }
                  }}
                >
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Filtra utente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti</SelectItem>
                    {employees.map((user) => (
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

                {isAdminOrSocio && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => setInserimentoMassivoOpen(true)} 
                      className="flex-1 sm:flex-none gap-1"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Inserimento</span>
                      <span className="sm:hidden">Inserimento</span>
                    </Button>
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateShift(currentDate)} 
                      className="flex-1 sm:flex-none gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Nuovo</span>
                      <span className="sm:hidden">Nuovo</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between gap-4">
                {/* Left side - Navigation and View Mode */}
                <div className="flex items-center gap-4">
                  {/* Navigation */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={navigatePrevious}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="min-w-[250px] text-center">
                      <h2 className="font-semibold text-lg">
                        {formatPeriod()}
                      </h2>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={navigateNext}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                    >
                      Oggi
                    </Button>
                  </div>

                  {/* View Mode Selector */}
                  <div className="flex items-center gap-1 border rounded-md p-1">
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                      className="gap-2"
                    >
                      <Grid3X3 className="h-4 w-4" />
                      Mese
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                      className="gap-2"
                    >
                      <Rows3 className="h-4 w-4" />
                      Settimana
                    </Button>
                    <Button
                      variant={viewMode === 'day' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('day')}
                      className="gap-2"
                    >
                      <Square className="h-4 w-4" />
                      Giorno
                    </Button>
                  </div>
                </div>

                {/* Right side - Filters and Actions */}
                <div className="flex items-center gap-3">
                  {/* User Filter */}
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <Select 
                      value={selectedUsers.length === 1 ? selectedUsers[0] : selectedUsers.length > 1 ? 'multiple' : 'all'} 
                      onValueChange={(value) => {
                        if (value === 'all') {
                          setSelectedUsers([]);
                        } else if (value === 'multiple') {
                          // Keep current selection
                        } else {
                          setSelectedUsers([value]);
                        }
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtra per utente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tutti gli utenti</SelectItem>
                        {employees.map((user) => (
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

                  {/* Action Buttons */}
                  {isAdminOrSocio && (
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={() => setInserimentoMassivoOpen(true)} 
                        className="gap-2"
                      >
                        <Users className="h-4 w-4" />
                        Inserimento Massivo
                      </Button>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleCreateShift(currentDate)} 
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Nuovo Turno
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Users Legend - Responsive */}
            {employees.length > 0 && (
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Dipendenti:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {employees.map((user) => (
                    <Badge 
                      key={user.id} 
                      variant="outline" 
                      className="gap-2 cursor-pointer hover:bg-accent text-xs"
                      onClick={() => {
                        if (selectedUsers.includes(user.id)) {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        } else {
                          setSelectedUsers([...selectedUsers, user.id]);
                        }
                      }}
                      style={{
                        borderColor: selectedUsers.includes(user.id) ? user.color : undefined,
                        backgroundColor: selectedUsers.includes(user.id) ? `${user.color}20` : undefined
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: user.color || '#6B7280' }}
                      />
                      <span className="hidden sm:inline">{user.first_name} {user.last_name}</span>
                      <span className="sm:hidden">{user.first_name?.[0]}{user.last_name?.[0]}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Calendar Content */}
          <CalendarioView
            viewMode={viewMode}
            currentDate={currentDate}
            shifts={filteredShifts}
            employees={employees}
            isLoading={isLoading}
            onCreateShift={handleCreateShift}
            onEditShift={handleEditShift}
          />
        </Card>
      </div>

      {/* Dialogs */}
      <AddShiftDialog
        open={addShiftDialogOpen}
        onOpenChange={setAddShiftDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
        defaultDate={selectedDate}
      />

      {/* Quick View Dialog */}
      <ShiftQuickViewDialog
        open={quickViewDialogOpen}
        onOpenChange={setQuickViewDialogOpen}
        shift={selectedShift}
        onEditShift={handleEditFromQuickView}
        onDeleteShift={handleDeleteShift}
        canEdit={isAdminOrSocio}
      />

      {/* Edit Shift Dialog */}
      <EditShiftDialog
        open={editShiftDialogOpen}
        onOpenChange={setEditShiftDialogOpen}
        shift={selectedShift}
        isAdminOrSocio={isAdminOrSocio}
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
