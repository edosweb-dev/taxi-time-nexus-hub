import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ConfermaCompletamentoProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onAnnulla: () => void;
  onCompleta: () => void;
  isLoading: boolean;
  error?: string;
}

export function ConfermaCompletamento({
  checked,
  onCheckedChange,
  onAnnulla,
  onCompleta,
  isLoading,
  error
}: ConfermaCompletamentoProps) {
  return (
    <Card className="p-4">
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">CONFERMA COMPLETAMENTO</h3>

        <div className="flex items-start gap-3">
          <Checkbox
            id="conferma"
            checked={checked}
            onCheckedChange={onCheckedChange}
            disabled={isLoading}
          />
          <Label
            htmlFor="conferma"
            className="text-sm leading-tight cursor-pointer"
          >
            Confermo che i dati sono corretti e il servizio è stato completato regolarmente
          </Label>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onAnnulla}
            disabled={isLoading}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button
            onClick={onCompleta}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Completamento...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Completa Servizio
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
