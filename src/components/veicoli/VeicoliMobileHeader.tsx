import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VeicoliMobileHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function VeicoliMobileHeader({
  searchQuery,
  onSearchChange,
  totalCount,
  filteredCount
}: VeicoliMobileHeaderProps) {
  const hasSearch = searchQuery.trim().length > 0;

  return (
    <div className="md:hidden space-y-2">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Cerca targa o modello..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-10 text-sm bg-muted/30 rounded-lg"
          aria-label="Cerca veicoli"
        />
        {hasSearch && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
            aria-label="Cancella ricerca"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* Results Counter */}
      {hasSearch && (
        <div className={cn(
          "flex items-center justify-between text-xs px-0.5",
          filteredCount === 0 ? "text-destructive" : "text-muted-foreground"
        )}>
          <span className="font-medium">
            {filteredCount > 0 ? (
              <>
                <strong className="text-foreground">{filteredCount}</strong> di {totalCount}
              </>
            ) : (
              <>Nessun risultato</>
            )}
          </span>
          {filteredCount > 0 && filteredCount < totalCount && (
            <Button 
              variant="link" 
              size="sm"
              onClick={() => onSearchChange('')}
              className="h-auto p-0 text-xs text-primary"
            >
              Cancella
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
