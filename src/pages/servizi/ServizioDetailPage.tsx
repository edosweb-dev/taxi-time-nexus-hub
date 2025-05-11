
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServizio } from "@/hooks/useServizio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building, User, Calendar, Clock, MapPin, CreditCard, FileText, ArrowLeft, Phone, Mail } from "lucide-react";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useAziendaDetail } from "@/hooks/useAziendaDetail";
import { useUsers } from "@/hooks/useUsers";
import { getStatoBadge } from "@/components/servizi/utils/serviceUtils";

export default function ServizioDetailPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useServizio(id);
  const { users } = useUsers();
  
  const servizio = data?.servizio;
  const passeggeri = data?.passeggeri || [];
  
  // Fetch related azienda details
  const { azienda } = useAziendaDetail(servizio?.azienda_id || "");
  
  // Find referent and assigned user details
  const referente = users.find(user => user.id === servizio?.referente_id);
  const assegnatario = users.find(user => user.id === servizio?.assegnato_a);
  
  const handleNavigateBack = () => {
    navigate("/servizi");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (error || !servizio) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleNavigateBack}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Torna ai servizi
            </Button>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-destructive">
                Si è verificato un errore nel caricamento del servizio o il servizio non esiste
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={handleNavigateBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Torna ai servizi
          </Button>
          <div className="ml-auto flex items-center gap-2">
            {getStatoBadge(servizio.stato)}
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Informazioni servizio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Azienda</span>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{azienda?.nome || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Referente</span>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {referente ? `${referente.first_name || ''} ${referente.last_name || ''}`.trim() : 'N/A'}
                    </span>
                  </div>
                </div>
                
                {servizio.numero_commessa && (
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-muted-foreground">Numero commessa</span>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{servizio.numero_commessa}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Data servizio</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{formatDate(servizio.data_servizio)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Orario servizio</span>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{servizio.orario_servizio.substring(0, 5)}</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Metodo di pagamento</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{servizio.metodo_pagamento}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Indirizzo di presa</span>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{servizio.indirizzo_presa}</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Indirizzo di destinazione</span>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{servizio.indirizzo_destinazione}</span>
                </div>
              </div>
            </div>
            
            {servizio.note && (
              <>
                <Separator className="my-4" />
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-muted-foreground">Note</span>
                  <p className="whitespace-pre-wrap">{servizio.note}</p>
                </div>
              </>
            )}
            
            <Separator className="my-4" />
            
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Assegnato a</span>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {servizio.conducente_esterno 
                    ? `${servizio.conducente_esterno_nome || 'Conducente esterno'}`
                    : assegnatario 
                      ? `${assegnatario.first_name || ''} ${assegnatario.last_name || ''}`.trim()
                      : 'Non assegnato'
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Passeggeri ({passeggeri.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {passeggeri.length === 0 ? (
                <div className="col-span-full text-center py-6 text-muted-foreground">
                  Nessun passeggero per questo servizio
                </div>
              ) : (
                passeggeri.map((passeggero) => (
                  <Card key={passeggero.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex flex-col">
                          <span className="font-medium">{passeggero.nome_cognome}</span>
                          
                          {passeggero.email && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5" />
                              <span>{passeggero.email}</span>
                            </div>
                          )}
                          
                          {passeggero.telefono && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5" />
                              <span>{passeggero.telefono}</span>
                            </div>
                          )}
                        </div>
                        
                        <Separator className="my-2" />
                        
                        <div className="space-y-2">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Orario presa</span>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {passeggero.usa_indirizzo_personalizzato && passeggero.orario_presa_personalizzato
                                  ? passeggero.orario_presa_personalizzato.substring(0, 5)
                                  : servizio.orario_servizio.substring(0, 5)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Luogo di presa</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato
                                  ? passeggero.luogo_presa_personalizzato
                                  : servizio.indirizzo_presa}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs text-muted-foreground">Destinazione</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="text-sm">
                                {passeggero.usa_indirizzo_personalizzato && passeggero.destinazione_personalizzato
                                  ? passeggero.destinazione_personalizzato
                                  : servizio.indirizzo_destinazione}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
