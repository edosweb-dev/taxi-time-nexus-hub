import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Eye } from 'lucide-react';
import { ClientePrivato } from '@/lib/types/servizi';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DesktopClientiPrivatiListProps {
  clienti: ClientePrivato[];
  onEdit: (cliente: ClientePrivato) => void;
  onDelete: (cliente: ClientePrivato) => void;
  onView: (cliente: ClientePrivato) => void;
  onAddCliente: () => void;
}

export function DesktopClientiPrivatiList({
  clienti,
  onEdit,
  onDelete,
  onView,
  onAddCliente,
}: DesktopClientiPrivatiListProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Clienti Privati</h1>
          <p className="text-muted-foreground mt-2">
            Gestisci l'anagrafica dei clienti privati
          </p>
        </div>
        <Button onClick={onAddCliente}>
          <Plus className="h-4 w-4 mr-2" />
          Nuovo Cliente
        </Button>
      </div>

      {clienti.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Nessun cliente privato trovato</p>
              <Button onClick={onAddCliente} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crea il primo cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cognome</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Città</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clienti.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.cognome}</TableCell>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.email || '-'}</TableCell>
                    <TableCell>{cliente.telefono || '-'}</TableCell>
                    <TableCell>{cliente.citta || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => onView(cliente)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onEdit(cliente)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => onDelete(cliente)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
