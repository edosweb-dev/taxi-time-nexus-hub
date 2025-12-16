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
      "bg-background/95 backdrop-blur-sm z-40",
      sticky && "sticky top-0"
    )}>
      <div className="px-3 py-2">
        {/* Compact Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Cerca targa, modello..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "h-10 pl-9 pr-10 text-sm",
              "bg-muted/40 border-0",
              "focus:bg-muted/60 focus:ring-1 focus:ring-primary/30",
              "rounded-lg transition-all duration-150",
              "placeholder:text-muted-foreground/50"
            )}
            aria-label="Cerca veicoli"
          />
          {hasSearch && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onSearchChange('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 rounded-md"
              aria-label="Cancella ricerca"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Results Counter - Inline compact */}
        {hasSearch && (
          <div className="flex items-center justify-between mt-2 px-1">
            <span className="text-xs text-muted-foreground">
              {filteredCount > 0 ? (
                <>
                  <strong className="font-semibold text-foreground">{filteredCount}</strong>
                  {' '}/ {totalCount}
                </>
              ) : (
                <span className="text-destructive">Nessun risultato</span>
              )}
            </span>
            {filteredCount > 0 && filteredCount < totalCount && (
              <button 
                onClick={() => onSearchChange('')}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mostra tutti
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
