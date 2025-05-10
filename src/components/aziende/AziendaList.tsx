
import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  PencilIcon, 
  Trash2Icon, 
  BuildingIcon,
  PlusIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';
import { Azienda } from '@/lib/types';

interface AziendaListProps {
  aziende: Azienda[];
  onEdit: (azienda: Azienda) => void;
  onDelete: (azienda: Azienda) => void;
  onAddAzienda: () => void;
}

export function AziendaList({ aziende, onEdit, onDelete, onAddAzienda }: AziendaListProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Aziende</h2>
        <Button onClick={onAddAzienda}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Nuova Azienda
        </Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Partita IVA</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefono</TableHead>
            <TableHead>Firma Digitale</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {aziende.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Nessuna azienda trovata. Creane una!
              </TableCell>
            </TableRow>
          ) : (
            aziende.map((azienda) => (
              <TableRow key={azienda.id}>
                <TableCell className="font-medium">{azienda.nome}</TableCell>
                <TableCell>{azienda.partita_iva}</TableCell>
                <TableCell>{azienda.email || '-'}</TableCell>
                <TableCell>{azienda.telefono || '-'}</TableCell>
                <TableCell>
                  {azienda.firma_digitale_attiva ? (
                    <CheckIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <XIcon className="h-4 w-4 text-gray-400" />
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(azienda)}
                    >
                      <PencilIcon className="h-4 w-4" />
                      <span className="sr-only">Modifica</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive/80"
                      onClick={() => onDelete(azienda)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                      <span className="sr-only">Elimina</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
