import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MobileAziendaHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function MobileAziendaHeader({
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount,
}: MobileAziendaHeaderProps) {
  return (
    <div className="sticky top-0 z-20 bg-background border-b md:hidden">
      {/* Title bar con stats */}
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Aziende</h1>
          <p className="text-xs text-muted-foreground">
            {searchTerm ? `${filteredCount} di ${totalCount}` : `${totalCount} totali`}
          </p>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cerca per nome, P.IVA, città..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 text-base"
          />
        </div>
      </div>
    </div>
  );
}