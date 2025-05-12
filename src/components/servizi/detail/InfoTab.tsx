
import { format } from "date-fns";
import { Building, Calendar, Clock, CreditCard, MapPin, User, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Servizio } from "@/lib/types/servizi";
import { getUserName } from "@/components/servizi/utils";

interface ServizioWithCount extends Servizio {
  passeggeriCount?: number;
}

interface InfoTabProps {
  servizio: ServizioWithCount;
  getAziendaName: (aziendaId?: string) => string;
  users: any[];
}

export function InfoTab({ servizio, getAziendaName, users }: InfoTabProps) {
  return (
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
                      {format(new Date(servizio.data_servizio), "dd/MM/yyyy")}
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
                    <div className="text-muted-foreground">
                      {servizio.passeggeriCount || 0}
                    </div>
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
  );
}
