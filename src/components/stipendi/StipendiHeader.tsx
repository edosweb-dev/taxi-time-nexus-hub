
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface StipendiHeaderProps {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onNewStipendio?: () => void;
  showNewButton?: boolean;
}

const months = [
  { value: 1, label: 'Gennaio' },
  { value: 2, label: 'Febbraio' },
  { value: 3, label: 'Marzo' },
  { value: 4, label: 'Aprile' },
  { value: 5, label: 'Maggio' },
  { value: 6, label: 'Giugno' },
  { value: 7, label: 'Luglio' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Settembre' },
  { value: 10, label: 'Ottobre' },
  { value: 11, label: 'Novembre' },
  { value: 12, label: 'Dicembre' },
];

export function StipendiHeader({ 
  selectedMonth, 
  selectedYear, 
  onMonthChange, 
  onYearChange, 
  onNewStipendio,
  showNewButton = false
}: StipendiHeaderProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Range anni per il popover
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 3 + i);

  // Verifica se possiamo andare avanti
  const canGoNext = selectedYear < currentYear || 
    (selectedYear === currentYear && selectedMonth < currentMonth);
  
  // Navigazione mese precedente
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      onMonthChange(12);
      onYearChange(selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };
  
  // Navigazione mese successivo
  const handleNextMonth = () => {
    if (!canGoNext) return;
    
    if (selectedMonth === 12) {
      onMonthChange(1);
      onYearChange(selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  // Selezione diretta mese/anno dal popover
  const handleSelectMonthYear = (month: number, year: number) => {
    // Verifica che non sia futuro
    if (year > currentYear || (year === currentYear && month > currentMonth)) {
      return;
    }
    onMonthChange(month);
    onYearChange(year);
    setPopoverOpen(false);
  };

  const selectedMonthLabel = months.find(m => m.value === selectedMonth)?.label || '';

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestione Stipendi</h1>
          
          {/* Navigazione Mese/Anno con frecce */}
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handlePrevMonth}
              aria-label="Mese precedente"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 px-3 font-medium min-w-[140px] sm:min-w-[160px]"
                >
                  {selectedMonthLabel} {selectedYear}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="center">
                <div className="space-y-3">
                  <div className="text-sm font-medium text-center text-muted-foreground">
                    Seleziona mese e anno
                  </div>
                  
                  {/* Selettore Anno */}
                  <Select 
                    value={selectedYear.toString()} 
                    onValueChange={(value) => onYearChange(Number(value))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Griglia Mesi */}
                  <div className="grid grid-cols-3 gap-1">
                    {months.map((month) => {
                      const isFuture = selectedYear > currentYear || 
                        (selectedYear === currentYear && month.value > currentMonth);
                      const isSelected = month.value === selectedMonth;
                      
                      return (
                        <Button
                          key={month.value}
                          variant={isSelected ? "default" : "ghost"}
                          size="sm"
                          className="h-8 text-xs"
                          disabled={isFuture}
                          onClick={() => handleSelectMonthYear(month.value, selectedYear)}
                        >
                          {month.label.slice(0, 3)}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleNextMonth}
              disabled={!canGoNext}
              aria-label="Mese successivo"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {showNewButton && onNewStipendio && (
          <Button onClick={onNewStipendio}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Stipendio
          </Button>
        )}
      </div>
      
      {/* Messaggio informativo calcolo automatico */}
      <p className="text-sm text-muted-foreground">
        Il calcolo degli stipendi è automatico in base ai servizi del mese selezionato.
      </p>
    </div>
  );
}
