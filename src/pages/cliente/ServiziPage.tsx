import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, FileText, ArrowLeft } from "lucide-react";
import { useServiziCliente, StatoServizio } from "@/hooks/useServiziCliente";

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
                // Lista Servizi
                <div className="space-y-4">
                  {servizi.map((servizio) => (
                    <Card 
                      key={servizio.id} 
                      className="hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/servizi/${servizio.id}`)}
                    >
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span>
                            Servizio #{servizio.id_progressivo || servizio.id.slice(0, 8)}
                          </span>
                          <Badge variant={getStatoBadgeVariant(servizio.stato)}>
                            {servizio.stato.replace('_', ' ')}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Data:</span>
                            <span>
                              {new Date(servizio.data_servizio).toLocaleDateString("it-IT")} - {servizio.orario_servizio}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium whitespace-nowrap">Da:</span>
                            <span className="text-muted-foreground">{servizio.indirizzo_presa}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="font-medium whitespace-nowrap">A:</span>
                            <span className="text-muted-foreground">{servizio.indirizzo_destinazione}</span>
                          </div>
                          {servizio.numero_commessa && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Commessa:</span>
                              <span className="text-muted-foreground">{servizio.numero_commessa}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <span className="text-xs text-muted-foreground">
                              {servizio.metodo_pagamento}
                            </span>
                            {servizio.conducente && (
                              <span className="text-xs text-muted-foreground">
                                Conducente: {servizio.conducente.first_name} {servizio.conducente.last_name}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default ServiziPage;
