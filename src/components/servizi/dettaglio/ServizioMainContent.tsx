import React from "react";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { Profile, Azienda } from "@/lib/types";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { RouteSection } from "./sections/RouteSection";
import { AssignmentInfoSection } from "./sections/AssignmentInfoSection";
import { FinancialSection } from "./sections/FinancialSection";
import { OperationalSection } from "./sections/OperationalSection";
import { NotesSignatureSection } from "./sections/NotesSignatureSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

interface ServizioMainContentProps {
  servizio: Servizio;
  passeggeri: PasseggeroConDettagli[];
  users: Profile[];
  getAziendaName: (id?: string) => string;
  getAzienda?: (id?: string) => Azienda | undefined;
  getUserName: (users: Profile[], id?: string) => string | null;
  formatCurrency: (value?: number | null) => string;
  firmaDigitaleAttiva: boolean;
}

export function ServizioMainContent({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getAzienda,
  getUserName,
  formatCurrency,
  firmaDigitaleAttiva,
}: ServizioMainContentProps) {
  const azienda = getAzienda?.(servizio.azienda_id);

  return (
    <div className="grid grid-cols-2 gap-4 auto-rows-min">
      {/* Col 1: Info Base */}
      <BasicInfoSection
        servizio={servizio}
        users={users}
        getAziendaName={getAziendaName}
        getUserName={getUserName}
      />

      {/* Col 2: Percorso */}
      <RouteSection servizio={servizio} passeggeri={passeggeri} />

      {/* Col 1: Assegnazione */}
      <AssignmentInfoSection
        servizio={servizio}
        users={users}
        getUserName={getUserName}
      />

      {/* Col 2: Economico + Operativo */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dettagli Economici e Operativi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sezione Economica */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">ECONOMICO</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Metodo Pagamento</div>
                <div className="font-medium">{servizio.metodo_pagamento || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Incasso Ricevuto</div>
                <div className="font-medium">{formatCurrency(servizio.incasso_ricevuto)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Incasso Previsto</div>
                <div className="font-medium">{formatCurrency(servizio.incasso_previsto)}</div>
              </div>
              {servizio.consegna_contanti_a && (
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Contanti a</div>
                  <div className="font-medium text-xs">{getUserName(users, servizio.consegna_contanti_a)}</div>
                </div>
              )}
              {azienda?.provvigione && (
                <div className="col-span-2">
                  <div className="text-xs text-muted-foreground mb-0.5">Provvigione</div>
                  <div className="font-medium">
                    {azienda.provvigione_tipo === "percentuale"
                      ? `${azienda.provvigione_valore}%`
                      : formatCurrency(azienda.provvigione_valore)}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t" />

          {/* Sezione Operativa */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-muted-foreground">OPERATIVO</div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Passeggeri</div>
                <div className="font-medium">{passeggeri.length}</div>
              </div>
              {servizio.ore_lavorate != null && (
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Ore Lavorate</div>
                  <div className="font-medium">{servizio.ore_lavorate}h</div>
                </div>
              )}
              {servizio.ore_finali != null && (
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Ore Finali</div>
                  <div className="font-medium">{servizio.ore_finali}h</div>
                </div>
              )}
              {servizio.ore_effettive != null && (
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Ore Effettive</div>
                  <div className="font-medium">{servizio.ore_effettive}h</div>
                </div>
              )}
              {servizio.ore_fatturate != null && (
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Ore Fatturate</div>
                  <div className="font-medium">{servizio.ore_fatturate}h</div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Full-width: Passeggeri */}
      {passeggeri.length > 0 && (
        <Card className="col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Passeggeri ({passeggeri.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {passeggeri.map((passeggero, index) => (
                <div
                  key={passeggero.id || index}
                  className="p-3 bg-muted/30 rounded-lg border"
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-full">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs mb-0.5">
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
                      {passeggero.orario_presa_personalizzato && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Presa: {passeggero.orario_presa_personalizzato}
                        </div>
                      )}
                      {passeggero.usa_indirizzo_personalizzato && (
                        <>
                          {passeggero.luogo_presa_personalizzato && (
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              Da: {passeggero.luogo_presa_personalizzato}
                            </div>
                          )}
                          {passeggero.destinazione_personalizzato && (
                            <div className="text-xs text-muted-foreground mt-0.5 truncate">
                              A: {passeggero.destinazione_personalizzato}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full-width: Note e Firma */}
      {(servizio.note || firmaDigitaleAttiva) && (
        <div className="col-span-2">
          <NotesSignatureSection
            servizio={servizio}
            firmaDigitaleAttiva={firmaDigitaleAttiva}
          />
        </div>
      )}
    </div>
  );
}
