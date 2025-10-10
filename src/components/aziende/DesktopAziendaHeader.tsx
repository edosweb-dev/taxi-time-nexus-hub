import { Search, Plus, Grid, List, FileSignature, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Badge } from '@/components/ui/badge';

interface DesktopAziendaHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddAzienda: () => void;
  totalCount: number;
  filteredCount: number;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  showFirmaDigitale: boolean;
  onShowFirmaDigitaleChange: (show: boolean) => void;
  showProvvigioni: boolean;
  onShowProvvigioniChange: (show: boolean) => void;
}

export function DesktopAziendaHeader({
  searchTerm,
  onSearchChange,
  onAddAzienda,
  totalCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  showFirmaDigitale,
  onShowFirmaDigitaleChange,
  showProvvigioni,
  onShowProvvigioniChange,
}: DesktopAziendaHeaderProps) {
  const activeFiltersCount = (showFirmaDigitale ? 1 : 0) + (showProvvigioni ? 1 : 0);

  return (
    <div className="space-y-4">
      {/* Top row: Title and Add button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aziende</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredCount === totalCount 
              ? `${totalCount} aziende totali`
              : `${filteredCount} di ${totalCount} aziende`
            }
          </p>
        </div>
        <Button onClick={onAddAzienda} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuova Azienda
        </Button>
      </div>

      {/* Bottom row: Search, Filters and View toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome, P.IVA, email, telefono o città..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Badge
              variant={showFirmaDigitale ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => onShowFirmaDigitaleChange(!showFirmaDigitale)}
            >
              <FileSignature className="h-3 w-3 mr-1" />
              Firma Digitale
            </Badge>

            <Badge
              variant={showProvvigioni ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/90 transition-colors"
              onClick={() => onShowProvvigioniChange(!showProvvigioni)}
            >
              <Percent className="h-3 w-3 mr-1" />
              Provvigioni
            </Badge>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onShowFirmaDigitaleChange(false);
                  onShowProvvigioniChange(false);
                }}
                className="h-8 text-xs"
              >
                Cancella filtri ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && onViewModeChange(value as 'cards' | 'table')}>
          <ToggleGroupItem value="cards" aria-label="Vista griglia">
            <Grid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Vista tabella">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}