import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServizi } from "@/hooks/useServizi";
import { useUsers } from "@/hooks/useUsers";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, MapPin, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Servizio } from "@/lib/types/servizi";

export default function ServiziPage() {
  const navigate = useNavigate();
  const { servizi = [], isLoading, error } = useServizi();
  const { users = [] } = useUsers();
  const [activeTab, setActiveTab] = useState("tutti");

  // Group servizi by status
  const serviziByStatus = {
    tutti: servizi,
    da_assegnare: servizi.filter((s: Servizio) => s.stato === 'da_assegnare'),
    assegnato: servizi.filter((s: Servizio) => s.stato === 'assegnato'),
    completato: servizi.filter((s: Servizio) => s.stato === 'completato'),
    consuntivato: servizi.filter((s: Servizio) => s.stato === 'consuntivato')
  };

  const getStatusColor = (stato: string) => {
    const colors: Record<string, string> = {
      da_assegnare: 'bg-yellow-500 text-white',
      assegnato: 'bg-blue-500 text-white',
      completato: 'bg-green-500 text-white',
      consuntivato: 'bg-purple-500 text-white',
      annullato: 'bg-red-500 text-white'
    };
    return colors[stato] || 'bg-gray-500 text-white';
  };

  const getStatusLabel = (stato: string) => {
    const labels: Record<string, string> = {
      da_assegnare: 'Da Assegnare',
      assegnato: 'Assegnato',
      completato: 'Completato',
      consuntivato: 'Consuntivato',
      annullato: 'Annullato'
    };
    return labels[stato] || stato;
  };

  const renderServizioCard = (servizio: Servizio) => (
    <Card 
      key={servizio.id}
      className="w-full p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/servizi/${servizio.id}`)}
    >
      {/* Card Header: Azienda + Status */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base sm:text-lg truncate">
            {servizio.aziende?.nome || 'N/A'}
          </h3>
          {servizio.numero_commessa && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Commessa: {servizio.numero_commessa}
            </p>
          )}
        </div>
        <Badge className={getStatusColor(servizio.stato)}>
          {getStatusLabel(servizio.stato)}
        </Badge>
      </div>

      {/* Card Body: Info Servizio */}
      <div className="space-y-2 text-sm">
        {/* Data e Orario */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1">
            {format(new Date(servizio.data_servizio), 'dd/MM/yyyy', { locale: it })}
          </span>
          <span className="text-xs text-muted-foreground">
            {servizio.orario_servizio}
          </span>
        </div>

        {/* Percorso */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="truncate text-xs sm:text-sm">
              <span className="text-muted-foreground">Da:</span> {servizio.indirizzo_presa}
            </p>
            <p className="truncate text-xs sm:text-sm">
              <span className="text-muted-foreground">A:</span> {servizio.indirizzo_destinazione}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Pagamento + Importo */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t">
        <span className="text-xs uppercase text-muted-foreground">
          {servizio.metodo_pagamento}
        </span>
        {servizio.incasso_previsto && (
          <span className="font-semibold text-primary">
            €{servizio.incasso_previsto.toFixed(2)}
          </span>
        )}
      </div>
    </Card>
  );

  return (
    <MainLayout>
      {/* CRITICAL: Usa ESATTAMENTE lo stesso pattern di ServizioCreaPage */}
      <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Servizi</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gestisci tutti i servizi dell'azienda
            </p>
          </div>
          <Button 
            onClick={() => navigate("/servizi/crea")}
            size="default"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Servizio
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="w-full p-8 text-center">
            <p className="text-destructive">Errore nel caricamento dei servizi</p>
          </Card>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto grid grid-cols-5 sm:inline-flex mb-4">
              <TabsTrigger value="tutti">
                Tutti
                <span className="ml-1.5 text-xs">({serviziByStatus.tutti.length})</span>
              </TabsTrigger>
              <TabsTrigger value="da_assegnare">
                <span className="hidden sm:inline">Da Assegnare</span>
                <span className="sm:hidden">Da Ass.</span>
                <span className="ml-1.5 text-xs">({serviziByStatus.da_assegnare.length})</span>
              </TabsTrigger>
              <TabsTrigger value="assegnato">
                <span className="hidden sm:inline">Assegnati</span>
                <span className="sm:hidden">Ass.</span>
                <span className="ml-1.5 text-xs">({serviziByStatus.assegnato.length})</span>
              </TabsTrigger>
              <TabsTrigger value="completato">
                <span className="hidden sm:inline">Completati</span>
                <span className="sm:hidden">Compl.</span>
                <span className="ml-1.5 text-xs">({serviziByStatus.completato.length})</span>
              </TabsTrigger>
              <TabsTrigger value="consuntivato">
                <span className="hidden sm:inline">Consuntivati</span>
                <span className="sm:hidden">Cons.</span>
                <span className="ml-1.5 text-xs">({serviziByStatus.consuntivato.length})</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content - TUTTI */}
            <TabsContent value="tutti" className="mt-0">
              <div className="w-full space-y-3">
                {serviziByStatus.tutti.map(renderServizioCard)}
                {serviziByStatus.tutti.length === 0 && (
                  <Card className="w-full p-8 text-center">
                    <p className="text-muted-foreground mb-4">Nessun servizio trovato</p>
                    <Button 
                      onClick={() => navigate("/servizi/crea")}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crea il primo servizio
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab Content - DA ASSEGNARE */}
            <TabsContent value="da_assegnare" className="mt-0">
              <div className="w-full space-y-3">
                {serviziByStatus.da_assegnare.map(renderServizioCard)}
                {serviziByStatus.da_assegnare.length === 0 && (
                  <Card className="w-full p-8 text-center">
                    <p className="text-muted-foreground">Nessun servizio da assegnare</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab Content - ASSEGNATO */}
            <TabsContent value="assegnato" className="mt-0">
              <div className="w-full space-y-3">
                {serviziByStatus.assegnato.map(renderServizioCard)}
                {serviziByStatus.assegnato.length === 0 && (
                  <Card className="w-full p-8 text-center">
                    <p className="text-muted-foreground">Nessun servizio assegnato</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab Content - COMPLETATO */}
            <TabsContent value="completato" className="mt-0">
              <div className="w-full space-y-3">
                {serviziByStatus.completato.map(renderServizioCard)}
                {serviziByStatus.completato.length === 0 && (
                  <Card className="w-full p-8 text-center">
                    <p className="text-muted-foreground">Nessun servizio completato</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Tab Content - CONSUNTIVATO */}
            <TabsContent value="consuntivato" className="mt-0">
              <div className="w-full space-y-3">
                {serviziByStatus.consuntivato.map(renderServizioCard)}
                {serviziByStatus.consuntivato.length === 0 && (
                  <Card className="w-full p-8 text-center">
                    <p className="text-muted-foreground">Nessun servizio consuntivato</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

      </div>
    </MainLayout>
  );
}
