
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Azienda } from "@/lib/types";
import { Edit, Trash2, Eye, Plus, Search, Building2, Phone, Mail, MapPin } from "lucide-react";
import { useState, useMemo } from "react";

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

  return (
    <div className="space-y-6">
      {/* Header con ricerca e azione */}
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
        <Button onClick={onAddAzienda}>
          <Plus className="mr-2 h-4 w-4" /> Nuova Azienda
        </Button>
      </div>

      {aziende.length === 0 ? (
        <div className="text-center py-16">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nessuna azienda presente
          </h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Inizia aggiungendo la prima azienda cliente al sistema.
          </p>
          <Button onClick={onAddAzienda}>
            <Plus className="mr-2 h-4 w-4" /> Aggiungi la prima azienda
          </Button>
        </div>
      ) : filteredAziende.length === 0 ? (
        <div className="text-center py-16">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Nessun risultato trovato
          </h3>
          <p className="text-muted-foreground mb-6">
            Prova a modificare i termini di ricerca.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAziende.map((azienda) => (
            <Card key={azienda.id} className="group hover:shadow-md transition-all duration-200 cursor-pointer">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <h3 
                      className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1"
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
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(azienda);
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(azienda);
                      }}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Badge variant="secondary" className="self-start text-xs">
                  P.IVA: {azienda.partita_iva}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3" onClick={() => onView(azienda)}>
                {azienda.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{azienda.email}</span>
                  </div>
                )}
                {azienda.telefono && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{azienda.telefono}</span>
                  </div>
                )}
                {azienda.citta && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{azienda.citta}</span>
                  </div>
                )}
                {!azienda.email && !azienda.telefono && !azienda.citta && (
                  <p className="text-sm text-muted-foreground italic">
                    Informazioni di contatto non disponibili
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Risultati di ricerca */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground">
          {filteredAziende.length} di {aziende.length} aziende
        </div>
      )}
    </div>
  );
}
