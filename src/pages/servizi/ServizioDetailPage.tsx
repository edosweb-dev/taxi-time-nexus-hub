import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Building, Calendar, Clock, CreditCard, Edit, MapPin, Pen, User, Users } from "lucide-react";
import { useServizio } from "@/hooks/useServizi";
import { useAziende } from "@/hooks/useAziende";
import { useUsers } from "@/hooks/useUsers";
import { format, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { getStatoBadge, getUserName } from "@/components/servizi/utils";
import { PasseggeroCard } from "@/components/servizi/passeggeri/PasseggeroCard";
import { Passeggero } from "@/lib/types/servizi";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { FirmaDialog } from "@/components/servizi/firma/FirmaDialog";
import { saveSignature } from "@/lib/api/servizi";
import { toast } from "@/components/ui/sonner";

export default function ServizioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data, isLoading, error, refetch } = useServizio(id);
  const { aziende } = useAziende();
  const { users } = useUsers();
  const [activeTab, setActiveTab] = useState<string>("info");
  const [firmaDialogOpen, setFirmaDialogOpen] = useState(false);
  
  const servizio = data?.servizio;
  const passeggeri = data?.passeggeri || [];
  
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  // Check if firma_digitale is enabled for this azienda
  const aziendaWithFirma = servizio?.azienda_id ? aziende.find(a => a.id === servizio.azienda_id) : null;
  const firmaDigitaleAttiva = aziendaWithFirma?.firma_digitale_attiva || false;
  
  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };
  
  const handleSignatureConfirm = async (signatureImage: string) => {
    if (!id) return;
    
    try {
      await saveSignature(id, signatureImage);
      toast.success("Firma salvata con successo");
      refetch(); // Reload servizio data to get the updated firma_url
    } catch (error) {
      console.error("Error saving signature:", error);
      toast.error("Errore nel salvataggio della firma");
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          <span className="ml-2">Caricamento servizio...</span>
        </div>
      </MainLayout>
    );
  }
  
  if (error || !servizio) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl font-bold mb-4">Errore</h2>
          <p className="text-muted-foreground mb-6">
            Si è verificato un errore nel caricamento del servizio o il servizio non esiste.
          </p>
          <Button onClick={() => navigate("/servizi")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna ai servizi
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/servizi")}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Indietro
              </Button>
              {getStatoBadge(servizio.stato)}
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-4">
              {servizio.numero_commessa 
                ? `Commessa: ${servizio.numero_commessa}` 
                : "Dettaglio servizio"}
            </h1>
            <p className="text-muted-foreground">
              {format(parseISO(servizio.data_servizio), "EEEE d MMMM yyyy", { locale: it })}
            </p>
          </div>
          
          <div className="flex gap-2">
            {firmaDigitaleAttiva && !servizio.firma_url && (
              <Button 
                variant="outline" 
                onClick={() => setFirmaDialogOpen(true)}
              >
                <Pen className="mr-2 h-4 w-4" />
                Firma
              </Button>
            )}
            
            {isAdminOrSocio && (
              <Button onClick={() => navigate(`/servizi/${id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Modifica servizio
              </Button>
            )}
          </div>
        </div>
        
        <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="info">Informazioni</TabsTrigger>
            <TabsTrigger value="passeggeri">
              Passeggeri ({passeggeri.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dettagli del servizio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Dati generali</h3>
                      <Separator className="my-2" />
                      
                      {/* Display signature if available */}
                      {servizio.firma_url && (
                        <div className="mb-4 p-4 border rounded-md">
                          <h4 className="text-sm font-medium mb-2">Firma digitale</h4>
                          <div className="flex flex-col gap-2">
                            <a 
                              href={servizio.firma_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block max-w-xs"
                            >
                              <img 
                                src={servizio.firma_url} 
                                alt="Firma digitale" 
                                className="border rounded w-full max-h-20 object-contain bg-white"
                              />
                            </a>
                            {servizio.firma_timestamp && (
                              <p className="text-xs text-muted-foreground">
                                Firmato il: {format(new Date(servizio.firma_timestamp), "dd/MM/yyyy HH:mm")}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-start gap-1">
                          <Building className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Azienda</div>
                            <div className="text-muted-foreground">{getAziendaName(servizio.azienda_id)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1">
                          <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Referente</div>
                            <div className="text-muted-foreground">{getUserName(users, servizio.referente_id)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1">
                          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Data</div>
                            <div className="text-muted-foreground">
                              {format(parseISO(servizio.data_servizio), "dd/MM/yyyy")}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1">
                          <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Orario</div>
                            <div className="text-muted-foreground">{servizio.orario_servizio}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1">
                          <CreditCard className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Metodo pagamento</div>
                            <div className="text-muted-foreground">{servizio.metodo_pagamento}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1">
                          <Users className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Passeggeri</div>
                            <div className="text-muted-foreground">{passeggeri.length}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Assegnazione</h3>
                      <Separator className="my-2" />
                      
                      <div>
                        {servizio.conducente_esterno ? (
                          <div className="space-y-2">
                            <div>
                              <span className="font-medium">Nome conducente esterno:</span>{" "}
                              <span>{servizio.conducente_esterno_nome || "Non specificato"}</span>
                            </div>
                            <div>
                              <span className="font-medium">Email conducente esterno:</span>{" "}
                              <span>{servizio.conducente_esterno_email || "Non specificato"}</span>
                            </div>
                          </div>
                        ) : servizio.assegnato_a ? (
                          <div>
                            <span className="font-medium">Assegnato a:</span>{" "}
                            <span>{getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}</span>
                          </div>
                        ) : (
                          <div className="text-muted-foreground">Non assegnato</div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Indirizzi</h3>
                      <Separator className="my-2" />
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Indirizzo di presa</div>
                            <div className="text-muted-foreground">{servizio.indirizzo_presa}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-1">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Indirizzo di destinazione</div>
                            <div className="text-muted-foreground">{servizio.indirizzo_destinazione}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {servizio.note && (
                      <div>
                        <h3 className="text-lg font-medium">Note</h3>
                        <Separator className="my-2" />
                        <p className="text-muted-foreground whitespace-pre-wrap">{servizio.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="passeggeri" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lista passeggeri</CardTitle>
              </CardHeader>
              <CardContent>
                {passeggeri.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nessun passeggero associato a questo servizio</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {passeggeri.map((passeggero: Passeggero) => (
                      <PasseggeroCard
                        key={passeggero.id}
                        passeggero={passeggero}
                        servizioPresa={servizio.indirizzo_presa}
                        servizioDestinazione={servizio.indirizzo_destinazione}
                        servizioOrario={servizio.orario_servizio}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <FirmaDialog 
        isOpen={firmaDialogOpen}
        onClose={() => setFirmaDialogOpen(false)}
        onConfirm={handleSignatureConfirm}
        servizioId={id || ''}
      />
    </MainLayout>
  );
}
