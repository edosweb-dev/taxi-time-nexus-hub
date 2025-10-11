import React from "react";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User, Clock } from "lucide-react";

interface ServizioMainContentProps {
  servizio: Servizio;
  passeggeri: PasseggeroConDettagli[];
  formatCurrency: (value?: number | null) => string;
  firmaDigitaleAttiva: boolean;
}

export function ServizioMainContent({
  servizio,
  passeggeri,
  formatCurrency,
  firmaDigitaleAttiva,
}: ServizioMainContentProps) {
  const formatTime = (time?: string) => {
    if (!time) return "—";
    return time.substring(0, 5);
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Percorso */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Percorso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Partenza */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-full bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-0.5">Partenza</div>
              {servizio.citta_presa && (
                <div className="font-semibold text-sm">{servizio.citta_presa}</div>
              )}
              <div className="font-medium text-sm">{servizio.indirizzo_presa}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(servizio.orario_servizio)}
              </div>
            </div>
          </div>

          {/* Fermata intermedia - se presente */}
          {passeggeri.some(p => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato) && (
            <div className="pl-6 border-l-2 border-muted space-y-2">
              {passeggeri
                .filter(p => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato)
                .map((p, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="mt-1 p-1.5 rounded-full bg-muted">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-0.5">Fermata - {p.nome_cognome}</div>
                      <div className="font-medium text-sm">{p.luogo_presa_personalizzato}</div>
                      {p.orario_presa_personalizzato && (
                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTime(p.orario_presa_personalizzato)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Arrivo */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-1.5 rounded-full bg-primary/10">
              <MapPin className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-0.5">Arrivo</div>
              {servizio.citta_destinazione && (
                <div className="font-semibold text-sm">{servizio.citta_destinazione}</div>
              )}
              <div className="font-medium text-sm">{servizio.indirizzo_destinazione}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passeggeri */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Passeggeri ({passeggeri.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {passeggeri.length > 0 ? (
            <div className="space-y-2">
              {passeggeri.map((passeggero, index) => (
                <div
                  key={passeggero.id || index}
                  className="p-3 bg-muted/30 rounded-lg border flex items-start gap-2"
                >
                  <div className="p-1.5 bg-primary/10 rounded-full mt-0.5">
                    <User className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm mb-1">
                      {passeggero.nome_cognome}
                    </div>
                    {passeggero.email && (
                      <div className="text-xs text-muted-foreground truncate">
                        {passeggero.email}
                      </div>
                    )}
                    {passeggero.telefono && (
                      <div className="text-xs text-muted-foreground">
                        {passeggero.telefono}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Nessun passeggero
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dettagli Economici */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dettagli Economici</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Metodo Pagamento</div>
              <div className="font-medium">{servizio.metodo_pagamento || "—"}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Incasso Previsto</div>
              <div className="font-medium">{formatCurrency(servizio.incasso_previsto)}</div>
            </div>
            <div className="col-span-2">
              <div className="text-xs text-muted-foreground mb-1">Incasso Ricevuto</div>
              <div className="font-medium text-lg">{formatCurrency(servizio.incasso_ricevuto)}</div>
            </div>
            {(servizio.ore_effettive != null || servizio.ore_fatturate != null) && (
              <>
                {servizio.ore_effettive != null && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Ore Effettive</div>
                    <div className="font-medium">{servizio.ore_effettive}h</div>
                  </div>
                )}
                {servizio.ore_fatturate != null && (
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Ore Fatturate</div>
                    <div className="font-medium">{servizio.ore_fatturate}h</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Note */}
          {servizio.note && (
            <div className="mt-4 pt-4 border-t">
              <div className="text-xs text-muted-foreground mb-1">Note</div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {servizio.note}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Firma Cliente */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Firma Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          {firmaDigitaleAttiva && servizio.firma_url ? (
            <div className="border rounded-lg p-4 bg-muted/30">
              <img 
                src={servizio.firma_url} 
                alt="Firma cliente" 
                className="max-h-32 mx-auto"
              />
              {servizio.firma_timestamp && (
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Firmato il {new Date(servizio.firma_timestamp).toLocaleString("it-IT")}
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-8">
              {firmaDigitaleAttiva ? "Firma non ancora ricevuta" : "Firma non richiesta"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
