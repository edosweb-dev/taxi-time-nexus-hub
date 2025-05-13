import { useState, useEffect } from "react";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { TableIcon, Layout, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getStatoBadge, getUserName } from "./utils";
import { useQuery } from "@tanstack/react-query";
import { getAziende } from "@/lib/api/aziende";
import { supabase } from "@/lib/supabase";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ServizioTable } from "./ServizioTable";

interface CalendarViewProps {
  servizi: Servizio[];
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
  allServizi: Servizio[]; // Updated to expect proper Servizio objects
}

export const CalendarView = ({ servizi, users, onNavigateToDetail, allServizi }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [passeggeriCounts, setPasseggeriCounts] = useState<Record<string, number>>({});
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const serviziDelGiorno = servizi.filter(s => 
    isSameDay(parseISO(s.data_servizio), currentDate)
  );

  // Fetch all companies for reference
  const { data: aziende = [] } = useQuery({
    queryKey: ['aziende'],
    queryFn: getAziende,
  });

  // Fetch passenger counts for services of the day
  useEffect(() => {
    const fetchPasseggeriCounts = async () => {
      if (serviziDelGiorno.length === 0) return;
      
      const servizioIds = serviziDelGiorno.map(s => s.id);
      
      const { data, error } = await supabase
        .from('passeggeri')
        .select('servizio_id')
        .in('servizio_id', servizioIds);
        
      if (error) {
        console.error('Error fetching passengers:', error);
        return;
      }
      
      // Count passengers per service
      const counts: Record<string, number> = {};
      data?.forEach(p => {
        counts[p.servizio_id] = (counts[p.servizio_id] || 0) + 1;
      });
      
      setPasseggeriCounts(counts);
    };
    
    fetchPasseggeriCounts();
  }, [serviziDelGiorno]);

  const goToPreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };

  // Get referent name by ID
  const getReferenteName = (users: Profile[], referenteId?: string) => {
    if (!referenteId) return "Referente sconosciuto";
    return getUserName(users, referenteId) || "Referente sconosciuto";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-3">
        <h2 className="text-xl font-semibold">
          {format(currentDate, "EEEE d MMMM yyyy", { locale: it })}
        </h2>

        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <Button variant="outline" onClick={goToPreviousDay} size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Precedente
            </Button>
            <Button variant="outline" onClick={goToToday} size="sm">
              Oggi
            </Button>
            <Button variant="outline" onClick={goToNextDay} size="sm">
              Successivo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Scegli data</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && setCurrentDate(date)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "cards" | "table")}>
            <ToggleGroupItem value="cards" aria-label="Visualizza schede">
              <Layout className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Visualizza tabella">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {serviziDelGiorno.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nessun servizio programmato per questo giorno
          </CardContent>
        </Card>
      ) : viewMode === "table" ? (
        <ServizioTable
          servizi={serviziDelGiorno}
          users={users}
          onNavigateToDetail={onNavigateToDetail}
          allServizi={allServizi}
          isAdminOrSocio={false}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviziDelGiorno.map(servizio => (
            <Card 
              key={servizio.id} 
              className="cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => onNavigateToDetail(servizio.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">
                    {servizio.numero_commessa 
                      ? `Commessa: ${servizio.numero_commessa}` 
                      : "Servizio di trasporto"}
                  </CardTitle>
                  <div>{getStatoBadge(servizio.stato)}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-1 gap-1">
                  <div className="flex justify-between">
                    <span className="font-medium">Azienda:</span>
                    <span className="text-right">{getAziendaName(servizio.azienda_id)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Referente:</span>
                    <span className="text-right">{getReferenteName(users, servizio.referente_id)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="font-medium">Data:</span>{" "}
                    <span>{format(parseISO(servizio.data_servizio), "dd/MM/yyyy")}</span>
                  </div>
                  <div>
                    <span className="font-medium">Orario:</span>{" "}
                    <span>{servizio.orario_servizio}</span>
                  </div>
                </div>
                
                <div className="space-y-1 pt-1">
                  <div>
                    <span className="font-medium">Partenza:</span>{" "}
                    <span className="text-muted-foreground">{servizio.indirizzo_presa}</span>
                  </div>
                  <div>
                    <span className="font-medium">Destinazione:</span>{" "}
                    <span className="text-muted-foreground">{servizio.indirizzo_destinazione}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="font-medium">Metodo pagamento:</span>{" "}
                    <span>{servizio.metodo_pagamento}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span className="font-medium mr-1">Passeggeri:</span>{" "}
                    <span>{passeggeriCounts[servizio.id] || 0}</span>
                  </div>
                </div>
                
                <div className="pt-1">
                  <span className="font-medium">Assegnato a:</span>{" "}
                  {servizio.conducente_esterno ? (
                    <span>{servizio.conducente_esterno_nome || "Conducente esterno"}</span>
                  ) : servizio.assegnato_a ? (
                    <span>{getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}</span>
                  ) : (
                    <span className="text-muted-foreground">Non assegnato</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
