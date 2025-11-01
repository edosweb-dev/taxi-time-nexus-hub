import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Profile, Azienda } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { useImpostazioniOptimized } from "@/hooks/useImpostazioniOptimized";
import { getIvaPercentageForPaymentMethod } from "@/lib/utils/ivaUtils";
import { AlertTriangle } from "lucide-react";

interface FinancialSectionProps {
  servizio: Servizio;
  users: Profile[];
  azienda?: Azienda;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function FinancialSection({
  servizio,
  users,
  azienda,
  getUserName,
  formatCurrency,
}: FinancialSectionProps) {
  // Carica impostazioni metodi pagamento con cache ottimizzata
  const { metodiPagamento, aliquoteIva, isLoading: loadingImpostazioni } = useImpostazioniOptimized();
  
  // Trova configurazione del metodo di pagamento
  const metodoPagamento = servizio.metodo_pagamento || '';
  const configMetodo = metodiPagamento.find(m => m.nome === metodoPagamento);
  
  // Calcola IVA usando configurazione da impostazioni
  const ivaPercentage = getIvaPercentageForPaymentMethod(
    metodoPagamento,
    metodiPagamento,
    aliquoteIva
  );
  
  const metodoHaIva = ivaPercentage > 0;
  
  // Log per debug
  console.log('🔍 [FinancialSection] Calcolo IVA con impostazioni:', {
    metodo_pagamento: metodoPagamento,
    configMetodo,
    metodoHaIva,
    ivaPercentage,
    incasso_previsto: servizio.incasso_previsto,
    incasso_ricevuto: servizio.incasso_ricevuto,
  });

  // Calcola importi IVA per incasso PREVISTO
  let nettoPrevistoValue = 0;
  let ivaPrevistoValue = 0;
  let totalePrevistoValue = 0;
  
  if (servizio.incasso_previsto !== null) {
    nettoPrevistoValue = Number(servizio.incasso_previsto) || 0;
    if (metodoHaIva) {
      ivaPrevistoValue = nettoPrevistoValue * (ivaPercentage / 100);
      totalePrevistoValue = nettoPrevistoValue + ivaPrevistoValue;
    } else {
      totalePrevistoValue = nettoPrevistoValue;
    }
  }
  
  // Calcola importi IVA per incasso RICEVUTO
  let nettoRicevutoValue = 0;
  let ivaRicevutoValue = 0;
  let totaleRicevutoValue = 0;
  
  if (servizio.incasso_ricevuto !== null) {
    nettoRicevutoValue = Number(servizio.incasso_ricevuto) || 0;
    if (metodoHaIva) {
      ivaRicevutoValue = nettoRicevutoValue * (ivaPercentage / 100);
      totaleRicevutoValue = nettoRicevutoValue + ivaRicevutoValue;
    } else {
      totaleRicevutoValue = nettoRicevutoValue;
    }
  }
  
  const hasFinancialData = 
    servizio.incasso_ricevuto !== null || 
    servizio.incasso_previsto !== null ||
    servizio.metodo_pagamento;

  // Loading state per impostazioni
  if (loadingImpostazioni) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informazioni finanziarie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasFinancialData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informazioni finanziarie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-4">
            Nessun dato finanziario disponibile
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Informazioni finanziarie</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Metodo di Pagamento */}
        {servizio.metodo_pagamento && (
          <div className="flex justify-between items-center pb-2">
            <span className="text-sm font-medium text-muted-foreground">Metodo di Pagamento</span>
            <Badge variant="outline" className="text-base">{servizio.metodo_pagamento}</Badge>
          </div>
        )}
        
        {/* INCASSO PREVISTO - Visualizzazione Condizionale */}
        {servizio.incasso_previsto !== null && (
          <div className="space-y-3 border-t pt-3">
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              Incasso Previsto
            </div>
            
            {metodoHaIva ? (
              /* CON IVA: Mostra scomposizione */
              <div className="space-y-2">
                {/* Incasso Netto */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Incasso netto</span>
                  <span className="font-medium">{formatCurrency(nettoPrevistoValue)}</span>
                </div>
                
                {/* IVA */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    IVA ({ivaPercentage}%)
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {formatCurrency(ivaPrevistoValue)}
                  </span>
                </div>
                
                {/* Separatore */}
                <Separator className="my-2" />
                
                {/* Totale da Incassare */}
                <div className="flex justify-between items-center bg-primary/5 p-3 rounded-md border border-primary/10">
                  <span className="text-sm font-semibold">Totale da incassare</span>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(totalePrevistoValue)}
                  </span>
                </div>
              </div>
            ) : (
              /* SENZA IVA: Mostra importo semplice */
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Incasso previsto</span>
                <span className="text-base font-semibold">
                  {formatCurrency(totalePrevistoValue)}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* INCASSO RICEVUTO - Visualizzazione Condizionale */}
        {servizio.incasso_ricevuto !== null && (
          <div className="space-y-3 border-t pt-3">
            <div className="text-sm font-semibold text-muted-foreground mb-2">
              Consuntivazione
            </div>
            
            {metodoHaIva ? (
              /* CON IVA: Mostra scomposizione */
              <div className="space-y-2">
                {/* Incasso Netto Ricevuto */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Incasso netto ricevuto</span>
                  <span className="font-medium">{formatCurrency(nettoRicevutoValue)}</span>
                </div>
                
                {/* IVA */}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    IVA ({ivaPercentage}%)
                  </span>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    {formatCurrency(ivaRicevutoValue)}
                  </span>
                </div>
                
                {/* Separatore */}
                <Separator className="my-2" />
                
                {/* Totale Ricevuto */}
                <div className="flex justify-between items-center bg-green-50 dark:bg-green-950 p-3 rounded-md border border-green-200 dark:border-green-800">
                  <span className="text-sm font-semibold">Totale ricevuto</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(totaleRicevutoValue)}
                  </span>
                </div>
              </div>
            ) : (
              /* SENZA IVA: Mostra importo semplice */
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Incasso ricevuto</span>
                <span className="text-base font-semibold text-green-600 dark:text-green-400">
                  {formatCurrency(totaleRicevutoValue)}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Responsabile Contanti */}
        {servizio.metodo_pagamento === 'Contanti' && servizio.consegna_contanti_a && (
          <div className="space-y-2 border-t pt-3">
            <div className="text-sm font-medium text-muted-foreground">Responsabile contanti</div>
            <div className="text-base">
              {getUserName(users, servizio.consegna_contanti_a) || "Operatore non trovato"}
            </div>
          </div>
        )}
        
        {/* Provvigione */}
        {azienda?.provvigione && (
          <div className="space-y-2 border-t pt-3">
            <div className="text-sm font-medium text-muted-foreground">Provvigione</div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={servizio.applica_provvigione ? "default" : "secondary"}
                className={servizio.applica_provvigione ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100" : ""}
              >
                {servizio.applica_provvigione ? "Applicata" : "Non applicata"}
              </Badge>
              {servizio.applica_provvigione && azienda.provvigione_valore && (
                <span className="text-sm text-muted-foreground">
                  ({azienda.provvigione_tipo === 'percentuale' 
                    ? `${azienda.provvigione_valore}%` 
                    : formatCurrency(Number(azienda.provvigione_valore))})
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}