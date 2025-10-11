import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Eye, Mail, Phone, MapPin } from 'lucide-react';
import { ClientePrivato } from '@/lib/types/servizi';

interface MobileClientiPrivatiListProps {
  clienti: ClientePrivato[];
  onEdit: (cliente: ClientePrivato) => void;
  onDelete: (cliente: ClientePrivato) => void;
  onView: (cliente: ClientePrivato) => void;
  onAddCliente: () => void;
}

export function MobileClientiPrivatiList({
  clienti,
  onEdit,
  onDelete,
  onView,
  onAddCliente,
}: MobileClientiPrivatiListProps) {
  return (
    <div className="space-y-4 pb-20">
      {/* Header Mobile */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-4 pt-2">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h1 className="text-2xl font-bold">Clienti Privati</h1>
            <p className="text-sm text-muted-foreground">
              {clienti.length} {clienti.length === 1 ? 'cliente' : 'clienti'}
            </p>
          </div>
        </div>
        <Button 
          onClick={onAddCliente} 
          className="w-full"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuovo Cliente
        </Button>
      </div>

      {/* Lista Clienti */}
      {clienti.length === 0 ? (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">Nessun cliente privato trovato</p>
              <Button onClick={onAddCliente} variant="outline" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Crea il primo cliente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clienti.map((cliente) => (
            <Card 
              key={cliente.id} 
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Nome Cliente */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {cliente.cognome} {cliente.nome}
                      </h3>
                    </div>
                  </div>

                  {/* Info Cliente */}
                  <div className="space-y-2">
                    {cliente.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{cliente.email}</span>
                      </div>
                    )}
                    {cliente.telefono && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span>{cliente.telefono}</span>
                      </div>
                    )}
                    {cliente.citta && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span>{cliente.citta}</span>
                      </div>
                    )}
                  </div>

                  {/* Azioni */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onView(cliente)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Dettagli
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onEdit(cliente)}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Modifica
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onDelete(cliente)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
