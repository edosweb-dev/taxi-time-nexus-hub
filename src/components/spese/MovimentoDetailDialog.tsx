
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { MovimentoAziendale } from "@/lib/types/spese";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CircleDollarSignIcon,
} from "lucide-react";

interface MovimentoDetailDialogProps {
  movimento: MovimentoAziendale;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MovimentoDetailDialog({
  movimento,
  open,
  onOpenChange,
}: MovimentoDetailDialogProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("it-IT", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getTipoIcon = () => {
    switch (movimento.tipo) {
      case "spesa":
        return <ArrowDownIcon className="h-5 w-5 text-red-500 mr-1" />;
      case "incasso":
        return <ArrowUpIcon className="h-5 w-5 text-green-500 mr-1" />;
      case "prelievo":
        return <CircleDollarSignIcon className="h-5 w-5 text-orange-500 mr-1" />;
      default:
        return null;
    }
  };

  const getTipoText = () => {
    return movimento.tipo.charAt(0).toUpperCase() + movimento.tipo.slice(1);
  };

  const getTipoColor = () => {
    switch (movimento.tipo) {
      case "spesa":
        return "text-red-500";
      case "incasso":
        return "text-green-500";
      case "prelievo":
        return "text-orange-500";
      default:
        return "";
    }
  };

  const getStatoBadge = () => {
    if (movimento.stato === "saldato") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Saldato
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          Da saldare
        </Badge>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center">
            {getTipoIcon()}
            <DialogTitle>{getTipoText()}</DialogTitle>
          </div>
          <DialogDescription>
            Registrato il {format(new Date(movimento.created_at), "dd/MM/yyyy")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Data</p>
              <p className="font-medium">{format(new Date(movimento.data), "dd/MM/yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Importo</p>
              <p className={`font-medium text-right ${getTipoColor()}`}>
                {formatAmount(movimento.importo)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Causale</p>
            <p className="font-medium">{movimento.causale}</p>
          </div>

          {movimento.metodo_pagamento && (
            <div>
              <p className="text-sm text-muted-foreground">Metodo di Pagamento</p>
              <p className="font-medium">{movimento.metodo_pagamento.nome}</p>
            </div>
          )}

          {movimento.effettuato_da && (
            <div>
              <p className="text-sm text-muted-foreground">Effettuato da</p>
              <p className="font-medium">
                {movimento.effettuato_da.first_name} {movimento.effettuato_da.last_name}
              </p>
            </div>
          )}

          {movimento.note && (
            <div>
              <p className="text-sm text-muted-foreground">Note</p>
              <Card className="mt-1">
                <CardContent className="p-3 pt-3">
                  <p className="text-sm whitespace-pre-wrap">{movimento.note}</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <p className="text-sm text-muted-foreground">Stato</p>
            {getStatoBadge()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
