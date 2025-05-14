
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { SpesaPersonale } from "@/lib/types/spese";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SpesaDetailDialogProps {
  spesa: SpesaPersonale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SpesaDetailDialog({ spesa, open, onOpenChange }: SpesaDetailDialogProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dettaglio Spesa</DialogTitle>
          <DialogDescription>
            Spesa registrata il {format(new Date(spesa.created_at), 'dd/MM/yyyy')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">{format(new Date(spesa.data), 'dd/MM/yyyy')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Importo</p>
              <p className="font-medium text-right">{formatAmount(spesa.importo)}</p>
            </div>
          </div>

          {spesa.user && (
            <div>
              <p className="text-sm text-muted-foreground">Dipendente</p>
              <p className="font-medium">{spesa.user.first_name} {spesa.user.last_name}</p>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Causale</p>
            <p className="font-medium">{spesa.causale}</p>
          </div>

          {spesa.note && (
            <div>
              <p className="text-sm text-muted-foreground">Note</p>
              <Card className="mt-1">
                <CardContent className="p-3 pt-3">
                  <p className="text-sm whitespace-pre-wrap">{spesa.note}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Stato</p>
            {spesa.convertita_aziendale ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mt-1">
                Convertita in spesa aziendale
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-1">
                Spesa personale
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
