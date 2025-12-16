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
    { 
      key: 'all' as const, 
      label: 'Tutti', 
      count: counts.all 
    },
    { 
      key: 'active' as const, 
      label: 'Attivi', 
      count: counts.active,
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      key: 'inactive' as const, 
      label: 'Inattivi', 
      count: counts.inactive,
      color: 'text-gray-500 dark:text-gray-400'
    }
  ];

  return (
    <div className="bg-background border-b border-border">
      <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1">
        {tabs.map(tab => {
          const isActive = activeFilter === tab.key;
          
          return (
            <button
              key={tab.key}
              onClick={() => onFilterChange(tab.key)}
              className={cn(
                // Touch-compliant height: 48px
                "flex items-center gap-2 px-6 py-3 h-12 whitespace-nowrap",
                "font-semibold text-sm transition-all duration-200",
                "border-b-2 relative",
                "active:scale-95 transform",
                isActive 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
              aria-pressed={isActive}
              aria-label={`${tab.label}: ${tab.count} veicoli`}
            >
              <span className="font-bold">{tab.label}</span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-xs font-bold min-w-[24px] text-center",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
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
