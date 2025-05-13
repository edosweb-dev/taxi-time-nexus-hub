
import { useState, useEffect } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { UserFilterDropdown } from './filters/UserFilterDropdown';

interface ShiftListFiltersProps {
  onUserFilter: (userId: string | null) => void;
  onDateFilter: (date: Date | null) => void;
  isAdminOrSocio: boolean;
  selectedUserId?: string | null;
}

export function ShiftListFilters({ onUserFilter, onDateFilter, isAdminOrSocio, selectedUserId }: ShiftListFiltersProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // Handle date filter change
  const handleDateFilterChange = (date: Date | null) => {
    setSelectedDate(date);
    onDateFilter(date);
  };
  
  // Clear all filters
  const clearFilters = () => {
    onUserFilter(null);
    setSelectedDate(null);
    onDateFilter(null);
  };
  
  const hasActiveFilters = selectedUserId || selectedDate;
  
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* User filter - only for admin/socio */}
        {isAdminOrSocio && (
          <UserFilterDropdown
            selectedUserId={selectedUserId || null}
            onSelectUser={onUserFilter}
            showOnlyAdminAndSocio={true}
          />
        )}
        
        {/* Date filter */}
        <div className="flex items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(
                  "gap-1 border-dashed",
                  selectedDate ? "border-primary" : "border-muted-foreground"
                )}
              >
                <Calendar className="h-4 w-4" />
                {selectedDate 
                  ? format(selectedDate, "dd/MM/yyyy") 
                  : "Filtra per data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-auto" align="start">
              <CalendarComponent
                mode="single"
                selected={selectedDate || undefined}
                onSelect={handleDateFilterChange}
                locale={it}
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Clear filters */}
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={clearFilters}
            className="gap-1"
          >
            <X className="h-4 w-4" /> 
            Rimuovi filtri
          </Button>
        )}
      </div>
    </div>
  );
}
