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
    <div className="bg-card border-b p-4 space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cerca servizi..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex items-center gap-2">
        <Sheet open={showFilters} onOpenChange={onShowFiltersChange}>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <Filter className="h-4 w-4 mr-2" />
              Filtri
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs">1</Badge>
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
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
            Pulisci
          </Button>
        )}
      </div>
    </div>
  );
}