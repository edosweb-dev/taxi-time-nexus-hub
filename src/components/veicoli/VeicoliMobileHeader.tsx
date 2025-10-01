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
    <div className="md:hidden space-y-3 mb-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Cerca per targa o modello..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 pr-10 h-12 text-base" // Prevents iOS zoom
        />
        {hasSearch && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onSearchChange('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results Counter */}
      {hasSearch && (
        <div className={cn(
          "flex items-center justify-between text-sm",
          filteredCount === 0 ? "text-destructive" : "text-muted-foreground"
        )}>
          <span>
            {filteredCount > 0 ? (
              <>
                <span className="font-medium">{filteredCount}</span> di {totalCount} veicoli
              </>
            ) : (
              'Nessun risultato trovato'
            )}
          </span>
          {filteredCount > 0 && filteredCount < totalCount && (
            <Button 
              variant="link" 
              size="sm"
              onClick={() => onSearchChange('')}
              className="h-auto p-0 text-xs"
            >
              Mostra tutti
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
