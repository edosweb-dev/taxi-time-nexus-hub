
import { Calendar, Clock, MapPin, CreditCard, Users, UserRound, Building, User } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Servizio, StatoServizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getStatoBadge, getStateIcon, getUserName } from "./utils";
import { useQuery } from "@tanstack/react-query";
import { getAziende } from "@/lib/api/aziende";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";

interface ServizioCardProps {
  servizio: Servizio;
  users: Profile[];
  status: StatoServizio;
  isAdminOrSocio: boolean;
  onSelect: (servizio: Servizio) => void;
  onClick: (id: string) => void;
}

export const ServizioCard = ({
  servizio,
  users,
  status,
  isAdminOrSocio,
  onSelect,
  onClick
}: ServizioCardProps) => {
  const [passeggeriCount, setPasseggeriCount] = useState<number>(0);
  
  // Fetch all companies for reference
  const { data: aziende = [] } = useQuery({
    queryKey: ['aziende'],
    queryFn: getAziende,
  });

  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };

  // Fetch passenger count for this service
  useEffect(() => {
    const fetchPasseggeriCount = async () => {
      const { count, error } = await supabase
        .from('passeggeri')
        .select('*', { count: 'exact', head: true })
        .eq('servizio_id', servizio.id);
        
      if (error) {
        console.error('Error fetching passengers:', error);
        return;
      }
      
      setPasseggeriCount(count || 0);
    };
    
    fetchPasseggeriCount();
  }, [servizio.id]);

  return (
    <Card 
      className="relative cursor-pointer hover:bg-accent/10 transition-colors"
      onClick={() => onClick(servizio.id)}
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
        <div className="text-sm space-y-3">
          <div className="grid grid-cols-2 gap-2">
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
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-start gap-1">
              <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Data</div>
                <div className="text-muted-foreground">{format(new Date(servizio.data_servizio), "dd/MM/yyyy")}</div>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <Clock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Orario</div>
                <div className="text-muted-foreground">{servizio.orario_servizio}</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-1">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Indirizzo di presa</div>
                <div className="text-muted-foreground truncate">{servizio.indirizzo_presa}</div>
              </div>
            </div>
            <div className="flex items-start gap-1">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <div>
                <div className="font-medium">Indirizzo di destinazione</div>
                <div className="text-muted-foreground truncate">{servizio.indirizzo_destinazione}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
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
                <div className="text-muted-foreground">{passeggeriCount}</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-1">
            <UserRound className="h-4 w-4 mt-0.5 text-muted-foreground" />
            <div>
              <div className="font-medium">Assegnato a</div>
              {servizio.conducente_esterno ? (
                <div className="text-muted-foreground">{servizio.conducente_esterno_nome || "Conducente esterno"}</div>
              ) : servizio.assegnato_a ? (
                <div className="text-muted-foreground">{getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}</div>
              ) : (
                <div className="text-muted-foreground">Non assegnato</div>
              )}
            </div>
          </div>

          {status === 'da_assegnare' && isAdminOrSocio && (
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(servizio);
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              Assegna
            </Button>
          )}
        </div>
      </CardContent>
      {getStateIcon(servizio.stato) && (
        <div className="absolute top-3 right-3">
          {getStateIcon(servizio.stato)}
        </div>
      )}
    </Card>
  );
};
