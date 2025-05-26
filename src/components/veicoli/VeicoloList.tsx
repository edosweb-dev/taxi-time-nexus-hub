
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { Veicolo } from '@/lib/types/veicoli';

interface VeicoloListProps {
  veicoli: Veicolo[];
  onEdit: (veicolo: Veicolo) => void;
  onDelete: (veicolo: Veicolo) => void;
}

export function VeicoloList({ veicoli, onEdit, onDelete }: VeicoloListProps) {
  if (veicoli.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nessun veicolo trovato</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Modello</TableHead>
          <TableHead>Targa</TableHead>
          <TableHead>Anno</TableHead>
          <TableHead>Colore</TableHead>
          <TableHead>Posti</TableHead>
          <TableHead>Stato</TableHead>
          <TableHead>Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {veicoli.map((veicolo) => (
          <TableRow key={veicolo.id}>
            <TableCell className="font-medium">{veicolo.modello}</TableCell>
            <TableCell className="font-mono">{veicolo.targa}</TableCell>
            <TableCell>{veicolo.anno || '-'}</TableCell>
            <TableCell>{veicolo.colore || '-'}</TableCell>
            <TableCell>{veicolo.numero_posti || '-'}</TableCell>
            <TableCell>
              <Badge variant={veicolo.attivo ? 'default' : 'secondary'}>
                {veicolo.attivo ? 'Attivo' : 'Disattivato'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(veicolo)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {veicolo.attivo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(veicolo)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
