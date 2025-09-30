import { useState, useMemo, useEffect } from "react";
import { Azienda } from "@/lib/types";
import { useAllReferenti } from "@/hooks/useReferenti";
import { ReferentiDialog } from "../ReferentiDialog";
import { Pagination } from "../Pagination";
import { MobileAziendaHeader } from "./MobileAziendaHeader";
import { MobileAziendaCard } from "./MobileAziendaCard";
import { MobileAziendaFilters } from "./MobileAziendaFilters";
import { MobileAziendaCardSkeleton } from "./MobileAziendaCardSkeleton";
import { Building2, Search, Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileAziendaListProps {
  aziende: Azienda[];
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onView: (azienda: Azienda) => void;
  onAddAzienda: () => void;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function MobileAziendaList({
  aziende,
  onEdit,
  onDelete,
  onView,
  onAddAzienda,
  isLoading = false,
  isError = false,
  onRetry,
}: MobileAziendaListProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("tutte");
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [referentiDialogOpen, setReferentiDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = isMobile ? 8 : 12;
  
  const { data: referentiByAzienda = {} } = useAllReferenti();

  const filteredAziende = useMemo(() => {
    let filtered = aziende;

    // Apply filter
    if (activeFilter === 'con-firma') {
      filtered = filtered.filter(a => a.firma_digitale_attiva);
    } else if (activeFilter === 'con-provvigione') {
      filtered = filtered.filter(a => a.provvigione);
    } else if (activeFilter === 'senza-referenti') {
      filtered = filtered.filter(a => !referentiByAzienda[a.id] || referentiByAzienda[a.id].length === 0);
    }

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter((azienda) =>
        azienda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        azienda.partita_iva.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (azienda.email && azienda.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (azienda.telefono && azienda.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (azienda.citta && azienda.citta.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    return filtered;
  }, [aziende, searchTerm, activeFilter, referentiByAzienda]);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAziende.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAziende = filteredAziende.slice(startIndex, endIndex);

  const handleReferentiClick = (azienda: Azienda) => {
    setSelectedAzienda(azienda);
    setReferentiDialogOpen(true);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="page-container-safe mobile-layout-safe">
        <MobileAziendaHeader
          searchTerm=""
          onSearchChange={() => {}}
          totalCount={0}
          filteredCount={0}
        />
        <div className="px-4 py-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <MobileAziendaCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="page-container-safe mobile-layout-safe">
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Errore caricamento</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Non è stato possibile caricare le aziende
          </p>
          {onRetry && (
            <Button onClick={onRetry}>Riprova</Button>
          )}
        </div>
      </div>
    );
  }

  // Empty state
  if (aziende.length === 0) {
    return (
      <div className="text-center py-16">
        <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nessuna azienda presente
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          Inizia aggiungendo la prima azienda cliente al sistema.
        </p>
        <Button onClick={onAddAzienda}>
          <Plus className="mr-2 h-4 w-4" /> Aggiungi la prima azienda
        </Button>
      </div>
    );
  }

  // No search/filter results
  if (filteredAziende.length === 0) {
    return (
      <div className="page-container-safe mobile-layout-safe">
        <MobileAziendaHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalCount={aziende.length}
          filteredCount={filteredAziende.length}
        />
        
        <MobileAziendaFilters
          aziende={aziende}
          referentiByAzienda={referentiByAzienda}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
        
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <Search className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nessun risultato</h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Prova a modificare i criteri di ricerca o filtri
          </p>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setActiveFilter("tutte");
          }}>
            Resetta filtri
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container-safe mobile-layout-safe">
      <MobileAziendaHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        totalCount={aziende.length}
        filteredCount={filteredAziende.length}
      />

      <MobileAziendaFilters
        aziende={aziende}
        referentiByAzienda={referentiByAzienda}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Content - cards list */}
      <div className="px-4 py-4 pb-32 space-y-3">
        {paginatedAziende.map((azienda) => (
          <MobileAziendaCard
            key={azienda.id}
            azienda={azienda}
            referentiCount={referentiByAzienda[azienda.id]?.length || 0}
            onView={() => onView(azienda)}
            onEdit={() => onEdit(azienda)}
            onDelete={() => onDelete(azienda)}
            onReferentiClick={() => handleReferentiClick(azienda)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 pb-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAziende.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <Button
        onClick={onAddAzienda}
        size="lg"
        className="fixed bottom-24 right-4 z-20 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all md:hidden"
      >
        <Plus className="h-6 w-6" />
      </Button>
      
      {/* Referenti Dialog */}
      {selectedAzienda && (
        <ReferentiDialog
          open={referentiDialogOpen}
          onOpenChange={setReferentiDialogOpen}
          referenti={referentiByAzienda[selectedAzienda.id] || []}
          aziendaNome={selectedAzienda.nome}
        />
      )}
    </div>
  );
}