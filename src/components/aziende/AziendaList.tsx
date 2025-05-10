
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Azienda } from "@/lib/types";
import { Edit, Trash2, Eye, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AziendaListProps {
  aziende: Azienda[];
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onAddAzienda: () => void;
}

export function AziendaList({
  aziende,
  onEdit,
  onDelete,
  onAddAzienda,
}: AziendaListProps) {
  const navigate = useNavigate();

  const handleViewAzienda = (azienda: Azienda) => {
    navigate(`/aziende/${azienda.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAddAzienda}>
          <Plus className="mr-2 h-4 w-4" /> Nuova Azienda
        </Button>
      </div>

      {aziende.length === 0 ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground mb-4">
            Nessuna azienda presente nel sistema.
          </p>
          <Button onClick={onAddAzienda}>
            <Plus className="mr-2 h-4 w-4" /> Aggiungi la prima azienda
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Nome</TableHead>
                <TableHead>Partita IVA</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefono</TableHead>
                <TableHead className="text-right">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aziende.map((azienda) => (
                <TableRow key={azienda.id}>
                  <TableCell className="font-medium">{azienda.nome}</TableCell>
                  <TableCell>{azienda.partita_iva}</TableCell>
                  <TableCell>{azienda.email || "-"}</TableCell>
                  <TableCell>{azienda.telefono || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewAzienda(azienda)}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Visualizza</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(azienda)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Modifica</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(azienda)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Elimina</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
