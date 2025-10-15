import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Building,
  Phone,
  Mail,
  UserCircle,
  DollarSign,
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ROW 1 COL 1: Informazioni Servizio */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Servizio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data | Ora */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Data</p>
                    <p className="font-medium text-sm">
                      {new Date(servizio.data_servizio).toLocaleDateString("it-IT")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ora</p>
                    <p className="font-medium text-sm">{servizio.orario_servizio}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Partenza | Destinazione */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Partenza</p>
                    <p className="font-medium text-sm break-words">
                      {servizio.indirizzo_presa}
                      {servizio.citta_presa && `, ${servizio.citta_presa}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-red-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground mb-1">Destinazione</p>
                    <p className="font-medium text-sm break-words">
                      {servizio.indirizzo_destinazione}
                      {servizio.citta_destinazione && `, ${servizio.citta_destinazione}`}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Modalità di Pagamento | Importo */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pagamento</p>
                    <p className="font-medium text-sm capitalize">{servizio.metodo_pagamento}</p>
                  </div>
                </div>
                {servizio.incasso_previsto && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Importo</p>
                      <p className="font-medium text-sm">
                        € {Number(servizio.incasso_previsto).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Numero Commessa se presente */}
              {servizio.numero_commessa && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Numero Commessa</p>
                      <p className="font-medium text-sm font-mono">{servizio.numero_commessa}</p>
                    </div>
                  </div>
                </>
              )}

            </CardContent>
          </Card>

          {/* ROW 1 COL 2: Passeggeri */}
          <Card>
            <CardHeader>
              <CardTitle>
                Passeggeri ({servizio.servizi_passeggeri?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {servizio.servizi_passeggeri && servizio.servizi_passeggeri.length > 0 ? (
                <div className="space-y-3">
                  {servizio.servizi_passeggeri.map((sp: any) => (
                    <div
                      key={sp.id}
                      className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="font-medium text-sm">{sp.passeggeri?.nome_cognome}</p>
                          {sp.passeggeri?.email && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{sp.passeggeri.email}</span>
                            </div>
                          )}
                          {sp.passeggeri?.telefono && (
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{sp.passeggeri.telefono}</span>
                            </div>
                          )}
                          {(sp.passeggeri?.localita || sp.passeggeri?.indirizzo) && (
                            <div className="flex items-start gap-1.5 text-xs text-muted-foreground pt-1 border-t mt-2">
                              <MapPin className="h-3 w-3 mt-0.5" />
                              <div>
                                {sp.passeggeri.localita && (
                                  <p className="font-medium">{sp.passeggeri.localita}</p>
                                )}
                                {sp.passeggeri.indirizzo && <p>{sp.passeggeri.indirizzo}</p>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nessun passeggero associato a questo servizio</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ROW 2 COL 1: Conducente Assegnato */}
          <Card>
            <CardHeader>
              <CardTitle>Conducente Assegnato</CardTitle>
            </CardHeader>
            <CardContent>
              {servizio.conducente ? (
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <UserCircle className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">
                      {servizio.conducente.first_name} {servizio.conducente.last_name}
                    </p>
                    {servizio.conducente.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{servizio.conducente.email}</span>
                      </div>
                    )}
                    {servizio.conducente.telefono && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{servizio.conducente.telefono}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Nessun conducente assegnato</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ROW 2 COL 2: Documenti */}
          <Card>
            <CardHeader>
              <CardTitle>Documenti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Nessun documento disponibile</p>
              </div>
            </CardContent>
          </Card>

          {/* ROW 3: Note (full width) */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Note</CardTitle>
            </CardHeader>
            <CardContent>
              {servizio.note ? (
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <p className="text-sm whitespace-pre-wrap break-words">{servizio.note}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-20" />
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
