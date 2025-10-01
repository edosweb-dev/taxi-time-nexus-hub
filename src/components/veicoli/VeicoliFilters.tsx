import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Veicolo } from '@/lib/types/veicoli';
import { cn } from '@/lib/utils';

interface VeicoliFiltersProps {
  activeFilters: {
    stato: string[];
    posti: string[];
  };
  onFilterChange: (type: 'stato' | 'posti' | 'clear', value?: string) => void;
  veicoli: Veicolo[];
}

export function VeicoliFilters({
  activeFilters,
  onFilterChange,
  veicoli
}: VeicoliFiltersProps) {
  const countVeicoli = (predicate: (v: Veicolo) => boolean) => 
    veicoli.filter(predicate).length;

  const filterOptions = {
    stato: [
      { 
        value: 'attivo', 
        label: 'Attivi', 
        count: countVeicoli(v => v.attivo) 
      },
      { 
        value: 'inattivo', 
        label: 'Inattivi', 
        count: countVeicoli(v => !v.attivo) 
      }
    ],
    posti: [
      { 
        value: '4+', 
        label: '4+ posti', 
        count: countVeicoli(v => (v.numero_posti || 0) >= 4) 
      },
      { 
        value: '7+', 
        label: '7+ posti', 
        count: countVeicoli(v => (v.numero_posti || 0) >= 7) 
      },
      { 
        value: '9+', 
        label: '9+ posti', 
        count: countVeicoli(v => (v.numero_posti || 0) >= 9) 
      }
    ]
  };

  const hasActiveFilters = 
    activeFilters.stato.length > 0 || 
    activeFilters.posti.length > 0;

  const activeFiltersCount = 
    activeFilters.stato.length + 
    activeFilters.posti.length;

  return (
    <div className="space-y-3 md:hidden">
      {/* Status Filters */}
      <div>
        <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Stato</Label>
        <div className="flex gap-2 flex-wrap">
          {filterOptions.stato.map(option => (
            <FilterChip
              key={option.value}
              active={activeFilters.stato.includes(option.value)}
              onClick={() => onFilterChange('stato', option.value)}
              count={option.count}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Posti Filters */}
      <div>
        <Label className="text-xs font-medium mb-1.5 block text-muted-foreground">Capacità</Label>
        <div className="flex gap-2 flex-wrap">
          {filterOptions.posti.map(option => (
            <FilterChip
              key={option.value}
              active={activeFilters.posti.includes(option.value)}
              onClick={() => onFilterChange('posti', option.value)}
              count={option.count}
              disabled={option.count === 0}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {activeFiltersCount} {activeFiltersCount === 1 ? 'filtro' : 'filtri'}
          </span>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onFilterChange('clear')}
            className="h-7 text-xs px-2"
          >
            Cancella
          </Button>
        </div>
      )}
    </div>
  );
}

interface FilterChipProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  count: number;
  disabled?: boolean;
}

function FilterChip({ children, active, onClick, count, disabled }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all min-h-[36px]",
        "active:scale-95",
        active 
          ? "bg-primary text-primary-foreground border-primary shadow-sm" 
          : "bg-background border-border hover:bg-muted",
        disabled && "opacity-50 cursor-not-allowed"
      )}
      aria-pressed={active}
      aria-label={`${children}${count > 0 ? `: ${count} veicoli` : ''}`}
    >
      <span className="font-semibold">{children}</span>
      {count > 0 && (
        <Badge 
          variant="secondary" 
          className={cn(
            "h-4 px-1.5 text-[10px] font-bold leading-none",
            active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted"
          )}
        >
          {count}
        </Badge>
      )}
    </button>
  );
}
