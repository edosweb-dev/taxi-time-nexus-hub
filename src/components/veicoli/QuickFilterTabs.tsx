import { cn } from '@/lib/utils';
import { Veicolo } from '@/lib/types/veicoli';

interface QuickFilterTabsProps {
  veicoli: Veicolo[];
  activeFilter: 'all' | 'active' | 'inactive';
  onFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
}

export function QuickFilterTabs({
  veicoli,
  activeFilter,
  onFilterChange
}: QuickFilterTabsProps) {
  const counts = {
    all: veicoli.length,
    active: veicoli.filter(v => v.attivo).length,
    inactive: veicoli.filter(v => !v.attivo).length
  };

  const tabs = [
    { key: 'all' as const, label: 'Tutti', count: counts.all },
    { key: 'active' as const, label: 'Attivi', count: counts.active },
    { key: 'inactive' as const, label: 'Inattivi', count: counts.inactive }
  ];

  return (
    <div className="bg-background px-3 pb-1">
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
        {tabs.map(tab => {
          const isActive = activeFilter === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2 px-3",
                "text-xs font-semibold rounded-md transition-all duration-150",
                isActive 
                  ? "bg-background text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-pressed={isActive}
            >
              <span>{tab.label}</span>
              <span className={cn(
                "text-[10px] font-bold min-w-[18px] px-1 rounded-full",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "bg-transparent"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
