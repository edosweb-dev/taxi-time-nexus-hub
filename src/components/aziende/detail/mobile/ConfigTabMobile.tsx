import { CreditCard, FileCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Azienda } from '@/lib/types';

interface ConfigTabMobileProps {
  azienda: Azienda;
}

export function ConfigTabMobile({ azienda }: ConfigTabMobileProps) {
  return (
    <div className="space-y-4">
      {/* Card Firma Digitale */}
      <div className="mobile-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${
              azienda.firma_digitale_attiva 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <FileCheck className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">Firma Digitale</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {azienda.firma_digitale_attiva 
                  ? 'Richiesta per i servizi'
                  : 'Non richiesta'
                }
              </p>
            </div>
          </div>
          <Badge 
            variant={azienda.firma_digitale_attiva ? "default" : "secondary"}
            className={azienda.firma_digitale_attiva ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
          >
            {azienda.firma_digitale_attiva ? 'Attiva' : 'Disattiva'}
          </Badge>
        </div>
      </div>

      {/* Card Provvigioni */}
      <div className="mobile-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2.5 rounded-lg flex-shrink-0 ${
              azienda.provvigione 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              <CreditCard className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm">Provvigioni</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {azienda.provvigione 
                  ? 'Calcolo automatico attivo'
                  : 'Nessuna provvigione'
                }
              </p>
            </div>
          </div>
          <Badge 
            variant={azienda.provvigione ? "default" : "secondary"}
            className={azienda.provvigione ? "bg-blue-100 text-blue-700 hover:bg-blue-100" : ""}
          >
            {azienda.provvigione ? 'Attiva' : 'Disattiva'}
          </Badge>
        </div>

        {azienda.provvigione && (
          <div className="pt-3 border-t space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tipo</span>
              <span className="font-medium capitalize">
                {azienda.provvigione_tipo || 'Non specificato'}
              </span>
            </div>
            {azienda.provvigione_valore && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valore</span>
                <span className="font-medium">
                  {azienda.provvigione_tipo === 'percentuale' 
                    ? `${azienda.provvigione_valore}%`
                    : `€${azienda.provvigione_valore}`
                  }
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
