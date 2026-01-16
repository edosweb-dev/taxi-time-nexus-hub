import React from "react";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User, Clock, Car } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialSection } from "./sections/FinancialSection";
import { useUsers } from "@/hooks/useUsers";
import { useAziende } from "@/hooks/useAziende";
import { NoteCard } from "@/components/dipendente/servizi/dettaglio/NoteCard";

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
  const { profile } = useAuth();
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  const { users } = useUsers();
  const { aziende } = useAziende();
  const azienda = aziende?.find(a => a.id === servizio.azienda_id);
  
  const getUserName = (users: Profile[], userId?: string) => {
    if (!userId) return null;
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : null;
  };
  
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

          {/* Fermata intermedia - se presente (esclude primo passeggero già in partenza) */}
          {passeggeri
            .sort((a, b) => ((a as any).ordine_presa || 0) - ((b as any).ordine_presa || 0))
            .slice(1) // Escludi primo passeggero (già mostrato in partenza)
            .some(p => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato) && (
            <div className="pl-6 border-l-2 border-muted space-y-2">
              {passeggeri
                .sort((a, b) => ((a as any).ordine_presa || 0) - ((b as any).ordine_presa || 0))
                .slice(1) // Escludi primo passeggero
                .filter(p => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato)
                .map((p, idx) => {
                  // Fallback località: campo dedicato → località inline → località rubrica → città servizio
                  const cittaFermata = p.localita_presa_personalizzato || 
                    (p as any).localita_inline || 
                    p.localita || 
                    servizio.citta_presa;
                  
                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 rounded-full bg-muted">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-0.5">Fermata - {p.nome_cognome}</div>
                        <div className="text-sm">
                          {cittaFermata && (
                            <span className="font-semibold text-foreground">{cittaFermata}</span>
                          )}
                          {cittaFermata && p.luogo_presa_personalizzato && " • "}
                          <span className="text-muted-foreground">{p.luogo_presa_personalizzato}</span>
                        </div>
                        {p.orario_presa_personalizzato && (
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(p.orario_presa_personalizzato)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
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
              {passeggeri.map((passeggero, index) => {
                const isTemporary = (passeggero as any).tipo === 'temporaneo';
                return (
                  <div
                    key={passeggero.id || index}
                    className={`p-3 rounded-lg border flex items-start gap-2 ${
                      isTemporary ? 'bg-blue-50/50' : 'bg-muted/30'
                    }`}
                  >
                    <div className={`p-1.5 rounded-full mt-0.5 ${
                      isTemporary ? 'bg-blue-100' : 'bg-primary/10'
                    }`}>
                      <User className={`h-3.5 w-3.5 ${
                        isTemporary ? 'text-blue-700' : 'text-primary'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm">
                          {passeggero.nome_cognome}
                        </div>
                        {isTemporary ? (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-blue-100 text-blue-800 rounded">
                            Ospite
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-800 rounded">
                            Rubrica
                          </span>
                        )}
                      </div>
                      {passeggero.email && (
                        <div className="text-xs text-muted-foreground truncate">
                          📧 {passeggero.email}
                        </div>
                      )}
                      {passeggero.telefono && (
                        <div className="text-xs text-muted-foreground">
                          📱 {passeggero.telefono}
                        </div>
                      )}
                      {(passeggero.localita || passeggero.indirizzo) && (
                        <div className="text-xs text-muted-foreground mt-1">
                          📍 {passeggero.localita}{passeggero.localita && passeggero.indirizzo && ', '}{passeggero.indirizzo}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground text-center py-4">
              Nessun passeggero
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dati Operativi - KM e Ore Sosta per completati/consuntivati */}
      {(servizio.stato === 'completato' || servizio.stato === 'consuntivato') && 
        ((servizio.km_totali !== null && servizio.km_totali > 0) || 
         (servizio.ore_sosta !== null && servizio.ore_sosta > 0)) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dati Operativi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {servizio.km_totali !== null && servizio.km_totali > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">KM Totali</span>
                </div>
                <span className="font-medium">{servizio.km_totali} km</span>
              </div>
            )}
            {servizio.ore_sosta !== null && servizio.ore_sosta > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ore di Sosta</span>
                </div>
                <span className="font-medium">{servizio.ore_sosta}h</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Dettagli Economici */}
      <FinancialSection
        servizio={servizio}
        users={users || []}
        azienda={azienda}
        getUserName={getUserName}
        formatCurrency={formatCurrency}
      />

      {/* Note */}
      {servizio.note && (
        <NoteCard note={servizio.note} />
      )}

      {/* Firma Cliente - solo se firma digitale attiva */}
      {firmaDigitaleAttiva && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Firma Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            {servizio.firma_url ? (
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
                Firma non ancora ricevuta
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
