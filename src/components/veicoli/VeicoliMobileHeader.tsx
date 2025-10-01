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
    <div className="md:hidden space-y-4 mb-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Cerca per targa o modello..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-12 h-14 text-base bg-muted/30 border-2 focus:border-primary transition-colors rounded-xl"
          aria-label="Cerca veicoli"
        />
        {hasSearch && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 hover:bg-muted"
            aria-label="Cancella ricerca"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Counter */}
      {hasSearch && (
        <div className={cn(
          "flex items-center justify-between text-sm px-1",
          filteredCount === 0 ? "text-destructive" : "text-muted-foreground"
        )}>
          <span className="font-medium">
            {filteredCount > 0 ? (
              <>
                Trovati <strong className="text-foreground">{filteredCount}</strong> di {totalCount} veicoli
              </>
            ) : (
              <>Nessun risultato per "<strong className="text-foreground">{searchQuery}</strong>"</>
            )}
          </span>
          {filteredCount > 0 && filteredCount < totalCount && (
            <Button 
              variant="link" 
              size="sm"
              onClick={() => onSearchChange('')}
              className="h-auto p-0 text-xs text-primary hover:underline"
            >
              Cancella
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
