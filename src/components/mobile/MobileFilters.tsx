import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MobileFiltersProps {
  title?: string;
  children: ReactNode;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  activeFiltersCount?: number;
  className?: string;
  triggerLabel?: string;
  triggerClassName?: string;
}

export function MobileFilters({
  title = "Filtri",
  children,
  onApplyFilters,
  onClearFilters,
  activeFiltersCount = 0,
  className,
  triggerLabel = "Filtri",
  triggerClassName
}: MobileFiltersProps) {
  const [open, setOpen] = useState(false);

  const handleApply = () => {
    onApplyFilters();
    setOpen(false);
  };

  const handleClear = () => {
    onClearFilters();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn("relative", triggerClassName)}
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          {triggerLabel}
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent 
        side="bottom" 
        className={cn("h-[85vh] rounded-t-xl flex flex-col", className)}
      >
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-left">{title}</SheetTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFiltersCount} filtri attivi
              </Badge>
            )}
          </div>
        </SheetHeader>
        
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto py-4">
          {children}
        </div>
        
        {/* Fixed action buttons */}
        <div className="border-t pt-4 flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleClear}
            className="flex-1"
            disabled={activeFiltersCount === 0}
          >
            <X className="h-4 w-4 mr-2" />
            Pulisci
          </Button>
          <Button 
            onClick={handleApply}
            className="flex-1"
          >
            Applica Filtri
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}