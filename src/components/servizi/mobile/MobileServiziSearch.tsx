import { Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MobileFirstFilters } from '../mobile-first/MobileFirstFilters';
import { useResponsiveStyles } from '@/hooks/useResponsiveStyles';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { ServiziFiltersState } from '../filters/ServiziFilters';
import { useNavigate } from 'react-router-dom';

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
  showFilters,
  onShowFiltersChange,
  filters,
  onFiltersChange,
  onClearFilters,
  servizi,
  users
}: MobileServiziSearchProps) {
  const navigate = useNavigate();
  const hasActiveFilters = filters.aziendaId || filters.assigneeId || filters.dateFrom || filters.dateTo;
  const { sectionSpacing } = useResponsiveStyles();

  return (
    <div className={`bg-card border-b w-full ${sectionSpacing}`}>
      <div className="flex items-center gap-2">
        <Button 
          variant="default" 
          className="flex-1"
          onClick={() => navigate('/servizi/ricerca')}
        >
          <Search className="h-4 w-4 mr-2" />
          Cerca
        </Button>
        
        <Sheet open={showFilters} onOpenChange={onShowFiltersChange}>
          <SheetTrigger asChild>
            <Button variant="outline">
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
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-xs">
            Pulisci
          </Button>
        )}
      </div>
    </div>
  );
}
