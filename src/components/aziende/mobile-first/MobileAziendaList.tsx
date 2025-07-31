import { useState, useMemo, useEffect } from "react";
import { Azienda } from "@/lib/types";
import { useAllReferenti } from "@/hooks/useReferenti";
import { ReferentiDialog } from "../ReferentiDialog";
import { Pagination } from "../Pagination";
import { MobileAziendaHeader } from "./MobileAziendaHeader";
import { MobileAziendaCard } from "./MobileAziendaCard";
import { MobileAziendaTable } from "./MobileAziendaTable";
import { Building2, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileAziendaListProps {
  aziende: Azienda[];
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onView: (azienda: Azienda) => void;
  onAddAzienda: () => void;
}

export function MobileAziendaList({
  aziende,
  onEdit,
  onDelete,
  onView,
  onAddAzienda,
}: MobileAziendaListProps) {
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">(isMobile ? "cards" : "table");
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [referentiDialogOpen, setReferentiDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = isMobile ? 8 : 12;
  
  const { data: referentiByAzienda = {} } = useAllReferenti();

  // Update view mode based on screen size
  useEffect(() => {
    if (isMobile && viewMode === "table") {
      setViewMode("cards");
    }
  }, [isMobile, viewMode]);

  const filteredAziende = useMemo(() => {
    if (!searchTerm) return aziende;
    
    return aziende.filter((azienda) =>
      azienda.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      azienda.partita_iva.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (azienda.email && azienda.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (azienda.telefono && azienda.telefono.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (azienda.citta && azienda.citta.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [aziende, searchTerm]);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredAziende.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAziende = filteredAziende.slice(startIndex, endIndex);

  const handleReferentiClick = (azienda: Azienda) => {
    setSelectedAzienda(azienda);
    setReferentiDialogOpen(true);
  };

  const handleViewModeChange = () => {
    // On mobile, always stay in cards mode
    if (isMobile) return;
    setViewMode(viewMode === "cards" ? "table" : "cards");
  };

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

  // No search results
  if (filteredAziende.length === 0) {
    return (
      <div className="space-y-6">
        <MobileAziendaHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          onAddAzienda={onAddAzienda}
          totalCount={aziende.length}
          filteredCount={filteredAziende.length}
        />
        
        <div className="text-center py-16">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nessun risultato trovato
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Prova a modificare i termini di ricerca.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <MobileAziendaHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onAddAzienda={onAddAzienda}
        totalCount={aziende.length}
        filteredCount={filteredAziende.length}
      />

      {/* Content based on view mode */}
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
      ) : (
        <MobileAziendaTable
          aziende={paginatedAziende}
          referentiByAzienda={referentiByAzienda}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onReferentiClick={handleReferentiClick}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAziende.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
      
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