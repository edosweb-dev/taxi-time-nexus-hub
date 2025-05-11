
import { Servizio } from "@/lib/types/servizi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building, User, Calendar, Clock, MapPin, CreditCard, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Profile } from "@/lib/types";
import { Azienda } from "@/lib/types";

interface ServiceInfoCardProps {
  servizio: Servizio;
  referente?: Profile | null;
  assegnatario?: Profile | null;
  azienda?: Azienda | null;
}

export function ServiceInfoCard({ 
  servizio, 
  referente, 
  assegnatario, 
  azienda 
}: ServiceInfoCardProps) {
  return (
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
  );
}
