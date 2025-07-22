import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";

interface FinancialSectionProps {
  servizio: Servizio;
  users: Profile[];
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function FinancialSection({
  servizio,
  users,
  getUserName,
  formatCurrency,
}: FinancialSectionProps) {
  const hasFinancialData = 
    servizio.incasso_ricevuto !== null || 
    servizio.incasso_previsto !== null ||
    servizio.metodo_pagamento;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {servizio.metodo_pagamento && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Modalità di pagamento</div>
              <Badge variant="outline">{servizio.metodo_pagamento}</Badge>
            </div>
          )}
          
          {servizio.incasso_ricevuto !== null && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Incasso ricevuto</div>
              <div className="text-base font-semibold text-green-600">
                {formatCurrency(servizio.incasso_ricevuto)}
              </div>
            </div>
          )}
          
          {servizio.incasso_previsto !== null && (
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">Incasso previsto</div>
              <div className="text-base font-semibold">
                {formatCurrency(servizio.incasso_previsto)}
              </div>
            </div>
          )}
          
          {servizio.metodo_pagamento === 'Contanti' && servizio.consegna_contanti_a && (
            <div className="space-y-2 md:col-span-2">
              <div className="text-sm font-medium text-muted-foreground">Responsabile contanti</div>
              <div className="text-base">
                {getUserName(users, servizio.consegna_contanti_a) || "Operatore non trovato"}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}