import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

interface MobileAziendaHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddAzienda: () => void;
  totalCount: number;
  filteredCount: number;
}

export function MobileAziendaHeader({
  searchTerm,
  onSearchChange,
  onAddAzienda,
  totalCount,
  filteredCount,
}: MobileAziendaHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Search bar - full width on mobile */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Cerca aziende..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 w-full"
        />
      </div>
      
      {/* Actions row */}
      <div className="flex items-center justify-between gap-2">        
        {/* Results counter - hidden on very small screens */}
        {searchTerm && (
          <div className="text-xs text-muted-foreground hidden xs:block truncate">
            {filteredCount} di {totalCount}
          </div>
        )}
        
        {/* Add button - full text on larger screens, icon only on small */}
        <Button onClick={onAddAzienda} size="sm" className="shrink-0">
          <Plus className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Nuova Azienda</span>
        </Button>
      </div>
      
      {/* Mobile results counter */}
      {searchTerm && (
        <div className="text-xs text-muted-foreground xs:hidden">
          {filteredCount} di {totalCount} aziende
        </div>
      )}
    </div>
  );
}