import { useState, useMemo, useEffect } from "react";
import { Azienda } from "@/lib/types";
import { useAllReferenti } from "@/hooks/useReferenti";
import { ReferentiDialog } from "./ReferentiDialog";
import { Pagination } from "./Pagination";
import { DesktopAziendaHeader } from "./DesktopAziendaHeader";
import { DesktopAziendaCard } from "./DesktopAziendaCard";
import { Building2, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DesktopAziendaListProps {
  aziende: Azienda[];
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onView: (azienda: Azienda) => void;
  onAddAzienda: () => void;
}

export function DesktopAziendaList({
  aziende,
  onEdit,
  onDelete,
  onView,
  onAddAzienda,
}: DesktopAziendaListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [referentiDialogOpen, setReferentiDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 9; // 3x3 grid for desktop
  
  const { data: referentiByAzienda = {} } = useAllReferenti();

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

  // Empty state
  if (aziende.length === 0) {
    return (
      <div className="space-y-6">
        <DesktopAziendaHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddAzienda={onAddAzienda}
          totalCount={aziende.length}
          filteredCount={filteredAziende.length}
        />
        
        <div className="text-center py-20 bg-card border rounded-lg">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Nessuna azienda presente
            </h3>
            <p className="text-muted-foreground mb-8">
              Inizia aggiungendo la prima azienda cliente al sistema per gestire i tuoi contatti business.
            </p>
            <Button onClick={onAddAzienda} size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Aggiungi la prima azienda
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No search results
  if (filteredAziende.length === 0) {
    return (
      <div className="space-y-6">
        <DesktopAziendaHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddAzienda={onAddAzienda}
          totalCount={aziende.length}
          filteredCount={filteredAziende.length}
        />
        
        <div className="text-center py-20 bg-card border rounded-lg">
          <div className="max-w-md mx-auto">
            <div className="p-4 bg-muted rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">
              Nessun risultato trovato
            </h3>
            <p className="text-muted-foreground mb-8">
              La ricerca "<strong>{searchTerm}</strong>" non ha prodotto risultati. Prova con termini diversi.
            </p>
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              Cancella ricerca
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DesktopAziendaHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddAzienda={onAddAzienda}
        totalCount={aziende.length}
        filteredCount={filteredAziende.length}
      />

      {/* Cards grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedAziende.map((azienda) => (
          <DesktopAziendaCard
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
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredAziende.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>
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