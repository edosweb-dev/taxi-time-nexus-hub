
import { useState, useEffect } from 'react';
import { Filter, X, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';

interface ShiftListFiltersProps {
  onUserFilter: (userId: string | null) => void;
  onDateFilter: (date: Date | null) => void;
  isAdminOrSocio: boolean;
}

interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

export function ShiftListFilters({ onUserFilter, onDateFilter, isAdminOrSocio }: ShiftListFiltersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch users
  useEffect(() => {
    if (isAdminOrSocio) {
      const fetchUsers = async () => {
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .in('role', ['admin', 'socio', 'dipendente']);
            
          if (error) throw error;
          setUsers(data || []);
        } catch (error) {
          console.error('Error fetching users for filter:', error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUsers();
    }
  }, [isAdminOrSocio]);
  
  // Handle user filter change
  const handleUserFilterChange = (userId: string | null) => {
    setSelectedUserId(userId);
    onUserFilter(userId);
  };
  
  // Handle date filter change
  const handleDateFilterChange = (date: Date | null) => {
    setSelectedDate(date);
    onDateFilter(date);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSelectedUserId(null);
    setSelectedDate(null);
    onUserFilter(null);
    onDateFilter(null);
  };
  
  const hasActiveFilters = selectedUserId || selectedDate;
  
  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {/* User filter - only for admin/socio */}
        {isAdminOrSocio && (
          <div className="flex items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className={cn(
                    "gap-1 border-dashed",
                    selectedUserId ? "border-primary" : "border-muted-foreground"
                  )}
                >
                  <User className="h-4 w-4" />
                  {selectedUserId ? 'Utente selezionato' : 'Filtra per utente'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4 w-72" align="start">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none mb-2">Filtra per utente</h4>
                  <Select
                    value={selectedUserId || "all-users"} // Use "all-users" instead of empty string
                    onValueChange={(value) => handleUserFilterChange(value === "all-users" ? null : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona un utente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-users">Tutti gli utenti</SelectItem> {/* Changed from empty string to "all-users" */}
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </PopoverContent>
            </Popover>
          </div>
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
