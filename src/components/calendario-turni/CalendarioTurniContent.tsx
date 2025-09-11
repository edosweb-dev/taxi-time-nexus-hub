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
  Filter,
  BarChart3
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useShifts } from '@/components/shifts/ShiftContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, addWeeks, subWeeks, startOfWeek, endOfWeek, addDays, subDays, startOfDay, endOfDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { AddShiftDialog } from '@/components/shifts/AddShiftDialog';
import { EditShiftDialog } from '@/components/shifts/dialogs/EditShiftDialog';
import { ShiftQuickViewDialog } from '@/components/shifts/dialogs/ShiftQuickViewDialog';
import { BatchShiftForm } from '@/components/shifts/BatchShiftForm';
import { ShiftCreationProgressDialog } from '@/components/shifts/dialogs/ShiftCreationProgressDialog';
import { CalendarioView } from './CalendarioView';
import { InserimentoMassivoDialog } from './InserimentoMassivoDialog';
import { ViewFilterDropdown } from '@/components/shifts/filters/ViewFilterDropdown';
import { Shift } from '@/components/shifts/types';

interface CalendarioTurniContentProps {
  isAdminOrSocio: boolean;
}

type ViewMode = 'month' | 'week' | 'day';

export function CalendarioTurniContent({ isAdminOrSocio }: CalendarioTurniContentProps) {
  const { users } = useUsers();
  const { shifts, isLoading, loadShifts, deleteShift } = useShifts();
  const navigate = useNavigate();
  
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
    try {
      await deleteShift(shiftId);
      setQuickViewDialogOpen(false);
    } catch (error) {
      console.error('Error deleting shift:', error);
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
        <Card className="flex-1 overflow-hidden shadow-xl border-0 bg-gradient-to-br from-card to-card/95 backdrop-blur-sm">
          {/* Header Controls - Design moderno */}
          <div className="border-b bg-gradient-to-r from-background/95 to-muted/20 backdrop-blur-md px-4 md:px-6 py-4 md:py-5">
            {/* Mobile Layout - Ottimizzato */}
            <div className="block lg:hidden space-y-4">
              {/* Top row - Navigation moderno */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-muted/50 rounded-xl p-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigatePrevious}
                      className="rounded-lg hover:bg-background/80"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={navigateNext}
                      className="rounded-lg hover:bg-background/80"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="text-xs font-medium bg-primary/10 border-primary/20 hover:bg-primary/20"
                  >
                    Oggi
                  </Button>
                </div>
                
                {/* View Mode Selector - Mobile moderno */}
                <div className="bg-muted/50 rounded-xl p-1">
                  <ViewFilterDropdown 
                    viewMode={viewMode} 
                    onViewModeChange={setViewMode} 
                  />
                </div>
              </div>

              {/* Period title - Migliorato */}
              <div className="text-center py-2">
                <h2 className="font-bold text-lg md:text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  {formatPeriod()}
                </h2>
              </div>

              {/* Filters and actions - Design moderno */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
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
                    <SelectTrigger className="w-full bg-background/80 border-border/50 rounded-xl">
                      <SelectValue placeholder="Filtra utente" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
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
                </div>

                {isAdminOrSocio && (
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => navigate('/report')} 
                      className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-background to-muted/30 hover:from-muted/50 hover:to-muted/70 rounded-xl"
                    >
                      <BarChart3 className="h-4 w-4" />
                      <span className="hidden sm:inline">Report</span>
                    </Button>
                    
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => setInserimentoMassivoOpen(true)} 
                      className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-background to-muted/30 hover:from-muted/50 hover:to-muted/70 rounded-xl"
                    >
                      <Users className="h-4 w-4" />
                      <span className="hidden sm:inline">Inserimento</span>
                    </Button>
                    
                    <Button 
                      size="sm" 
                      onClick={() => handleCreateShift(currentDate)} 
                      className="flex-1 sm:flex-none gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg rounded-xl"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">Nuovo</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Layout - Design migliorato */}
            <div className="hidden lg:block">
              <div className="flex items-center justify-between gap-6">
                {/* Left side - Navigation moderno */}
                <div className="flex items-center gap-6">
                  {/* Navigation con design moderno */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center bg-muted/50 rounded-xl p-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={navigatePrevious}
                        className="rounded-lg hover:bg-background/80"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </Button>
                      
                      <div className="min-w-[280px] text-center px-4">
                        <h2 className="font-bold text-xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          {formatPeriod()}
                        </h2>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={navigateNext}
                        className="rounded-lg hover:bg-background/80"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToToday}
                      className="bg-primary/10 border-primary/20 hover:bg-primary/20 rounded-xl font-medium"
                    >
                      Oggi
                    </Button>
                  </div>

                  {/* View Mode Selector - Design moderno */}
                  <div className="bg-muted/50 rounded-xl p-1">
                    <ViewFilterDropdown 
                      viewMode={viewMode} 
                      onViewModeChange={setViewMode} 
                    />
                  </div>
                </div>

                {/* Right side - Filters and Actions migliorati */}
                <div className="flex items-center gap-4">
                  {/* User Filter moderno */}
                  <div className="flex items-center gap-3">
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
                      <SelectTrigger className="w-52 bg-background/80 border-border/50 rounded-xl">
                        <SelectValue placeholder="Filtra per utente" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
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

                  {/* Action Buttons moderni */}
                  {isAdminOrSocio && (
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={() => navigate('/report')} 
                        className="gap-2 bg-gradient-to-r from-background to-muted/30 hover:from-muted/50 hover:to-muted/70 rounded-xl border-border/50"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Report Turni
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm" 
                        onClick={() => setInserimentoMassivoOpen(true)} 
                        className="gap-2 bg-gradient-to-r from-background to-muted/30 hover:from-muted/50 hover:to-muted/70 rounded-xl border-border/50"
                      >
                        <Users className="h-4 w-4" />
                        Inserimento Massivo
                      </Button>
                      
                      <Button 
                        size="sm" 
                        onClick={() => handleCreateShift(currentDate)} 
                        className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg rounded-xl"
                      >
                        <Plus className="h-4 w-4" />
                        Nuovo Turno
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

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
