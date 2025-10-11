import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useShifts } from './ShiftContext';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { AddShiftDialog } from './AddShiftDialog';
import { BatchShiftForm } from './BatchShiftForm';
import { ShiftCreationProgressDialog } from './dialogs/ShiftCreationProgressDialog';
import { Shift } from './types';

interface ShiftCalendarProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  isAdminOrSocio: boolean;
}

export function ShiftCalendar({ currentDate, onDateChange, isAdminOrSocio }: ShiftCalendarProps) {
  const { users } = useUsers();
  const { shifts, isLoading, loadShifts, setSelectedShift } = useShifts();
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [addShiftDialogOpen, setAddShiftDialogOpen] = useState(false);
  const [batchFormOpen, setBatchFormOpen] = useState(false);
  
  // Progress dialog state
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [totalShifts, setTotalShifts] = useState(0);
  const [createdShifts, setCreatedShifts] = useState(0);
  const [errorShifts, setErrorShifts] = useState(0);
  const [isCreationComplete, setIsCreationComplete] = useState(false);

  // Load shifts when date changes
  useEffect(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    loadShifts(start, end);
  }, [currentDate, loadShifts]);

  const handleCreateShift = (date: Date) => {
    setSelectedDate(date);
    setSelectedShift(null); // Clear any selected shift for new creation
    setAddShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setSelectedShift(shift);
    setSelectedDate(new Date(shift.shift_date));
    // The AddShiftDialog will handle editing via selectedShift from context
    setAddShiftDialogOpen(true);
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

  const filteredShifts = selectedUsers.length === 0 
    ? shifts 
    : shifts.filter(shift => selectedUsers.includes(shift.user_id));

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
        <div className="flex-1 flex flex-col w-full overflow-hidden">
          <Card className="flex-1 overflow-hidden">
            {/* Header with filters and actions */}
            <div className="border-b bg-white px-4 py-2">
              <div className="flex items-center justify-between gap-3">
                {/* Calendar Navigation */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDateChange(subMonths(currentDate, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="font-semibold text-lg min-w-[200px] text-center">
                      {format(currentDate, 'MMMM yyyy', { locale: it })}
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDateChange(addMonths(currentDate, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDateChange(new Date())}
                  >
                    Oggi
                  </Button>
                </div>
                
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
                            ?.filter(user => user.role === 'admin' || user.role === 'socio' || user.role === 'dipendente')
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

            {/* Calendar Content */}
            <div className="p-4 overflow-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-muted-foreground">Caricamento turni...</div>
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1 text-sm">
                  {/* Header giorni */}
                  {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
                    <div key={day} className="p-2 text-center font-medium text-muted-foreground border-b">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Grid - Simple Month View */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const startDate = startOfMonth(currentDate);
                    const date = new Date(startDate);
                    date.setDate(date.getDate() - startDate.getDay() + 1 + i); // Adjust for Monday start
                    
                    const dayShifts = filteredShifts.filter(shift => {
                      const shiftDate = new Date(shift.shift_date);
                      return shiftDate.toDateString() === date.toDateString();
                    });
                    
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isToday = date.toDateString() === new Date().toDateString();
                    
                    return (
                      <div
                        key={i}
                        className={`
                          min-h-[100px] p-2 border cursor-pointer hover:bg-accent/50 transition-colors
                          ${!isCurrentMonth ? 'text-muted-foreground bg-muted/20' : ''}
                          ${isToday ? 'bg-accent border-primary' : ''}
                        `}
                        onClick={() => handleCreateShift(date)}
                      >
                        <div className="font-medium mb-1">{date.getDate()}</div>
                        <div className="space-y-1">
                          {dayShifts.slice(0, 3).map((shift) => {
                            const user = users?.find(u => u.id === shift.user_id);
                            return (
                              <div
                                key={shift.id}
                                className="text-xs p-1 rounded bg-primary/10 text-primary cursor-pointer hover:bg-primary/20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditShift(shift);
                                }}
                              >
                                <div className="font-medium truncate">
                                  {user?.first_name} {user?.last_name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {shift.shift_type === 'half_day'
                                    ? (shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio')
                                    : shift.shift_type === 'full_day' ? 'Giornata intera'
                                    : shift.shift_type === 'half_day' ? `Mezza giornata (${shift.half_day_type})`
                                    : shift.shift_type
                                  }
                                </div>
                              </div>
                            );
                          })}
                          {dayShifts.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{dayShifts.length - 3} altri
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Dialogs */}
      <AddShiftDialog
        open={addShiftDialogOpen}
        onOpenChange={setAddShiftDialogOpen}
        isAdminOrSocio={isAdminOrSocio}
        defaultDate={selectedDate}
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