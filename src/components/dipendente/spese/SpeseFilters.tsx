import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search, Calendar as CalendarIcon, X } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface SpeseFiltersProps {
  selectedStato: string;
  onStatoChange: (stato: string) => void;
  onAdvancedFiltersChange: (filters: {
    dateStart?: string;
    dateEnd?: string;
    importoMin?: number;
    importoMax?: number;
    search?: string;
  }) => void;
  onReset: () => void;
}

export function SpeseFilters({
  selectedStato,
  onStatoChange,
  onAdvancedFiltersChange,
  onReset
}: SpeseFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [dateStart, setDateStart] = useState<Date>();
  const [dateEnd, setDateEnd] = useState<Date>();
  const [importoMin, setImportoMin] = useState<string>('');
  const [importoMax, setImportoMax] = useState<string>('');
  const [search, setSearch] = useState('');

  const activeFiltersCount = 
    (dateStart ? 1 : 0) +
    (dateEnd ? 1 : 0) +
    (importoMin ? 1 : 0) +
    (importoMax ? 1 : 0) +
    (search ? 1 : 0);

  const handleApplyAdvanced = () => {
    onAdvancedFiltersChange({
      dateStart: dateStart ? format(dateStart, 'yyyy-MM-dd') : undefined,
      dateEnd: dateEnd ? format(dateEnd, 'yyyy-MM-dd') : undefined,
      importoMin: importoMin ? parseFloat(importoMin) : undefined,
      importoMax: importoMax ? parseFloat(importoMax) : undefined,
      search: search || undefined,
    });
  };

  const handleResetAdvanced = () => {
    setDateStart(undefined);
    setDateEnd(undefined);
    setImportoMin('');
    setImportoMax('');
    setSearch('');
    onReset();
  };

  return (
    <div className="space-y-4 p-4 border-b bg-muted/30">
      {/* Quick Filter Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedStato === 'tutte' ? "default" : "outline"}
          className="cursor-pointer px-3 py-1.5"
          onClick={() => onStatoChange('tutte')}
        >
          🔘 Tutte
        </Badge>
        <Badge
          variant={selectedStato === 'in_attesa' ? "default" : "outline"}
          className={cn(
            "cursor-pointer px-3 py-1.5",
            selectedStato === 'in_attesa' 
              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300" 
              : "hover:bg-yellow-50"
          )}
          onClick={() => onStatoChange('in_attesa')}
        >
          🟡 In Attesa
        </Badge>
        <Badge
          variant={selectedStato === 'approvata' ? "default" : "outline"}
          className={cn(
            "cursor-pointer px-3 py-1.5",
            selectedStato === 'approvata' 
              ? "bg-green-100 text-green-800 hover:bg-green-200 border-green-300" 
              : "hover:bg-green-50"
          )}
          onClick={() => onStatoChange('approvata')}
        >
          🟢 Approvate
        </Badge>
        <Badge
          variant={selectedStato === 'non_autorizzata' ? "default" : "outline"}
          className={cn(
            "cursor-pointer px-3 py-1.5",
            selectedStato === 'non_autorizzata' 
              ? "bg-red-100 text-red-800 hover:bg-red-200 border-red-300" 
              : "hover:bg-red-50"
          )}
          onClick={() => onStatoChange('non_autorizzata')}
        >
          🔴 Rifiutate
        </Badge>
      </div>

      {/* Advanced Filters Collapsible */}
      <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between">
            <span>
              Filtri Avanzati {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </span>
            <ChevronDown className={cn("h-4 w-4 transition-transform", showAdvanced && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 mt-4">
          {/* Date Range */}
          <div className="grid grid-cols-2 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateStart ? format(dateStart, "dd/MM/yyyy", { locale: it }) : "Data inizio"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateStart}
                  onSelect={setDateStart}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateEnd ? format(dateEnd, "dd/MM/yyyy", { locale: it }) : "Data fine"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateEnd}
                  onSelect={setDateEnd}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Amount Range */}
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="0.01"
              value={importoMin}
              onChange={(e) => setImportoMin(e.target.value)}
              placeholder="Min €"
            />
            <Input
              type="number"
              step="0.01"
              value={importoMax}
              onChange={(e) => setImportoMax(e.target.value)}
              placeholder="Max €"
            />
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cerca per causale..."
              className="pl-9"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={handleApplyAdvanced} className="flex-1">
              Applica Filtri
            </Button>
            <Button variant="outline" onClick={handleResetAdvanced}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
