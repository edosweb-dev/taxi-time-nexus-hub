import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
  sticky?: boolean;
}

export function SmartSearchBar({
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount,
  sticky = true
}: SmartSearchBarProps) {
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className={cn(
      "bg-background z-40",
      sticky && "sticky top-0"
    )}>
      <div className="px-8 py-3 space-y-3">
        {/* Search Input - 52px height for touch compliance */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Cerca targa, modello..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "h-[52px] pl-12 pr-14 text-base font-medium",
              "bg-muted/30 border-2 border-border",
              "focus:border-primary focus:bg-background",
              "rounded-xl transition-all duration-200",
              "placeholder:text-muted-foreground/60"
            )}
            aria-label="Cerca veicoli"
          />
          {hasSearch && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onSearchChange('')}
              className={cn(
                "absolute right-2 top-1/2 transform -translate-y-1/2",
                "h-11 w-11 rounded-lg", // 44px touch target
                "hover:bg-muted"
              )}
              aria-label="Cancella ricerca"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Results Counter */}
        {hasSearch && (
          <div className={cn(
            "flex items-center justify-between rounded-lg px-3 py-2",
            "bg-muted/50 border border-border/50",
            filteredCount === 0 && "bg-destructive/10 border-destructive/30"
          )}>
            <span className="text-sm text-muted-foreground">
              {filteredCount > 0 ? (
                <>
                  <strong className="font-bold text-foreground">{filteredCount}</strong>
                  {' '}di {totalCount} veicoli
                </>
              ) : (
                <>Nessun risultato</>
              )}
            </span>
            {filteredCount > 0 && filteredCount < totalCount && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onSearchChange('')}
                className="h-8 text-sm font-medium text-primary hover:text-primary/80 px-3"
              >
                Mostra tutti
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
