import React, { useState, useMemo } from 'react';
import { useShifts } from '@/components/shifts/ShiftContext';
import { useUsers } from '@/hooks/useUsers';
import { MonthView } from './views/MonthView';
import { WeekView } from './views/WeekView';
import { DayView } from './views/DayView';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns';
import { Shift } from '@/components/shifts/types';
import { Loader2 } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  selectedUsers: string[];
  onCreateShift: (date: Date) => void;
  onEditShift: (shift: Shift) => void;
}

export function CalendarGrid({
  currentDate,
  viewMode,
  selectedUsers,
  onCreateShift,
  onEditShift
}: CalendarGridProps) {
  const { shifts, isLoading, loadShifts } = useShifts();
  const { users } = useUsers({ includeRoles: ['admin', 'socio', 'dipendente'] });

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    switch (viewMode) {
      case 'month':
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate)
        };
      case 'week':
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 1 }),
          end: endOfWeek(currentDate, { weekStartsOn: 1 })
        };
      case 'day':
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate)
        };
    }
  }, [currentDate, viewMode]);

  // Load shifts when date range changes
  React.useEffect(() => {
    loadShifts(dateRange.start, dateRange.end);
  }, [dateRange, loadShifts]);

  // Filter shifts by selected users
  const filteredShifts = useMemo(() => {
    if (selectedUsers.length === 0) return shifts;
    return shifts.filter(shift => selectedUsers.includes(shift.user_id));
  }, [shifts, selectedUsers]);

  // Create user map for quick lookup
  const userMap = useMemo(() => {
    const map = new Map();
    users?.forEach(user => {
      map.set(user.id, user);
    });
    return map;
  }, [users]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Caricamento turni...</span>
        </div>
      </div>
    );
  }

  const commonProps = {
    currentDate,
    shifts: filteredShifts,
    userMap,
    onCreateShift,
    onEditShift
  };

  switch (viewMode) {
    case 'month':
      return <MonthView {...commonProps} />;
    case 'week':
      return <WeekView {...commonProps} />;
    case 'day':
      return <DayView {...commonProps} />;
    default:
      return <MonthView {...commonProps} />;
  }
}