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
  Users,
  FileSignature,
  MessageSquare,
  Building,
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

        {/* Tabs */}
        <Tabs defaultValue="dettagli" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dettagli">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Dettagli</span>
            </TabsTrigger>
            <TabsTrigger value="passeggeri">
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Passeggeri</span>
            </TabsTrigger>
            <TabsTrigger value="documenti">
              <FileSignature className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Documenti</span>
            </TabsTrigger>
            <TabsTrigger value="note">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Note</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Dettagli Generali */}
          <TabsContent value="dettagli" className="space-y-4 mt-6">
            {/* Info Servizio */}
            <Card>
              <CardHeader>
                <CardTitle>Informazioni Servizio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Data e Ora */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Data</p>
                      <p className="font-medium">
                        {new Date(servizio.data_servizio).toLocaleDateString("it-IT", {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {servizio.orario_servizio && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Ora</p>
                        <p className="font-medium">{servizio.orario_servizio}</p>
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Percorso */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">Partenza</p>
                      <p className="font-medium break-words">
                        {servizio.indirizzo_presa}
                        {servizio.citta_presa && `, ${servizio.citta_presa}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground mb-1">Destinazione</p>
                      <p className="font-medium break-words">
                        {servizio.indirizzo_destinazione}
                        {servizio.citta_destinazione && `, ${servizio.citta_destinazione}`}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Info Aggiuntive */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {servizio.numero_commessa && (
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Numero Commessa</p>
                        <p className="font-medium font-mono">{servizio.numero_commessa}</p>
                      </div>
                    </div>
                  )}

                  {servizio.metodo_pagamento && (
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Metodo Pagamento</p>
                        <p className="font-medium capitalize">{servizio.metodo_pagamento}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Info Conducente */}
            {servizio.conducente && (
              <Card>
                <CardHeader>
                  <CardTitle>Conducente Assegnato</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <p className="font-medium text-lg">
                        {servizio.conducente.first_name} {servizio.conducente.last_name}
                      </p>
                      {servizio.conducente.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{servizio.conducente.email}</span>
                        </div>
                      )}
                      {servizio.conducente.telefono && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          <span>{servizio.conducente.telefono}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Azienda */}
            <Card>
              <CardHeader>
                <CardTitle>Azienda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Building className="h-6 w-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="font-medium text-lg">{servizio.aziende?.nome}</p>
                    {servizio.aziende?.partita_iva && (
                      <p className="text-sm text-muted-foreground">
                        P.IVA: {servizio.aziende.partita_iva}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: Passeggeri */}
          <TabsContent value="passeggeri" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  Passeggeri del Servizio ({servizio.servizi_passeggeri?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {servizio.servizi_passeggeri && servizio.servizi_passeggeri.length > 0 ? (
                  <div className="space-y-4">
                    {servizio.servizi_passeggeri.map((sp: any) => (
                      <div
                        key={sp.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1 space-y-2">
                            <p className="font-medium">{sp.passeggeri?.nome_cognome}</p>
                            {sp.passeggeri?.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                <span>{sp.passeggeri.email}</span>
                              </div>
                            )}
                            {sp.passeggeri?.telefono && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{sp.passeggeri.telefono}</span>
                              </div>
                            )}
                            {(sp.passeggeri?.localita || sp.passeggeri?.indirizzo) && (
                              <div className="flex items-start gap-2 text-sm text-muted-foreground pt-2 border-t">
                                <MapPin className="h-3 w-3 mt-0.5" />
                                <div>
                                  {sp.passeggeri.localita && (
                                    <p className="font-medium">{sp.passeggeri.localita}</p>
                                  )}
                                  {sp.passeggeri.indirizzo && (
                                    <p>{sp.passeggeri.indirizzo}</p>
                                  )}
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
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nessun passeggero associato a questo servizio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Documenti */}
          <TabsContent value="documenti" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Documenti e Firma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileSignature className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Funzionalità documenti in arrivo</p>
                  <p className="text-sm mt-2">Report PDF, firma digitale e allegati</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: Note */}
          <TabsContent value="note" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Note del Servizio</CardTitle>
              </CardHeader>
              <CardContent>
                {servizio.note ? (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{servizio.note}</p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nessuna nota per questo servizio</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DettaglioServizio;
