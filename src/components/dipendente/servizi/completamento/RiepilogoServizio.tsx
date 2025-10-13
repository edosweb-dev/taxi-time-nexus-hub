import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ServizioDettaglio } from '@/hooks/dipendente/useServizioDettaglio';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface RiepilogoServizioProps {
  servizio: ServizioDettaglio;
  passeggeriCount: number;
}

export function RiepilogoServizio({ servizio, passeggeriCount }: RiepilogoServizioProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const dataFormatted = format(new Date(servizio.data_servizio), "dd/MM/yyyy", { locale: it });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">📋 RIEPILOGO SERVIZIO</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Nascondi
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Mostra dettagli
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Azienda:</span>
          <span className="font-medium text-right">{servizio.azienda_nome || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data:</span>
          <span className="font-medium text-right">
            {dataFormatted} - {servizio.orario_servizio}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Percorso:</span>
          <span className="font-medium text-right">
            {servizio.citta_presa || 'N/A'} → {servizio.citta_destinazione || 'N/A'}
          </span>
        </div>

        {isExpanded && (
          <>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Presa:</span>
              <span className="font-medium text-right max-w-[200px] truncate">
                {servizio.indirizzo_presa}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Destinazione:</span>
              <span className="font-medium text-right max-w-[200px] truncate">
                {servizio.indirizzo_destinazione}
              </span>
            </div>
            {servizio.veicolo_modello && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Veicolo:</span>
                <span className="font-medium text-right">
                  {servizio.veicolo_modello}
                  {servizio.veicolo_targa && ` - ${servizio.veicolo_targa}`}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Passeggeri:</span>
              <span className="font-medium text-right">{passeggeriCount}</span>
            </div>
            {servizio.numero_commessa && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Commessa:</span>
                <span className="font-medium text-right">{servizio.numero_commessa}</span>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
