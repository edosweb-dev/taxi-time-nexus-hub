import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Edit, RotateCcw, UserX, Plus } from 'lucide-react';
import { useDeleteConducenteEsterno, useReactivateConducenteEsterno } from '@/hooks/useConducentiEsterni';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

interface ConducenteEsternoListProps {
  conducenti: ConducenteEsterno[];
  onEdit: (conducente: ConducenteEsterno) => void;
  onAddConducente: () => void;
  title?: string;
  description?: string;
  showOnlyActive?: boolean;
  showOnlyInactive?: boolean;
}

export function ConducenteEsternoList({ 
  conducenti, 
  onEdit, 
  onAddConducente, 
  title = "Conducenti Esterni",
  description = "Gestisci i conducenti esterni",
  showOnlyActive,
  showOnlyInactive 
}: ConducenteEsternoListProps) {
  const deleteMutation = useDeleteConducenteEsterno();
  const reactivateMutation = useReactivateConducenteEsterno();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConducenti = conducenti.filter(conducente =>
    conducente.nome_cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conducente.email && conducente.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDeactivate = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  const handleReactivate = async (id: string) => {
    await reactivateMutation.mutateAsync(id);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="subsection-title">{title}</h3>
            <p className="text-body-sm">{description}</p>
          </div>
          <Button onClick={onAddConducente} className="flex items-center gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuovo Conducente</span>
            <span className="sm:hidden">Aggiungi</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca conducenti..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {filteredConducenti.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm 
                  ? 'Nessun conducente trovato per la ricerca.' 
                  : showOnlyActive 
                  ? "Nessun conducente attivo trovato." 
                  : showOnlyInactive 
                  ? "Nessun conducente inattivo trovato." 
                  : 'Nessun conducente esterno presente.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="rounded-md border min-w-[700px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[250px]">Nome e Cognome</TableHead>
                      <TableHead className="w-[200px]">Email</TableHead>
                      <TableHead className="w-[150px]">Telefono</TableHead>
                      <TableHead className="w-[100px]">Stato</TableHead>
                      <TableHead className="w-[100px] text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredConducenti.map((conducente) => (
                      <TableRow key={conducente.id} className={!conducente.attivo ? 'opacity-60' : ''}>
                        <TableCell className="font-medium">{conducente.nome_cognome}</TableCell>
                        <TableCell>{conducente.email || '-'}</TableCell>
                        <TableCell>{conducente.telefono || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={conducente.attivo ? 'default' : 'secondary'}>
                            {conducente.attivo ? 'Attivo' : 'Inattivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => onEdit(conducente)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifica
                              </DropdownMenuItem>
                              {conducente.attivo ? (
                                <DropdownMenuItem 
                                  onClick={() => handleDeactivate(conducente.id)}
                                  className="text-destructive"
                                >
                                  <UserX className="h-4 w-4 mr-2" />
                                  Disattiva
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleReactivate(conducente.id)}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Riattiva
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}