
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PlusCircle, 
  Calendar, 
  Loader2, 
  Users, 
  UserCheck, 
  UserX, 
  CheckCircle,
  XCircle
} from "lucide-react";
import { useServizi } from "@/hooks/useServizi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { AssegnazioneDialog } from "@/components/servizi/AssegnazioneDialog";

export default function ServiziPage() {
  const navigate = useNavigate();
  const { servizi, isLoading, error } = useServizi();
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("da_assegnare");
  const [selectedServizio, setSelectedServizio] = useState<Servizio | null>(null);
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Group services by status
  const serviziByStatus = {
    da_assegnare: servizi.filter(s => s.stato === 'da_assegnare'),
    assegnato: servizi.filter(s => s.stato === 'assegnato'),
    completato: servizi.filter(s => s.stato === 'completato'),
    annullato: servizi.filter(s => s.stato === 'annullato'),
    non_accettato: servizi.filter(s => s.stato === 'non_accettato')
  };
  
  const getStatoBadge = (stato: StatoServizio) => {
    switch (stato) {
      case 'da_assegnare':
        return <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">Da assegnare</Badge>;
      case 'assegnato':
        return <Badge variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-100">Assegnato</Badge>;
      case 'completato':
        return <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">Completato</Badge>;
      case 'annullato':
        return <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100">Annullato</Badge>;
      case 'non_accettato':
        return <Badge variant="outline" className="bg-purple-100 text-purple-700 hover:bg-purple-100">Non accettato</Badge>;
      default:
        return <Badge variant="outline">{stato}</Badge>;
    }
  };

  const getStateIcon = (stato: StatoServizio) => {
    switch (stato) {
      case 'da_assegnare':
        return <Users className="h-5 w-5 text-amber-500" />;
      case 'assegnato':
        return <UserCheck className="h-5 w-5 text-blue-500" />;
      case 'completato':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'annullato':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'non_accettato':
        return <UserX className="h-5 w-5 text-purple-500" />;
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
          <Tabs defaultValue="da_assegnare" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-5 mb-8">
              <TabsTrigger value="da_assegnare" className="flex gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Da assegnare</span>
                <Badge variant="outline" className="ml-1">{serviziByStatus.da_assegnare.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="assegnato" className="flex gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Assegnati</span>
                <Badge variant="outline" className="ml-1">{serviziByStatus.assegnato.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="non_accettato" className="flex gap-2">
                <UserX className="h-4 w-4" />
                <span className="hidden sm:inline">Non accettati</span>
                <Badge variant="outline" className="ml-1">{serviziByStatus.non_accettato.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completato" className="flex gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Completati</span>
                <Badge variant="outline" className="ml-1">{serviziByStatus.completato.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="annullato" className="flex gap-2">
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Annullati</span>
                <Badge variant="outline" className="ml-1">{serviziByStatus.annullato.length}</Badge>
              </TabsTrigger>
            </TabsList>
            
            {(["da_assegnare", "assegnato", "non_accettato", "completato", "annullato"] as const).map((status) => (
              <TabsContent key={status} value={status} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviziByStatus[status].length === 0 ? (
                    <Card className="col-span-full">
                      <CardContent className="pt-6 flex flex-col items-center justify-center h-32">
                        <p className="text-muted-foreground text-center">
                          Nessun servizio {status === 'da_assegnare' ? 'da assegnare' : 
                                          status === 'assegnato' ? 'assegnato' : 
                                          status === 'completato' ? 'completato' : 
                                          status === 'non_accettato' ? 'non accettato' : 'annullato'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    serviziByStatus[status].map((servizio) => (
                      <Card 
                        key={servizio.id} 
                        className="relative cursor-pointer hover:bg-accent/10 transition-colors"
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
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Orario: {servizio.orario_servizio}</p>
                            <p>Metodo di pagamento: {servizio.metodo_pagamento}</p>
                            {servizio.conducente_esterno ? (
                              <p>Conducente esterno: {servizio.conducente_esterno_nome}</p>
                            ) : servizio.assegnato_a ? (
                              <p>Assegnato a: [Nome dipendente]</p>
                            ) : status === 'da_assegnare' && isAdminOrSocio ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedServizio(servizio);
                                }}
                              >
                                <Users className="mr-2 h-4 w-4" />
                                Assegna
                              </Button>
                            ) : null}
                          </div>
                        </CardContent>
                        {getStateIcon(servizio.stato) && (
                          <div className="absolute top-3 right-3">
                            {getStateIcon(servizio.stato)}
                          </div>
                        )}
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
      
      {selectedServizio && (
        <AssegnazioneDialog 
          isOpen={!!selectedServizio} 
          onClose={() => setSelectedServizio(null)} 
          servizio={selectedServizio} 
        />
      )}
    </MainLayout>
  );
}
