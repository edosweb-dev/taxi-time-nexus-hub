import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Search, Edit, RotateCcw, UserX } from 'lucide-react';
import { useConducentiEsterni, useDeleteConducenteEsterno, useReactivateConducenteEsterno } from '@/hooks/useConducentiEsterni';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

interface ConducenteEsternoListProps {
  onEdit: (conducente: ConducenteEsterno) => void;
}

export function ConducenteEsternoList({ onEdit }: ConducenteEsternoListProps) {
  const { data: conducenti = [], isLoading } = useConducentiEsterni();
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

  if (isLoading) {
    return <div>Caricamento conducenti esterni...</div>;
  }

  return (
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

      <div className="grid gap-4">
        {filteredConducenti.map((conducente) => (
          <Card key={conducente.id} className={!conducente.attivo ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{conducente.nome_cognome}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={conducente.attivo ? 'default' : 'secondary'}>
                      {conducente.attivo ? 'Attivo' : 'Disattivato'}
                    </Badge>
                  </div>
                </div>
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                {conducente.email && (
                  <div>Email: {conducente.email}</div>
                )}
                {conducente.telefono && (
                  <div>Telefono: {conducente.telefono}</div>
                )}
                {conducente.note && (
                  <div>Note: {conducente.note}</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConducenti.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nessun conducente trovato per la ricerca.' : 'Nessun conducente esterno presente.'}
        </div>
      )}
    </div>
  );
}