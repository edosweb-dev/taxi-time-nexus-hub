
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Veicolo } from '@/lib/types/veicoli';

interface VeicoloListProps {
  veicoli: Veicolo[];
  onEdit: (veicolo: Veicolo) => void;
  onDelete: (veicolo: Veicolo) => void;
  onAddVeicolo: () => void;
  title?: string;
  description?: string;
  showOnlyActive?: boolean;
  showOnlyInactive?: boolean;
}

export function VeicoloList({ 
  veicoli, 
  onEdit, 
  onDelete, 
  onAddVeicolo, 
  title = "Veicoli",
  description = "Gestisci la flotta veicoli",
  showOnlyActive,
  showOnlyInactive 
}: VeicoloListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="subsection-title">{title}</h3>
            <p className="text-body-sm">{description}</p>
          </div>
          <Button onClick={onAddVeicolo} className="flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Aggiungi Veicolo</span>
            <span className="sm:hidden">Aggiungi</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {veicoli.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {showOnlyActive ? "Nessun veicolo attivo trovato." :
               showOnlyInactive ? "Nessun veicolo inattivo trovato." :
               "Nessun veicolo trovato."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="rounded-md border min-w-[800px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Modello</TableHead>
                    <TableHead className="w-[120px]">Targa</TableHead>
                    <TableHead className="w-[80px]">Anno</TableHead>
                    <TableHead className="w-[100px]">Colore</TableHead>
                    <TableHead className="w-[80px] text-center">Posti</TableHead>
                    <TableHead className="w-[100px]">Stato</TableHead>
                    <TableHead className="w-[120px] text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {veicoli.map((veicolo) => (
                    <TableRow key={veicolo.id}>
                      <TableCell className="font-medium">{veicolo.modello}</TableCell>
                      <TableCell className="font-mono">{veicolo.targa}</TableCell>
                      <TableCell>{veicolo.anno || '-'}</TableCell>
                      <TableCell>{veicolo.colore || '-'}</TableCell>
                      <TableCell className="text-center">{veicolo.numero_posti || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={veicolo.attivo ? 'default' : 'secondary'}>
                          {veicolo.attivo ? 'Attivo' : 'Inattivo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(veicolo)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {veicolo.attivo && (
                            <Button
                              variant="ghost"
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
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
