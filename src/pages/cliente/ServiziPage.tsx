import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, ArrowLeft, MapPin, Calendar, Clock, User, CreditCard } from "lucide-react";
import { useServiziCliente, StatoServizio } from "@/hooks/useServiziCliente";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardDescription } from "@/components/ui/card";

const ServiziPage = () => {
  const navigate = useNavigate();
  const [statoAttivo, setStatoAttivo] = useState<StatoServizio | null>(null);
  const { servizi, isLoading, counts } = useServiziCliente(statoAttivo);

  const tabs: Array<{ value: StatoServizio | "tutti"; label: string }> = [
    { value: "tutti", label: "Tutti" },
    { value: "da_assegnare", label: "Da Assegnare" },
    { value: "assegnato", label: "Assegnati" },
    { value: "completato", label: "Completati" },
    { value: "consuntivato", label: "Consuntivati" },
    { value: "bozza", label: "Bozze" },
    { value: "annullato", label: "Annullati" },
  ];

  const getTabCount = (value: StatoServizio | "tutti") => {
    if (value === "tutti") {
      return Object.values(counts).reduce((sum, count) => sum + count, 0);
    }
    return counts[value as StatoServizio] || 0;
  };

  const getStatoBadgeVariant = (stato: string) => {
    switch (stato) {
      case "completato":
      case "consuntivato":
        return "default";
      case "assegnato":
        return "secondary";
      case "da_assegnare":
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
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard-cliente")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">I Miei Servizi</h1>
              <p className="text-muted-foreground">
                Visualizza e gestisci i tuoi servizi taxi/NCC
              </p>
            </div>
          </div>

          <Button onClick={() => navigate("/servizi/crea")}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Servizio
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="tutti"
          onValueChange={(value) =>
            setStatoAttivo(value === "tutti" ? null : (value as StatoServizio))
          }
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                {tab.label}
                <Badge variant="secondary" className="ml-1">
                  {getTabCount(tab.value)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              {isLoading ? (
                // Loading Skeleton
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : servizi.length === 0 ? (
                // Empty State
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      Nessun servizio trovato
                    </h3>
                    <p className="text-muted-foreground text-center mb-4">
                      {statoAttivo
                        ? `Non hai servizi in stato "${tab.label}"`
                        : "Non hai ancora creato nessun servizio"}
                    </p>
                    {!statoAttivo && (
                      <Button onClick={() => navigate("/servizi/crea")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crea Primo Servizio
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* DESKTOP: Tabella */}
                  <div className="hidden md:block">
                    <Card>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data/Ora</TableHead>
                            <TableHead>Commessa</TableHead>
                            <TableHead>Percorso</TableHead>
                            <TableHead>Stato</TableHead>
                            <TableHead>Conducente</TableHead>
                            <TableHead className="text-right">Pagamento</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {servizi.map((servizio) => (
                            <TableRow
                              key={servizio.id}
                              className="cursor-pointer hover:bg-accent/50"
                              onClick={() => navigate(`/servizi/${servizio.id}`)}
                            >
                              {/* Data/Ora */}
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {new Date(servizio.data_servizio).toLocaleDateString("it-IT", {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    })}
                                  </span>
                                  {servizio.orario_servizio && (
                                    <span className="text-sm text-muted-foreground">
                                      {servizio.orario_servizio}
                                    </span>
                                  )}
                                </div>
                              </TableCell>

                              {/* Commessa */}
                              <TableCell>
                                {servizio.numero_commessa ? (
                                  <Badge variant="outline" className="font-mono">
                                    {servizio.numero_commessa}
                                  </Badge>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>

                              {/* Percorso */}
                              <TableCell className="max-w-[300px]">
                                <div className="flex flex-col gap-1 text-sm">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span className="truncate">{servizio.indirizzo_presa}</span>
                                  </div>
                                  <div className="flex items-start gap-2">
                                    <MapPin className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                                    <span className="truncate">{servizio.indirizzo_destinazione}</span>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Stato */}
                              <TableCell>
                                <Badge variant={getStatoBadgeVariant(servizio.stato)}>
                                  {getStatoLabel(servizio.stato)}
                                </Badge>
                              </TableCell>

                              {/* Conducente */}
                              <TableCell>
                                {servizio.conducente ? (
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {servizio.conducente.first_name}{" "}
                                      {servizio.conducente.last_name}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground text-sm">
                                    Non assegnato
                                  </span>
                                )}
                              </TableCell>

                              {/* Pagamento */}
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm capitalize">
                                    {servizio.metodo_pagamento || "N/D"}
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>

                  {/* MOBILE: Cards */}
                  <div className="md:hidden space-y-4">
                    {servizi.map((servizio) => (
                      <Card
                        key={servizio.id}
                        className="cursor-pointer hover:bg-accent/50 active:scale-[0.98] transition-all"
                        onClick={() => navigate(`/servizi/${servizio.id}`)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <CardTitle className="text-base mb-1">
                                Servizio #{servizio.id_progressivo || servizio.id.slice(0, 8)}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                  {new Date(servizio.data_servizio).toLocaleDateString("it-IT")}
                                </span>
                                {servizio.orario_servizio && (
                                  <>
                                    <Clock className="h-3 w-3 ml-1" />
                                    <span>{servizio.orario_servizio}</span>
                                  </>
                                )}
                              </div>
                            </div>
                            <Badge variant={getStatoBadgeVariant(servizio.stato)}>
                              {getStatoLabel(servizio.stato)}
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Percorso */}
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-0.5">Partenza</p>
                                <p className="text-sm font-medium break-words">
                                  {servizio.indirizzo_presa}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-0.5">Destinazione</p>
                                <p className="text-sm font-medium break-words">
                                  {servizio.indirizzo_destinazione}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Info aggiuntive */}
                          <div className="flex flex-wrap gap-2 pt-2 border-t">
                            {servizio.numero_commessa && (
                              <Badge variant="outline" className="text-xs font-mono">
                                <FileText className="h-3 w-3 mr-1" />
                                {servizio.numero_commessa}
                              </Badge>
                            )}
                            {servizio.metodo_pagamento && (
                              <Badge variant="secondary" className="text-xs">
                                <CreditCard className="h-3 w-3 mr-1" />
                                {servizio.metodo_pagamento}
                              </Badge>
                            )}
                            {servizio.conducente && (
                              <Badge variant="secondary" className="text-xs">
                                <User className="h-3 w-3 mr-1" />
                                {servizio.conducente.first_name} {servizio.conducente.last_name}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ServiziPage;
