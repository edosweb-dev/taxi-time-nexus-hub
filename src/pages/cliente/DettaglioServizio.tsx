import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  CreditCard,
  FileText,
  MessageSquare,
  UserCircle,
  DollarSign,
  Navigation,
  Flag,
  Phone,
  Mail,
} from "lucide-react";
import { useServizioDetaglioCliente } from "@/hooks/useServizioDetaglioCliente";

const DettaglioServizio = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { servizio, isLoading } = useServizioDetaglioCliente(id || "");

  const getStatoBadgeVariant = (stato: string) => {
    switch (stato) {
      case "completato":
      case "consuntivato":
        return "default";
      case "assegnato":
        return "secondary";
      case "da_assegnare":
      case "bozza":
        return "outline";
      case "annullato":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatoLabel = (stato: string): string => {
    return stato
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 space-y-6">
          <Skeleton className="h-12 w-[300px]" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!servizio) {
    return null; // Hook gestisce redirect
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard-cliente/servizi")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                Servizio #{servizio.id_progressivo || servizio.id.slice(0, 8)}
              </h1>
              <p className="text-muted-foreground">
                Dettagli del servizio richiesto
              </p>
            </div>
          </div>

          <Badge variant={getStatoBadgeVariant(servizio.stato)} className="text-base px-4 py-2">
            {getStatoLabel(servizio.stato)}
          </Badge>
        </div>

        {/* Layout a Blocchi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* ROW 1 COL 1: Informazioni Servizio */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Informazioni Servizio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Data | Ora */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium text-sm truncate">
                      {new Date(servizio.data_servizio).toLocaleDateString("it-IT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Ora</p>
                    <p className="font-medium text-sm truncate">{servizio.orario_servizio}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Percorso con tappe */}
              {(() => {
                const passeggeriList = servizio.servizi_passeggeri || [];
                const passeggeriOrdinati = [...passeggeriList].sort(
                  (a: any, b: any) => (a.ordine_presa ?? 0) - (b.ordine_presa ?? 0)
                );
                const primoPasseggero = passeggeriOrdinati[0];
                const fermateIntermedie = passeggeriOrdinati.slice(1);

                // Build destination stops grouped by unique address
                const destinazioniMap = new Map<string, { indirizzo: string; citta?: string; passeggeri: string[] }>();
                passeggeriOrdinati.forEach((sp: any) => {
                  const p = sp.passeggeri;
                  const haDestPers = sp.usa_destinazione_personalizzata && sp.destinazione_personalizzato;
                  const indirizzo = haDestPers ? sp.destinazione_personalizzato : (p?.indirizzo || servizio.indirizzo_destinazione);
                  const citta = haDestPers
                    ? (sp.localita_destinazione_personalizzato || p?.localita || servizio.citta_destinazione)
                    : (p?.localita || servizio.citta_destinazione);
                  const key = `${indirizzo}|${citta || ''}`.toLowerCase().trim();
                  if (!destinazioniMap.has(key)) {
                    destinazioniMap.set(key, { indirizzo: indirizzo || '', citta: citta || undefined, passeggeri: [] });
                  }
                  destinazioniMap.get(key)!.passeggeri.push(p?.nome_cognome || 'Passeggero');
                });
                const destinazioni = passeggeriOrdinati.length > 0
                  ? Array.from(destinazioniMap.values())
                  : [{ indirizzo: servizio.indirizzo_destinazione, citta: servizio.citta_destinazione, passeggeri: [] as string[] }];

                return (
                  <div className="space-y-3">
                    {/* Partenza */}
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Partenza
                          {primoPasseggero?.passeggeri?.nome_cognome && passeggeriOrdinati.length === 1 && (
                            <span> - {primoPasseggero.passeggeri.nome_cognome}</span>
                          )}
                        </p>
                        <p className="font-medium text-sm break-words leading-tight">
                          {servizio.indirizzo_presa}
                          {servizio.citta_presa && <span className="text-muted-foreground">, {servizio.citta_presa}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Fermate presa intermedie */}
                    {fermateIntermedie
                      .filter((sp: any) => sp.usa_indirizzo_personalizzato && sp.luogo_presa_personalizzato)
                      .map((sp: any, idx: number) => {
                        const p = sp.passeggeri;
                        const citta = sp.localita_presa_personalizzato || p?.localita || servizio.citta_presa;
                        return (
                          <div key={`stop-${idx}`} className="flex items-start gap-2 pl-2 border-l-2 border-muted ml-2">
                            <MapPin className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-muted-foreground mb-0.5">
                                Fermata - {p?.nome_cognome || 'Passeggero'}
                              </p>
                              <p className="font-medium text-sm break-words leading-tight">
                                {sp.luogo_presa_personalizzato}
                                {citta && <span className="text-muted-foreground">, {citta}</span>}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                    {/* Destinazioni */}
                    {destinazioni.map((dest, index) => {
                      const isLast = index === destinazioni.length - 1;
                      return (
                        <div key={`dest-${index}`} className="flex items-start gap-2">
                          {isLast ? (
                            <Flag className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                          ) : (
                            <Navigation className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              {isLast ? 'Arrivo' : `Tappa ${index + 1}`}
                              {dest.passeggeri.length > 0 && (
                                <span> - {dest.passeggeri.join(', ')}</span>
                              )}
                            </p>
                            <p className="font-medium text-sm break-words leading-tight">
                              {dest.indirizzo}
                              {dest.citta && <span className="text-muted-foreground">, {dest.citta}</span>}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              <Separator className="my-2" />

              {/* Modalità di Pagamento | Importo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">Pagamento</p>
                    <p className="font-medium text-sm capitalize truncate">{servizio.metodo_pagamento}</p>
                  </div>
                </div>
                {(servizio.incasso_previsto || servizio.incasso_ricevuto) && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Importo</p>
                      <p className="font-medium text-sm truncate">
                        € {Number(servizio.incasso_ricevuto || servizio.incasso_previsto).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Numero Commessa se presente */}
              {servizio.numero_commessa && (
                <>
                  <Separator className="my-2" />
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Numero Commessa</p>
                      <p className="font-medium text-sm font-mono truncate">{servizio.numero_commessa}</p>
                    </div>
                  </div>
                </>
              )}

              {/* Conducente Assegnato */}
              <Separator className="my-2" />
              {servizio.conducente ? (
                <div className="flex items-start gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Conducente</p>
                    <p className="font-medium text-sm">
                      {servizio.conducente.first_name} {servizio.conducente.last_name}
                    </p>
                    {servizio.conducente.telefono && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {servizio.conducente.telefono}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <UserCircle className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground mb-0.5">Conducente</p>
                    <p className="text-sm text-muted-foreground italic">Non assegnato</p>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>

          {/* ROW 1 COL 2: Passeggeri */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Passeggeri {servizio.servizi_passeggeri?.length ? `(${servizio.servizi_passeggeri.length})` : ""}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {servizio.servizi_passeggeri && servizio.servizi_passeggeri.length > 0 ? (
                <div className="space-y-2">
                  {servizio.servizi_passeggeri.map((sp: any, index: number) => {
                    const passeggero = sp.passeggeri;
                    
                    return (
                      <div
                        key={sp.id}
                        className="p-3 border rounded-lg hover:bg-accent/30 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1.5 min-w-0">
                            <p className="font-semibold text-sm">
                              {passeggero?.nome_cognome || "Nome non disponibile"}
                            </p>
                            {passeggero?.email && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                <span className="truncate">{passeggero.email}</span>
                              </div>
                            )}
                            {passeggero?.telefono && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span>{passeggero.telefono}</span>
                              </div>
                            )}
                            {(passeggero?.localita || passeggero?.indirizzo) && (
                              <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1.5 mt-1.5 border-t">
                                <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                <div className="min-w-0">
                                  {passeggero.indirizzo && (
                                    <p className="break-words">{passeggero.indirizzo}</p>
                                  )}
                                  {passeggero.localita && (
                                    <p className="font-medium">{passeggero.localita}</p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <User className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nessun passeggero associato</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ROW 2: Documenti (full width) */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Documenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6 text-muted-foreground">
                <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Nessun documento disponibile</p>
              </div>
            </CardContent>
          </Card>

          {/* ROW 3: Note (full width) */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Note</CardTitle>
            </CardHeader>
            <CardContent>
              {servizio.note ? (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{servizio.note}</p>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Nessuna nota disponibile</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default DettaglioServizio;
