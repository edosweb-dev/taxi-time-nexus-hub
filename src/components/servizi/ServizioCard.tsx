import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Calendar, Clock, Info, MapPin, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";

export function ServizioCard({ 
  servizio,
  users,
  onSelectServizio,
  onNavigateToDetail,
  isAdminOrSocio
}: { 
  servizio: Servizio; 
  users: Profile[];
  onSelectServizio: (servizio: Servizio) => void;
  onNavigateToDetail: (id: string) => void;
  isAdminOrSocio: boolean;
}) {
  const assignedUser = users.find(user => user.id === servizio.assegnato_a);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">
            {formatDate(servizio.data_servizio)}
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Building className="h-4 w-4 text-muted-foreground" />
            <span>{servizio.azienda_id}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{servizio.indirizzo_presa}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{servizio.indirizzo_destinazione}</span>
          </div>
        </div>
        
        <CardFooter className="px-0 pt-4 pb-0 flex justify-between gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            className="flex-1"
            onClick={() => onNavigateToDetail(servizio.id)}
          >
            <Info className="h-4 w-4 mr-1" />
            Dettagli
          </Button>
          {isAdminOrSocio && servizio.stato === 'da_assegnare' && (
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => onSelectServizio(servizio)}
            >
              <Users className="h-4 w-4 mr-1" />
              Assegna
            </Button>
          )}
        </CardFooter>
      </CardContent>
    </Card>
  );
}
