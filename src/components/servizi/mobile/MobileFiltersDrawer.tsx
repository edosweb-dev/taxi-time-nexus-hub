import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SlidersHorizontal } from 'lucide-react';
import { ServiziFilters, type ServiziFiltersState } from '../filters/ServiziFilters';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';

interface MobileFiltersDrawerProps {
  servizi: Servizio[];
  users: Profile[];
  filters: ServiziFiltersState;
  onFiltersChange: (filters: ServiziFiltersState) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
}

export function MobileFiltersDrawer({
  servizi,
  users,
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters
}: MobileFiltersDrawerProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="flex-1">
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filtri
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader className="pb-4">
          <SheetTitle className="text-center">Filtri Servizi</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <ServiziFilters
            servizi={servizi}
            users={users}
            filters={filters}
            onFiltersChange={onFiltersChange}
            onApplyFilters={onApplyFilters}
            onClearFilters={onClearFilters}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}