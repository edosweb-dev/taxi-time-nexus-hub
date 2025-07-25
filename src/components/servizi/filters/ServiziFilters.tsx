import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { 
  Filter, 
  Search, 
  Calendar as CalendarIcon, 
  Building2,
  User,
  X
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { useAziende } from "@/hooks/useAziende";

export interface ServiziFiltersState {
  search: string;
  aziendaId: string;
  assigneeId: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

interface ServiziFiltersProps {
  servizi: Servizio[];
  users: Profile[];
  filters: ServiziFiltersState;
  onFiltersChange: (filters: ServiziFiltersState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export const ServiziFilters = ({
  servizi,
  users,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters
}: ServiziFiltersProps) => {
  const { aziende } = useAziende();
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof ServiziFiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.aziendaId ||
    filters.assigneeId ||
    filters.dateFrom ||
    filters.dateTo;

  const activeFiltersCount = [
    filters.search,
    filters.aziendaId,
    filters.assigneeId,
    filters.dateFrom,
    filters.dateTo
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca servizi..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Advanced Filters */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filtri
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filtri Avanzati</h4>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    onClearFilters();
                    setIsOpen(false);
                  }}
                >
                  <X className="h-3 w-3 mr-1" />
                  Cancella
                </Button>
              )}
            </div>

            {/* Azienda Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <Building2 className="h-3 w-3 mr-1" />
                Azienda
              </Label>
              <Select 
                value={filters.aziendaId || 'all'} 
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
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <User className="h-3 w-3 mr-1" />
                Assegnato a
              </Label>
              <Select 
                value={filters.assigneeId || 'all'} 
                onValueChange={(value) => handleFilterChange('assigneeId', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tutti gli utenti" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli utenti</SelectItem>
                  {users
                    .filter(user => user.role === 'dipendente' || user.role === 'socio')
                    .map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.first_name} {user.last_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Periodo
              </Label>
              <div className="grid grid-cols-2 gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                      {filters.dateFrom ? (
                        format(filters.dateFrom, "dd MMM", { locale: it })
                      ) : (
                        "Da"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateFrom}
                      onSelect={(date) => handleFilterChange('dateFrom', date)}
                      locale={it}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                      {filters.dateTo ? (
                        format(filters.dateTo, "dd MMM", { locale: it })
                      ) : (
                        "A"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.dateTo}
                      onSelect={(date) => handleFilterChange('dateTo', date)}
                      locale={it}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Apply Filters */}
            <div className="pt-2">
              <Button 
                onClick={() => {
                  onApplyFilters();
                  setIsOpen(false);
                }}
                className="w-full"
                size="sm"
              >
                Applica Filtri
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};