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
    <div className="space-y-8">
      {/* Sezione 1: Informazioni Principali */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Informazioni Principali</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BasicInfoSection
            servizio={servizio}
            users={users}
            getAziendaName={getAziendaName}
            getUserName={getUserName}
          />
          <RouteSection servizio={servizio} passeggeri={passeggeri} />
        </div>
      </div>

      {/* Sezione 2: Assegnazione e Veicolo */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Assegnazione</h2>
        <AssignmentInfoSection
          servizio={servizio}
          users={users}
          getUserName={getUserName}
        />
      </div>

      {/* Sezione 3: Dettagli Economici e Operativi */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Dettagli Economici e Operativi</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FinancialSection
            servizio={servizio}
            users={users}
            azienda={azienda}
            getUserName={getUserName}
            formatCurrency={formatCurrency}
          />
          <OperationalSection
            servizio={servizio}
            passeggeriCount={passeggeri.length}
          />
        </div>
      </div>

      {/* Sezione 4: Passeggeri */}
      {passeggeri.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            Passeggeri ({passeggeri.length})
          </h2>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {passeggeri.map((passeggero, index) => (
                  <div
                    key={passeggero.id || index}
                    className="p-4 bg-muted/30 rounded-lg border border-border"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-4 w-4 text-primary" />
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
                        {passeggero.orario_presa_personalizzato && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Presa: {passeggero.orario_presa_personalizzato}
                          </div>
                        )}
                        {passeggero.usa_indirizzo_personalizzato && (
                          <>
                            {passeggero.luogo_presa_personalizzato && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Da: {passeggero.luogo_presa_personalizzato}
                              </div>
                            )}
                            {passeggero.destinazione_personalizzato && (
                              <div className="text-xs text-muted-foreground mt-1">
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
        </div>
      )}

      {/* Sezione 5: Note e Firma */}
      {(servizio.note || firmaDigitaleAttiva) && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Note e Firma</h2>
          <NotesSignatureSection
            servizio={servizio}
            firmaDigitaleAttiva={firmaDigitaleAttiva}
          />
        </div>
      )}
    </div>
  );
}
