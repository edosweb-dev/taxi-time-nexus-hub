import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MobileFirstFilters } from '../mobile-first/MobileFirstFilters';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { ServiziFiltersState } from '../filters/ServiziFilters';

interface MobileServiziSearchProps {
  searchText: string;
  onSearchChange: (value: string) => void;
  showFilters: boolean;
  onShowFiltersChange: (show: boolean) => void;
  filters: ServiziFiltersState;
  onFiltersChange: (filters: ServiziFiltersState) => void;
  onClearFilters: () => void;
  servizi: Servizio[];
  users: Profile[];
}

export function MobileServiziSearch({
  searchText,
  onSearchChange,
  showFilters,
  onShowFiltersChange,
  filters,
  onFiltersChange,
  onClearFilters,
  servizi,
  users
}: MobileServiziSearchProps) {
  const hasActiveFilters = filters.aziendaId || filters.assigneeId || filters.dateFrom || filters.dateTo;

  return (
    <div className="bg-card border-b px-3 py-2 space-y-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Cerca servizi..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-7 h-8 text-sm"
        />
      </div>

      <div className="flex items-center gap-1">
        <Sheet open={showFilters} onOpenChange={onShowFiltersChange}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1 h-8 text-xs">
              <Filter className="h-3 w-3 mr-1" />
              Filtri
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">1</Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Filtri Avanzati</SheetTitle>
            </SheetHeader>
            <MobileFirstFilters
              servizi={servizi}
              users={users}
              filters={filters}
              onFiltersChange={onFiltersChange}
              onClose={() => onShowFiltersChange(false)}
            />
          </SheetContent>
        </Sheet>
        
        {(searchText || hasActiveFilters) && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs h-8 px-2">
            Pulisci
          </Button>
        )}
      </div>
    </div>
  );
}