import React, { useState } from 'react';
import { TariffaKmFissa } from '@/lib/types/stipendi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Pencil } from 'lucide-react';
import { useUpdateTariffa } from '@/hooks/useConfigurazioneStipendi';

interface TariffeFisseTableProps {
  tariffe: TariffaKmFissa[];
  isLoading?: boolean;
}

export function TariffeFisseTable({ tariffe, isLoading }: TariffeFisseTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  
  const updateMutation = useUpdateTariffa();

  const handleEdit = (tariffa: TariffaKmFissa) => {
    setEditingId(tariffa.id);
    setEditValue(tariffa.importo_base.toString());
  };

  const handleSave = async (id: string) => {
    const importo = parseFloat(editValue);
    if (isNaN(importo) || importo <= 0) return;

    await updateMutation.mutateAsync({ id, importo });
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Caricamento tariffe...</div>;
  }

  if (!tariffe.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nessuna tariffa configurata per quest'anno
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-auto max-h-96">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">KM</TableHead>
            <TableHead>Importo Base (€)</TableHead>
            <TableHead className="w-24 text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tariffe.map((tariffa) => (
            <TableRow key={tariffa.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{tariffa.km}</TableCell>
              <TableCell>
                {editingId === tariffa.id ? (
                  <Input
                    type="number"
                    step="0.01"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-32"
                    autoFocus
                  />
                ) : (
                  <span>€{tariffa.importo_base.toFixed(2)}</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                {editingId === tariffa.id ? (
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSave(tariffa.id)}
                      disabled={updateMutation.isPending}
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancel}
                      disabled={updateMutation.isPending}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(tariffa)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
