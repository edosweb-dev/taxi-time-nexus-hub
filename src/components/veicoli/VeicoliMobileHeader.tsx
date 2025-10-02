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
    <div className="md:hidden space-y-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          placeholder="Cerca targa o modello..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 pr-12 h-14 text-base bg-background border-2 border-border focus:border-primary rounded-xl shadow-sm"
          aria-label="Cerca veicoli"
        />
        {hasSearch && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 rounded-lg"
            aria-label="Cancella ricerca"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Counter */}
      {hasSearch && (
        <div className={cn(
          "flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2",
          filteredCount === 0 && "bg-destructive/10"
        )}>
          <span className="text-sm text-muted-foreground">
            {filteredCount > 0 ? (
              <>Trovati <strong className="font-semibold text-foreground">{filteredCount}</strong> di {totalCount} veicoli</>
            ) : (
              <>Nessun risultato per "<span className="font-medium text-foreground">{searchQuery}</span>"</>
            )}
          </span>
          {filteredCount > 0 && filteredCount < totalCount && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onSearchChange('')}
              className="h-8 text-primary hover:text-primary/80"
            >
              Cancella
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
