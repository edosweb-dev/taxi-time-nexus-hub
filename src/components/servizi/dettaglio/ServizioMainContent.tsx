import React from "react";
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, User, Clock, Car, Flag, Navigation, Mail, Building2, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { FinancialSection } from "./sections/FinancialSection";
import { useUsers } from "@/hooks/useUsers";
import { useAziende } from "@/hooks/useAziende";
import { NoteCard } from "@/components/dipendente/servizi/dettaglio/NoteCard";
import { EmailLogsTab } from "./EmailLogsTab";
import { hasRealCustomAddress } from "@/lib/utils/percorsoUtils";

// Helper: build grouped destination stops
function getDestinazioniRaggruppate(
  passeggeriOrdinati: PasseggeroConDettagli[],
  servizio: Servizio
) {
  const destinazioniMap = new Map<string, { indirizzo: string; citta?: string; passeggeri: string[] }>();

  passeggeriOrdinati.forEach((p) => {
    // ⚠️ Non ci fidiamo solo del flag (può essere incoerente sui dati legacy):
    // se il testo della destinazione personalizzata esiste, lo usiamo comunque.
    const haDestPersonalizzata = !!p.destinazione_personalizzato;
    const indirizzo = haDestPersonalizzata
      ? p.destinazione_personalizzato!
      : servizio.indirizzo_destinazione;
    const citta = haDestPersonalizzata
      ? (p.localita_destinazione_personalizzato || (p as any).localita_inline || p.localita || servizio.citta_destinazione)
      : servizio.citta_destinazione;
    const key = `${indirizzo}|${citta || ''}`.toLowerCase().trim();

    if (!destinazioniMap.has(key)) {
      destinazioniMap.set(key, { indirizzo: indirizzo || '', citta: citta || undefined, passeggeri: [] });
    }
    destinazioniMap.get(key)!.passeggeri.push(p.nome_cognome || 'Passeggero');
  });

  return Array.from(destinazioniMap.values());
}

interface ServizioMainContentProps {
  servizio: Servizio;
  passeggeri: PasseggeroConDettagli[];
  formatCurrency: (value?: number | null) => string;
  firmaDigitaleAttiva: boolean;
  aziendaNome?: string;
  referenteNome?: string;
  autistaNome?: string;
  veicoloModello?: string;
}

export function ServizioMainContent({
  servizio,
  passeggeri,
  formatCurrency,
  firmaDigitaleAttiva,
  aziendaNome,
  referenteNome,
  autistaNome,
  veicoloModello,
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

  // Ordina passeggeri e prendi il primo
  const passeggeriOrdinati = [...passeggeri].sort((a, b) => 
    ((a as any).ordine_presa || 0) - ((b as any).ordine_presa || 0)
  );
  const primoPasseggero = passeggeriOrdinati[0];

  const partenza = (() => {
    if (
      primoPasseggero?.usa_indirizzo_personalizzato &&
      primoPasseggero?.luogo_presa_personalizzato
    ) {
      return {
        via: primoPasseggero.luogo_presa_personalizzato,
        citta: primoPasseggero.localita_presa_personalizzato || primoPasseggero.localita || servizio.citta_presa,
      };
    }
    return {
      via: servizio.indirizzo_presa,
      citta: servizio.citta_presa,
    };
  })();

  // Destinazioni raggruppate
  const destinazioni = passeggeriOrdinati.length > 0
    ? getDestinazioniRaggruppate(passeggeriOrdinati, servizio)
    : [{ indirizzo: servizio.indirizzo_destinazione, citta: servizio.citta_destinazione || undefined, passeggeri: [] as string[] }];

  const clienteLabel = servizio.tipo_cliente === 'privato'
    ? `${servizio.cliente_privato_nome || ''} ${servizio.cliente_privato_cognome || ''}`.trim() || '—'
    : aziendaNome || '—';

  return (
    <div className="grid grid-cols-2 gap-4 items-start">
      {/* COLONNA SINISTRA */}
      <div className="flex flex-col gap-4">
        {/* Info Servizio */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  {servizio.tipo_cliente === 'privato' ? 'Cliente privato' : 'Azienda'}
                </div>
                <div className="text-sm font-medium">{clienteLabel}</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" />
                  Assegnato a
                </div>
                <div className="text-sm font-medium">
                  {servizio.conducente_esterno
                    ? servizio.conducente_esterno_nome || 'Conducente esterno'
                    : autistaNome || '—'}
                </div>
              </div>
              {referenteNome && (
                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Referente
                  </div>
                  <div className="text-sm font-medium">{referenteNome}</div>
                </div>
              )}
              <div className="space-y-0.5">
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Car className="h-3.5 w-3.5" />
                  Veicolo
                </div>
                <div className="text-sm font-medium">{veicoloModello || '—'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Percorso */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Percorso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Partenza */}
            <div className="flex items-start gap-3">
              <div className="mt-1 p-1.5 rounded-full bg-primary/10">
                <Navigation className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-muted-foreground mb-0.5">
                  <span>Partenza</span>
                  {passeggeriOrdinati.filter(p => !hasRealCustomAddress(p, servizio)).length > 0 && (
                    <span className="text-muted-foreground font-normal">
                      {" - "}{passeggeriOrdinati.filter(p => !hasRealCustomAddress(p, servizio)).map(p => p.nome_cognome || `${p.nome || ''} ${p.cognome || ''}`.trim()).join(', ')}
                    </span>
                  )}
                </div>
                {partenza.citta && (
                  <div className="font-semibold text-sm">{partenza.citta}</div>
                )}
                <div className="font-medium text-sm">{partenza.via}</div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(servizio.orario_servizio)}
                </div>
              </div>
            </div>

            {/* Fermate intermedie - solo indirizzi diversi */}
            {passeggeriOrdinati.filter(p => hasRealCustomAddress(p, servizio)).length > 0 && (
              <div className="pl-6 border-l-2 border-muted space-y-2">
                {passeggeriOrdinati.filter(p => hasRealCustomAddress(p, servizio)).map((p, idx) => {
                  const indirizzo = p.luogo_presa_personalizzato;
                  const cittaFermata = p.localita_presa_personalizzato || (p as any).localita_inline || p.localita || servizio.citta_presa;

                  return (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 p-1.5 rounded-full bg-muted">
                        <UserPlus className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-0.5">
                          Fermata - {p.nome_cognome}
                        </div>
                        <div className="text-sm">
                          {cittaFermata && (
                            <span className="font-semibold text-foreground">{cittaFermata}</span>
                          )}
                          {cittaFermata && indirizzo && " • "}
                          <span className="text-muted-foreground">{indirizzo}</span>
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

            {/* Destinazioni */}
            {destinazioni.map((dest, index) => {
              const isLast = index === destinazioni.length - 1;
              return (
                <div key={`dest-${index}`} className="flex items-start gap-3">
                  <div className={`mt-1 p-1.5 rounded-full ${isLast ? 'bg-green-100 dark:bg-green-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                    {isLast ? (
                      <Flag className={`h-4 w-4 ${isLast && destinazioni.length === 1 ? 'text-primary' : 'text-green-600 dark:text-green-400'}`} />
                    ) : (
                      <Navigation className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground mb-0.5">
                      {isLast ? 'Arrivo' : `Tappa ${index + 1}`}
                      {dest.passeggeri.length > 0 && (
                        <span className="text-muted-foreground font-normal">
                          {" - "}{dest.passeggeri.join(', ')}
                        </span>
                      )}
                    </div>
                    {dest.citta && (
                      <div className="font-semibold text-sm">{dest.citta}</div>
                    )}
                    <div className="font-medium text-sm">{dest.indirizzo}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Informazioni Finanziarie */}
        <FinancialSection
          servizio={servizio}
          users={users || []}
          azienda={azienda}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
          isAdmin={profile?.role === 'admin'}
        />
      </div>

      {/* COLONNA DESTRA */}
      <div className="flex flex-col gap-4">
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

        {/* Note */}
        {servizio.note ? (
          <NoteCard note={servizio.note} />
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Note</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-4">
                Nessuna nota
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dati Operativi - per completati/consuntivati */}
        {(servizio.stato === 'completato' || servizio.stato === 'consuntivato') && (() => {
          const ruoloAssegnato = (servizio as any)?.assegnato?.role;
          const isDipendenteAssegnato = ruoloAssegnato === 'dipendente';
          const hasDatiOperativi = 
            Number(servizio.km_totali || 0) > 0 ||
            Number(servizio.ore_sosta || 0) > 0 ||
            Number((servizio as any).ore_effettive || 0) > 0;

          if (!hasDatiOperativi) return null;

          return (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Dati Operativi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isDipendenteAssegnato ? (
                  <>
                    {Number((servizio as any).ore_effettive || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Ore lavorate</span>
                        </div>
                        <span className="font-medium">{(servizio as any).ore_effettive}h</span>
                      </div>
                    )}
                    {Number(servizio.ore_sosta || 0) > 0 && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Ore fatturate al cliente</span>
                        </div>
                        <span className="font-medium">{servizio.ore_sosta}h</span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
          );
        })()}

        {/* Firma Cliente */}
        {firmaDigitaleAttiva && (() => {
          const passeggeriConFirma = passeggeri.filter(p => p.firma_url);
          const totalPasseggeri = passeggeri.length;

          return (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Firma Cliente</span>
                  {passeggeriConFirma.length > 0 && (
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      passeggeriConFirma.length === totalPasseggeri
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    }`}>
                      {passeggeriConFirma.length === totalPasseggeri
                        ? 'Tutti firmati'
                        : `${passeggeriConFirma.length} su ${totalPasseggeri} firmati`}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {passeggeriConFirma.length > 0 ? (
                  <div className="space-y-3">
                    {passeggeriConFirma.map((p) => (
                      <div key={p.id} className="border rounded-lg p-3 bg-muted/30">
                        <div className="text-xs font-medium mb-2 truncate">{p.nome_cognome}</div>
                        <img
                          src={p.firma_url!}
                          alt={`Firma ${p.nome_cognome}`}
                          className="max-h-24 mx-auto"
                        />
                        {p.firma_timestamp && (
                          <div className="text-[10px] text-muted-foreground text-center mt-2">
                            {new Date(p.firma_timestamp).toLocaleString("it-IT")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : servizio.firma_url ? (
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
          );
        })()}

        {/* Email Inviate */}
        {isAdminOrSocio && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Inviate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <EmailLogsTab servizioId={servizio.id} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
