import { Card } from "@/components/ui/card";
import { Car } from "lucide-react";

interface VeicoloCardProps {
  modello?: string;
  targa?: string;
  numeroPosti?: number;
}

export function VeicoloCard({ modello, targa, numeroPosti }: VeicoloCardProps) {
  if (!modello && !targa) {
    return null;
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Car className="h-4 w-4" />
        VEICOLO ASSEGNATO
      </h3>
      <div className="space-y-2 text-sm">
        {modello && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Modello:</span>
            <span className="font-medium">{modello}</span>
          </div>
        )}
        {targa && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Targa:</span>
            <span className="font-medium">{targa}</span>
          </div>
        )}
        {numeroPosti && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Posti:</span>
            <span className="font-medium">{numeroPosti}</span>
          </div>
        )}
      </div>
    </Card>
  );
}
