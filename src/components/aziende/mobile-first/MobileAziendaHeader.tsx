import { Input } from "@/components/ui/input";
import { Search, FileSignature, Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MobileAziendaHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
  showFirmaDigitale: boolean;
  onShowFirmaDigitaleChange: (show: boolean) => void;
  showProvvigioni: boolean;
  onShowProvvigioniChange: (show: boolean) => void;
}

export function MobileAziendaHeader({
  searchTerm,
  onSearchChange,
  totalCount,
  filteredCount,
  showFirmaDigitale,
  onShowFirmaDigitaleChange,
  showProvvigioni,
  onShowProvvigioniChange,
}: MobileAziendaHeaderProps) {
  return (
    <div className="w-full sticky top-0 z-20 bg-background border-b md:hidden">
      {/* Title bar con stats */}
      <div className="flex items-center justify-between py-3">
        <div>
          <h1 className="text-lg font-semibold">Aziende</h1>
          <p className="text-xs text-muted-foreground">
            {searchTerm || showFirmaDigitale || showProvvigioni
              ? `${filteredCount} di ${totalCount}` 
              : `${totalCount} totali`
            }
          </p>
        </div>
      </div>
      
      {/* Search bar */}
      <div className="pb-2">
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

      {/* Filters */}
      <div className="pb-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <Badge
          variant={showFirmaDigitale ? "default" : "outline"}
          className="cursor-pointer shrink-0 active:scale-95 transition-transform"
          onClick={() => onShowFirmaDigitaleChange(!showFirmaDigitale)}
        >
          <FileSignature className="h-3 w-3 mr-1" />
          Firma Digitale
        </Badge>

        <Badge
          variant={showProvvigioni ? "default" : "outline"}
          className="cursor-pointer shrink-0 active:scale-95 transition-transform"
          onClick={() => onShowProvvigioniChange(!showProvvigioni)}
        >
          <Percent className="h-3 w-3 mr-1" />
          Provvigioni
        </Badge>
      </div>
    </div>
  );
}