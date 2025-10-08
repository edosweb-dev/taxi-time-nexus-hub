import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/lib/types";
import { Servizio } from "@/lib/types/servizi";
import { useVeicoli } from "@/hooks/useVeicoli";

interface AssignmentInfoSectionProps {
  servizio: Servizio;
  users: Profile[];
  getUserName: (users: Profile[], userId?: string) => string | null;
}

export function AssignmentInfoSection({
  servizio,
  users,
  getUserName,
}: AssignmentInfoSectionProps) {
  const { veicoli = [] } = useVeicoli();
  
  const { data: conducenteEsterno } = useQuery({
    queryKey: ['conducente-esterno', servizio.conducente_esterno_id],
    queryFn: async () => {
      if (!servizio.conducente_esterno_id) return null;
      const { data } = await supabase
        .from('conducenti_esterni')
        .select('*')
        .eq('id', servizio.conducente_esterno_id)
        .single();
      return data;
    },
    enabled: !!servizio.conducente_esterno_id
  });

  const veicolo = veicoli.find(v => v.id === servizio.veicolo_id);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Assegnazione e veicolo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Assegnato a</div>
            {servizio.conducente_esterno ? (
              <div>
                <Badge variant="outline" className="mb-2">Conducente esterno</Badge>
                {conducenteEsterno ? (
                  <div className="space-y-1">
                    <div className="text-base font-medium">{conducenteEsterno.nome_cognome}</div>
                    {conducenteEsterno.email && (
                      <div className="text-sm text-muted-foreground">{conducenteEsterno.email}</div>
                    )}
                    {conducenteEsterno.telefono && (
                      <div className="text-sm text-muted-foreground">{conducenteEsterno.telefono}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-base">Conducente esterno</div>
                )}
              </div>
            ) : servizio.assegnato_a ? (
              <div>
                <Badge variant="default" className="mb-2">Dipendente</Badge>
                <div className="text-base font-medium">
                  {getUserName(users, servizio.assegnato_a)}
                </div>
              </div>
            ) : (
              <div className="text-base text-muted-foreground">Non ancora assegnato</div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Veicolo</div>
            {veicolo ? (
              <div className="space-y-1">
                <div className="text-base font-medium">{veicolo.modello}</div>
                <div className="text-sm text-muted-foreground">
                  Targa: {veicolo.targa}
                  {veicolo.colore && ` • ${veicolo.colore}`}
                  {veicolo.numero_posti && ` • ${veicolo.numero_posti} posti`}
                </div>
              </div>
            ) : (
              <div className="text-base text-muted-foreground">Da assegnare</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}