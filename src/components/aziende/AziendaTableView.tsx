import React, { useState } from 'react';
import { useAziende } from '@/hooks/useAziende';
import { Azienda } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Download,
  Upload,
  Filter,
  CheckCircle,
  XCircle,
  Building2,
} from 'lucide-react';

interface AziendaTableViewProps {
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onView: (azienda: Azienda) => void;
  onAddAzienda: () => void;
}

export function AziendaTableView({
  onEdit,
  onDelete,
  onView,
  onAddAzienda
}: AziendaTableViewProps) {
  const { aziende, isLoading } = useAziende();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(aziende.map(a => a.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
    }
  };

  const isAllSelected = aziende.length > 0 && selectedIds.length === aziende.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < aziende.length;

  // Bulk Actions Toolbar
  const BulkActionsToolbar = () => {
    if (selectedIds.length === 0) return null;

    return (
      <div className="sticky top-0 bg-primary/5 border-b border-primary/20 p-4 flex justify-between items-center z-30 backdrop-blur-sm">
        <span className="text-sm font-medium text-primary">
          {selectedIds.length} aziende selezionate
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
            Deseleziona
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Elimina
          </Button>
        </div>
      </div>
    );
  };

  // Table Row Component
  const AziendaTableRow = ({ azienda }: { azienda: Azienda }) => {
    const isSelected = selectedIds.includes(azienda.id);

    return (
      <TableRow className={`hover:bg-muted/50 ${isSelected ? 'bg-primary/5' : ''}`}>
        <TableCell className="w-[50px]">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => handleSelectItem(azienda.id, checked as boolean)}
          />
        </TableCell>
        <TableCell className="min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{azienda.nome}</div>
              <div className="text-sm text-muted-foreground">{azienda.partita_iva}</div>
            </div>
          </div>
        </TableCell>
        <TableCell className="min-w-[140px]">
          <span className="font-mono text-sm">{azienda.partita_iva}</span>
        </TableCell>
        <TableCell className="min-w-[200px]">
          {azienda.email ? (
            <a 
              href={`mailto:${azienda.email}`}
              className="text-primary hover:underline"
            >
              {azienda.email}
            </a>
          ) : (
            <span className="text-muted-foreground italic">Non specificata</span>
          )}
        </TableCell>
        <TableCell className="min-w-[130px]">
          {azienda.telefono ? (
            <a 
              href={`tel:${azienda.telefono}`}
              className="text-primary hover:underline"
            >
              {azienda.telefono}
            </a>
          ) : (
            <span className="text-muted-foreground italic">Non specificato</span>
          )}
        </TableCell>
        <TableCell className="min-w-[150px]">
          {azienda.citta || <span className="text-muted-foreground italic">Non specificata</span>}
        </TableCell>
        <TableCell className="min-w-[100px]">
          {azienda.provvigione ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">
                {azienda.provvigione_tipo === 'percentuale' ? `${azienda.provvigione_valore}%` : 
                 azienda.provvigione_tipo === 'fisso' ? `€${azienda.provvigione_valore}` : 'Attiva'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-muted-foreground">
              <XCircle className="h-4 w-4" />
              <span className="text-sm">Non attiva</span>
            </div>
          )}
        </TableCell>
        <TableCell className="w-[100px]">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background">
              <DropdownMenuItem onClick={() => onView(azienda)}>
                <Eye className="h-4 w-4 mr-2" />
                Visualizza
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(azienda)}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(azienda)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    );
  };

  // Loading Skeleton
  const TableSkeleton = () => (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-4" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[160px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[110px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[130px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
          <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="w-full space-y-4">
      <BulkActionsToolbar />
      
      {/* Table Stats and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {aziende.length} aziende totali
          </span>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtri Avanzati
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Esporta
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importa
          </Button>
          <Button onClick={onAddAzienda}>
            <Building2 className="h-4 w-4 mr-2" />
            Nuova Azienda
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isSomeSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="min-w-[200px]">Nome Azienda</TableHead>
              <TableHead className="min-w-[140px]">P. IVA</TableHead>
              <TableHead className="min-w-[200px]">Email</TableHead>
              <TableHead className="min-w-[130px]">Telefono</TableHead>
              <TableHead className="min-w-[150px]">Città</TableHead>
              <TableHead className="min-w-[100px]">Provvigione</TableHead>
              <TableHead className="w-[100px]">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton />
            ) : aziende.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <span className="text-muted-foreground">Nessuna azienda trovata</span>
                    <Button variant="outline" size="sm" onClick={onAddAzienda}>
                      Crea la prima azienda
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              aziende.map((azienda) => (
                <AziendaTableRow key={azienda.id} azienda={azienda} />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}