import React from 'react';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { useAziende } from '@/hooks/useAziende';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ServiceFilters {
  aziendaId: string;
  assigneeId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface ServicesFiltersProps {
  servizi: Servizio[];
  users: Profile[];
  filters: ServiceFilters;
  onFiltersChange: (filters: ServiceFilters) => void;
  onClearFilters: () => void;
  onClose: () => void;
}

export function ServicesFilters({
  servizi,
  users,
  filters,
  onFiltersChange,
  onClearFilters,
  onClose
}: ServicesFiltersProps) {
  const { aziende } = useAziende();

  const handleFilterChange = (key: keyof ServiceFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleClear = () => {
    onClearFilters();
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Company Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Azienda</label>
        <Select 
          value={filters.aziendaId} 
          onValueChange={(value) => handleFilterChange('aziendaId', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tutte le aziende" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le aziende</SelectItem>
            {aziende.map((azienda) => (
              <SelectItem key={azienda.id} value={azienda.id}>
                {azienda.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignee Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Assegnato a</label>
        <Select 
          value={filters.assigneeId} 
          onValueChange={(value) => handleFilterChange('assigneeId', value === 'all' ? '' : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tutti gli assegnatari" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti gli assegnatari</SelectItem>
            <SelectItem value="unassigned">Non assegnati</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date From Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Data da</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !filters.dateFrom && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, "dd/MM/yyyy", { locale: it }) : "Seleziona data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateFrom}
              onSelect={(date) => handleFilterChange('dateFrom', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Date To Filter */}
      <div>
        <label className="text-sm font-medium mb-2 block">Data a</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !filters.dateTo && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, "dd/MM/yyyy", { locale: it }) : "Seleziona data"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.dateTo}
              onSelect={(date) => handleFilterChange('dateTo', date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button variant="outline" onClick={handleClear} className="flex-1">
          Pulisci
        </Button>
        <Button onClick={handleApply} className="flex-1">
          Applica Filtri
        </Button>
      </div>
    </div>
  );
}