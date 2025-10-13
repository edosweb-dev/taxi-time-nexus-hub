import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
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

  const stati = [
    { value: 'tutte', label: 'Tutte', icon: '🔘' },
    { value: 'in_attesa', label: 'In Attesa', icon: '🟡' },
    { value: 'approvata', label: 'Approvate', icon: '🟢' },
    { value: 'non_autorizzata', label: 'Rifiutate', icon: '🔴' },
  ];

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
    <Card className="p-4">
      <div className="space-y-4">
        {/* Quick Filters */}
        <div>
          <Label className="text-sm font-medium mb-2 block">
            🔍 FILTRI
          </Label>
          <div className="flex flex-wrap gap-2">
            {stati.map((stato) => (
              <Button
                key={stato.value}
                variant={selectedStato === stato.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onStatoChange(stato.value)}
                className="gap-1"
              >
                <span>{stato.icon}</span>
                <span>{stato.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between"
        >
          <span>Filtri Avanzati</span>
          {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Date Range */}
            <div className="space-y-2">
              <Label>Periodo</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Dal</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        {dateStart ? format(dateStart, 'dd/MM/yyyy', { locale: it }) : 'Seleziona'}
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
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Al</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left">
                        {dateEnd ? format(dateEnd, 'dd/MM/yyyy', { locale: it }) : 'Seleziona'}
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
              </div>
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <Label>Importo</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Min €</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={importoMin}
                    onChange={(e) => setImportoMin(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Max €</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={importoMax}
                    onChange={(e) => setImportoMax(e.target.value)}
                    placeholder="500"
                  />
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <Label>Cerca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cerca per causale..."
                  className="pl-9"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleApplyAdvanced} className="flex-1">
                Applica
              </Button>
              <Button onClick={handleResetAdvanced} variant="outline" className="flex-1">
                Reset
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
