import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Building2 } from "lucide-react";

interface DesktopAziendaHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddAzienda: () => void;
  totalCount: number;
  filteredCount: number;
}

export function DesktopAziendaHeader({
  searchTerm,
  onSearchChange,
  onAddAzienda,
  totalCount,
  filteredCount,
}: DesktopAziendaHeaderProps) {
  return (
    <div className="bg-card border rounded-lg p-6 space-y-4">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Gestione Aziende</h2>
            <p className="text-sm text-muted-foreground">
              {totalCount} aziende totali
            </p>
          </div>
        </div>
        <Button onClick={onAddAzienda} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          Nuova Azienda
        </Button>
      </div>
      
      {/* Search section */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca per nome, P.IVA, email, telefono o città..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Results counter */}
        {searchTerm && (
          <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-lg">
            {filteredCount} di {totalCount} aziende
          </div>
        )}
      </div>
    </div>
  );
}