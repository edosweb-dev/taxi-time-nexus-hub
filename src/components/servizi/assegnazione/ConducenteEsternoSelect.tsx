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
      <div className="grid w-full items-center gap-3">
        <Label htmlFor="conducente-esterno-select" className="text-sm font-semibold text-foreground">
          Seleziona Conducente Esterno
        </Label>
        <div className="flex gap-3">
          <Select value={selectedConducenteId} onValueChange={setSelectedConducenteId}>
            <SelectTrigger 
              id="conducente-esterno-select" 
              className="flex-1 h-12 border-2 focus:border-primary transition-all duration-200 rounded-xl"
            >
              <SelectValue placeholder="Seleziona un conducente esterno" />
            </SelectTrigger>
            <SelectContent className="max-h-80 rounded-xl border-2 shadow-lg">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="ml-2 text-sm text-muted-foreground">Caricamento...</span>
                </div>
              ) : conducenti.length > 0 ? (
                conducenti.map((conducente) => (
                  <SelectItem 
                    key={conducente.id} 
                    value={conducente.id}
                    className="py-3 px-4 cursor-pointer hover:bg-muted/50 focus:bg-primary/5 rounded-lg mx-1 my-0.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {conducente.nome_cognome.split(' ').map(n => n.charAt(0)).join('').substring(0, 2)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <div className="font-medium text-sm">{conducente.nome_cognome}</div>
                        {conducente.email && (
                          <div className="text-xs text-muted-foreground">{conducente.email}</div>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-2">
                    <span className="text-xs font-semibold">?</span>
                  </div>
                  Nessun conducente esterno disponibile
                </div>
              )}
            </SelectContent>
          </Select>
          
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={handleCreateNew}
            className="h-12 px-4 border-2 hover:border-primary/50 transition-all duration-200 rounded-xl"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
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