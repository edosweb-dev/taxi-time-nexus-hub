import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useConducentiEsterniAttivi } from '@/hooks/useConducentiEsterni';
import { ConducenteEsternoSheet } from '@/components/conducenti-esterni/ConducenteEsternoSheet';

interface ConducenteEsternoSelectProps {
  selectedConducenteId: string;
  setSelectedConducenteId: (value: string) => void;
  onCreateNew?: () => void;
}

export function ConducenteEsternoSelect({
  selectedConducenteId,
  setSelectedConducenteId,
  onCreateNew
}: ConducenteEsternoSelectProps) {
  const { data: conducenti = [], isLoading } = useConducentiEsterniAttivi();
  const [showCreateSheet, setShowCreateSheet] = useState(false);

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setShowCreateSheet(true);
    }
  };

  return (
    <>
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="conducente-esterno-select">Seleziona Conducente Esterno</Label>
        <div className="flex gap-2">
          <Select value={selectedConducenteId} onValueChange={setSelectedConducenteId}>
            <SelectTrigger id="conducente-esterno-select" className="flex-1">
              <SelectValue placeholder="Seleziona un conducente esterno" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {isLoading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : conducenti.length > 0 ? (
                conducenti.map((conducente) => (
                  <SelectItem key={conducente.id} value={conducente.id}>
                    <div>
                      <div className="font-medium">{conducente.nome_cognome}</div>
                      {conducente.email && (
                        <div className="text-xs text-muted-foreground">{conducente.email}</div>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Nessun conducente esterno disponibile
                </div>
              )}
            </SelectContent>
          </Select>
          
          <Button type="button" variant="outline" size="sm" onClick={handleCreateNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Seleziona un conducente esterno dalla lista o aggiungine uno nuovo
        </p>
      </div>

      <ConducenteEsternoSheet
        open={showCreateSheet}
        onOpenChange={setShowCreateSheet}
        mode="create"
      />
    </>
  );
}