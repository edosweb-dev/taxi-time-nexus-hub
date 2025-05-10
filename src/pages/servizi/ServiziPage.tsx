
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Calendar, Loader2 } from "lucide-react";
import { useServizi } from "@/hooks/useServizi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

export default function ServiziPage() {
  const navigate = useNavigate();
  const { servizi, isLoading, error } = useServizi();
  
  const getStatoBadge = (stato: string) => {
    switch (stato) {
      case 'da_assegnare':
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Da assegnare</Badge>;
      case 'assegnato':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Assegnato</Badge>;
      case 'completato':
        return <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">Completato</Badge>;
      case 'annullato':
        return <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100">Annullato</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Servizi</h1>
            <p className="text-muted-foreground">
              Gestisci i servizi di trasporto
            </p>
          </div>
          <Button onClick={() => navigate("/nuovo-servizio")}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuovo servizio
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                Si è verificato un errore nel caricamento dei servizi
              </div>
            </CardContent>
          </Card>
        ) : servizi.length === 0 ? (
          <Card>
            <CardContent className="pt-6 flex flex-col items-center justify-center h-64">
              <p className="text-muted-foreground mb-4 text-center">
                Non ci sono servizi disponibili
              </p>
              <Button onClick={() => navigate("/nuovo-servizio")}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Crea il tuo primo servizio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {servizi.map((servizio) => (
              <Card 
                key={servizio.id} 
                className="cursor-pointer hover:bg-accent/10 transition-colors"
                onClick={() => navigate(`/servizi/${servizio.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(servizio.data_servizio), "EEEE d MMMM yyyy", { locale: it })}
                      </span>
                    </div>
                    {getStatoBadge(servizio.stato)}
                  </div>
                  <CardTitle className="text-base mt-2">
                    {servizio.numero_commessa 
                      ? `Commessa: ${servizio.numero_commessa}` 
                      : "Servizio di trasporto"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Metodo di pagamento: {servizio.metodo_pagamento}</p>
                    {servizio.note && servizio.note.length > 50 ? (
                      <p className="mt-2">Note: {servizio.note.substring(0, 50)}...</p>
                    ) : servizio.note ? (
                      <p className="mt-2">Note: {servizio.note}</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
