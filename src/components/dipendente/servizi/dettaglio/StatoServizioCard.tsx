import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Pen } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface StatoServizioCardProps {
  stato: string;
  onCompleta?: () => void;
  firmaUrl?: string;
  firmaTimestamp?: string;
  incassoRicevuto?: number;
  oreEffettive?: number;
  oreFatturate?: number;
  iva?: number;
}

export function StatoServizioCard({
  stato,
  onCompleta,
  firmaUrl,
  firmaTimestamp,
  incassoRicevuto,
  oreEffettive,
  oreFatturate,
  iva
}: StatoServizioCardProps) {
  if (stato === 'assegnato') {
    return (
      <Button
        className="w-full h-14"
        size="lg"
        onClick={onCompleta}
      >
        <CheckCircle2 className="h-5 w-5 mr-2" />
        Completa Servizio
      </Button>
    );
  }

  if (stato === 'completato') {
    return (
      <Card className="p-4 bg-green-50 border-green-200">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-sm">Completato</h3>
        </div>
        {firmaTimestamp && (
          <p className="text-sm text-muted-foreground mb-4">
            {format(new Date(firmaTimestamp), "dd/MM/yyyy 'alle' HH:mm", { locale: it })}
          </p>
        )}
        {firmaUrl && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Pen className="h-4 w-4" />
              <p className="text-sm font-medium">Firma Digitale</p>
            </div>
            <img 
              src={firmaUrl} 
              alt="Firma cliente" 
              className="max-w-full h-auto max-h-32 border rounded"
              loading="lazy"
            />
          </div>
        )}
      </Card>
    );
  }

  if (stato === 'consuntivato') {
    return (
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-sm mb-3">💰 CONSUNTIVAZIONE</h3>
        <div className="space-y-2 text-sm">
          {incassoRicevuto !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Incasso Ricevuto:</span>
              <span className="font-bold">€{incassoRicevuto.toFixed(2)}</span>
            </div>
          )}
          {oreEffettive !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ore Effettive:</span>
              <span className="font-medium">{oreEffettive}h</span>
            </div>
          )}
          {oreFatturate !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ore Fatturate:</span>
              <span className="font-medium">{oreFatturate}h</span>
            </div>
          )}
          {iva !== undefined && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">IVA:</span>
              <span className="font-medium">{iva}%</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return null;
}
