import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface DettagliGeneraliProps {
  aziendaNome?: string;
  referenteNome?: string;
  referenteCognome?: string;
  dataServizio: string;
  orarioServizio: string;
  numeroCommessa?: string;
  metodoPagamento: string;
}

export function DettagliGenerali({
  aziendaNome,
  referenteNome,
  referenteCognome,
  dataServizio,
  orarioServizio,
  numeroCommessa,
  metodoPagamento
}: DettagliGeneraliProps) {
  const dataFormatted = format(new Date(dataServizio), "EEEE d MMMM yyyy", { locale: it });
  const referente = referenteNome && referenteCognome 
    ? `${referenteNome} ${referenteCognome}`.trim()
    : '-';

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-sm mb-3">📋 DETTAGLI GENERALI</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Azienda:</span>
          <span className="font-medium text-right">{aziendaNome || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Referente:</span>
          <span className="font-medium text-right">{referente}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Data:</span>
          <span className="font-medium text-right capitalize">{dataFormatted}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Orario:</span>
          <span className="font-medium text-right">{orarioServizio}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Commessa:</span>
          <span className="font-medium text-right">{numeroCommessa || '-'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Pagamento:</span>
          <span className="font-medium text-right">{metodoPagamento}</span>
        </div>
      </div>
    </Card>
  );
}
