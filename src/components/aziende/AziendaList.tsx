
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Azienda } from "@/lib/types";
import { Edit, Trash2, Eye, Plus, Search, Building2, Phone, Mail, MapPin, LayoutGrid, List, Users } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useAllReferenti } from "@/hooks/useReferenti";
import { ReferentiDialog } from "./ReferentiDialog";
import { Pagination } from "./Pagination";

interface AziendaListProps {
  aziende: Azienda[];
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onView: (azienda: Azienda) => void;
  onAddAzienda: () => void;
}

export function AziendaList({
  aziende,
  onEdit,
  onDelete,
  onView,
  onAddAzienda,
}: AziendaListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [referentiDialogOpen, setReferentiDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const itemsPerPage = 12;
  
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

  const handleReferentiClick = (azienda: Azienda, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAzienda(azienda);
    setReferentiDialogOpen(true);
  };

  return (
    <div className="space-y-6">{/* Header con ricerca e azioni */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cerca aziende..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "cards" ? "table" : "cards")}
            className="px-3"
          >
            {viewMode === "cards" ? (
              <List className="h-4 w-4" />
            ) : (
              <LayoutGrid className="h-4 w-4" />
            )}
          </Button>
          <Button onClick={onAddAzienda}>
            <Plus className="mr-2 h-4 w-4" /> Nuova Azienda
          </Button>
        </div>
      </div>

      {aziende.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-base font-medium text-foreground mb-2">
            Nessuna azienda presente
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Inizia aggiungendo la prima azienda cliente al sistema.
          </p>
          <Button onClick={onAddAzienda} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Aggiungi la prima azienda
          </Button>
        </div>
      ) : filteredAziende.length === 0 ? (
        <div className="text-center py-16">
          <Search className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-base font-medium text-foreground mb-2">
            Nessun risultato trovato
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Prova a modificare i termini di ricerca.
          </p>
        </div>
      ) : viewMode === "cards" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedAziende.map((azienda) => (
            <Card key={azienda.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <h3 
                      className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1"
                      onClick={() => onView(azienda)}
                    >
                      {azienda.nome}
                    </h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(azienda);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(azienda);
                      }}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(azienda);
                      }}
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <Badge variant="secondary" className="self-start text-xs">
                  P.IVA: {azienda.partita_iva}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-2" onClick={() => onView(azienda)}>
                {azienda.email && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{azienda.email}</span>
                  </div>
                )}
                {azienda.telefono && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{azienda.telefono}</span>
                  </div>
                )}
                {azienda.citta && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{azienda.citta}</span>
                  </div>
                )}
                <div 
                  className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={(e) => handleReferentiClick(azienda, e)}
                >
                  <Users className="h-3 w-3" />
                  <span>{referentiByAzienda[azienda.id]?.length || 0} referenti</span>
                </div>
                {!azienda.email && !azienda.telefono && !azienda.citta && (
                  <p className="text-xs text-muted-foreground italic">
                    Informazioni di contatto non disponibili
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Pagination for cards view */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAziende.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Azienda</TableHead>
                  <TableHead className="text-xs">P.IVA</TableHead>
                  <TableHead className="text-xs">Contatti</TableHead>
                  <TableHead className="text-xs">Referenti</TableHead>
                  <TableHead className="text-xs w-[100px]">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAziende.map((azienda) => (
                <TableRow key={azienda.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => onView(azienda)}>
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{azienda.nome}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <Badge variant="secondary" className="text-xs">
                      {azienda.partita_iva}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="space-y-1">
                      {azienda.email && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span className="truncate max-w-[150px]">{azienda.email}</span>
                        </div>
                      )}
                      {azienda.telefono && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          <span>{azienda.telefono}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div 
                      className="flex items-center gap-1 text-xs text-muted-foreground cursor-pointer hover:text-primary transition-colors"
                      onClick={(e) => handleReferentiClick(azienda, e)}
                    >
                      <Users className="h-3 w-3" />
                      <span>{referentiByAzienda[azienda.id]?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onView(azienda);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(azienda);
                        }}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(azienda);
                        }}
                        className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination for table view */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredAziende.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </>
      )}
      
      {/* Search results info */}
      {searchTerm && filteredAziende.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {filteredAziende.length} di {aziende.length} aziende trovate
        </div>
      )}
      
      {/* Dialog per i referenti */}
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
