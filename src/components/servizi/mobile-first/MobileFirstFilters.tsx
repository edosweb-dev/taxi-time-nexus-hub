import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { useAziende } from '@/hooks/useAziende';
import { cn } from '@/lib/utils';

interface MobileFirstFiltersProps {
  servizi: Servizio[];
  users: Profile[];
  filters: {
    aziendaId: string;
    assigneeId: string;
    dateFrom: Date | undefined;
    dateTo: Date | undefined;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

export function MobileFirstFilters({
  servizi,
  users,
  filters,
  onFiltersChange,
  onClose
}: MobileFirstFiltersProps) {
  const { aziende } = useAziende();

  const handleClear = () => {
    onFiltersChange({
      aziendaId: '',
      assigneeId: '',
      dateFrom: undefined,
      dateTo: undefined
    });
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <div className="space-y-6 p-4">
      {/* Azienda Filter */}
      <div className="space-y-2">
        <Label htmlFor="azienda">Azienda</Label>
        <Select
          value={filters.aziendaId}
          onValueChange={(value) => onFiltersChange({ ...filters, aziendaId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona azienda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tutte le aziende</SelectItem>
            {aziende.map((azienda) => (
              <SelectItem key={azienda.id} value={azienda.id}>
                {azienda.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignee Filter */}
      <div className="space-y-2">
        <Label htmlFor="assignee">Assegnato a</Label>
        <Select
          value={filters.assigneeId}
          onValueChange={(value) => onFiltersChange({ ...filters, assigneeId: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleziona operatore" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tutti gli operatori</SelectItem>
            {users.filter(user => user.role === 'dipendente').map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name} {user.last_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filters */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Data inizio</Label>
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
                {filters.dateFrom ? format(filters.dateFrom, "dd MMM yyyy", { locale: it }) : "Seleziona data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Data fine</Label>
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
                {filters.dateTo ? format(filters.dateTo, "dd MMM yyyy", { locale: it }) : "Seleziona data"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => onFiltersChange({ ...filters, dateTo: date })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleClear}
          className="flex-1"
        >
          Pulisci
        </Button>
        <Button
          onClick={handleApply}
          className="flex-1"
        >
          Applica Filtri
        </Button>
      </div>
    </div>
  );
}