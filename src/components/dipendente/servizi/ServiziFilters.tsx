import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Calendar as CalendarIcon, X, Search } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface FilterValues {
  stati: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  aziendaId?: string;
  search?: string;
}

interface ServiziFiltersProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  aziende?: Array<{ id: string; nome: string }>;
}

export const ServiziFilters = ({ filters, onFiltersChange, aziende = [] }: ServiziFiltersProps) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || "");
  const [startDate, setStartDate] = useState<Date | undefined>(
    filters.dateRange?.start ? new Date(filters.dateRange.start) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    filters.dateRange?.end ? new Date(filters.dateRange.end) : undefined
  );

  const handleStatiToggle = (stato: string) => {
    const newStati = filters.stati.includes(stato)
      ? filters.stati.filter(s => s !== stato)
      : [...filters.stati, stato];
    onFiltersChange({ ...filters, stati: newStati });
  };

  const handleApplyFilters = () => {
    const newFilters: FilterValues = {
      ...filters,
      search: searchInput || undefined,
      aziendaId: filters.aziendaId || undefined,
      dateRange: startDate && endDate ? {
        start: format(startDate, 'yyyy-MM-dd'),
        end: format(endDate, 'yyyy-MM-dd')
      } : undefined
    };
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    setSearchInput("");
    setStartDate(undefined);
    setEndDate(undefined);
    onFiltersChange({
      stati: [],
      dateRange: undefined,
      aziendaId: undefined,
      search: undefined
    });
  };

  const activeFiltersCount = 
    (filters.stati.length > 0 ? 1 : 0) +
    (filters.dateRange ? 1 : 0) +
    (filters.aziendaId ? 1 : 0) +
    (filters.search ? 1 : 0);

  return (
    <div className="space-y-4 p-4 border-b bg-muted/30">
      {/* Quick Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={filters.stati.length === 0 ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => onFiltersChange({ ...filters, stati: [] })}
        >
          🔘 Tutti
        </Badge>
        <Badge
          variant={filters.stati.includes('assegnato') ? "default" : "outline"}
          className="cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
          onClick={() => handleStatiToggle('assegnato')}
        >
          🟡 Da Completare
        </Badge>
        <Badge
          variant={filters.stati.includes('completato') ? "default" : "outline"}
          className="cursor-pointer bg-green-100 text-green-800 hover:bg-green-200"
          onClick={() => handleStatiToggle('completato')}
        >
          🟢 Completati
        </Badge>
        <Badge
          variant={filters.stati.includes('consuntivato') ? "default" : "outline"}
          className="cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200"
          onClick={() => handleStatiToggle('consuntivato')}
        >
          🔵 Consuntivati
        </Badge>
      </div>

      {/* Advanced Filters */}
      <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span>Filtri Avanzati {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", isAdvancedOpen && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per azienda, percorso, commessa..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd/MM/yyyy", { locale: it }) : "Data inizio"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  locale={it}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd/MM/yyyy", { locale: it }) : "Data fine"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  locale={it}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Azienda Select */}
          <Select value={filters.aziendaId || ""} onValueChange={(value) => onFiltersChange({ ...filters, aziendaId: value || undefined })}>
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

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters} className="flex-1">
              Applica Filtri
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
