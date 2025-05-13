
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Servizio } from "@/lib/types/servizi";
import { format, parseISO } from "date-fns";
import { Building, User, Calendar, Clock, CreditCard, Users, MapPin } from "lucide-react";
import { User as UserType } from "@/lib/api/users/types";

// Definiamo il tipo User qui visto che non viene esportato da @/lib/api/users/types
type User = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  created_at?: string;
};

interface ServizioInfoTabProps {
  servizio: Servizio;
  passeggeri: any[];
  users: User[];
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: User[], userId?: string) => string;
  formatCurrency: (value?: number) => string;
}

export function ServizioInfoTab({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getUserName,
  formatCurrency
}: ServizioInfoTabProps) {
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

            {(servizio.stato === 'completato' || servizio.stato === 'consuntivato') && (
              <div>
                <h3 className="text-lg font-medium">Dati di completamento</h3>
                <Separator className="my-2" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="font-medium">Incasso ricevuto</div>
                    <div className="text-muted-foreground">{formatCurrency(servizio.incasso_ricevuto)}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Ore lavorate</div>
                    <div className="text-muted-foreground">
                      {servizio.ore_lavorate !== undefined ? `${servizio.ore_lavorate} ore` : "-"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {servizio.stato === 'consuntivato' && (
              <div>
                <h3 className="text-lg font-medium">Dati di consuntivazione</h3>
                <Separator className="my-2" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="font-medium">Incasso previsto</div>
                    <div className="text-muted-foreground">{formatCurrency(servizio.incasso_previsto)}</div>
                  </div>
                  
                  <div>
                    <div className="font-medium">Ore finali</div>
                    <div className="text-muted-foreground">
                      {servizio.ore_finali !== undefined ? `${servizio.ore_finali} ore` : "-"}
                    </div>
                  </div>
                  
                  {servizio.metodo_pagamento === 'Contanti' && servizio.consegna_contanti_a && (
                    <div>
                      <div className="font-medium">Consegna contanti a</div>
                      <div className="text-muted-foreground">
                        {getUserName(users, servizio.consegna_contanti_a) || "Utente sconosciuto"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
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
