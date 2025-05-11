
import { useState } from "react";
import { format, addDays, subDays, isSameDay, parseISO } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { getStatoBadge, getUserName } from "./utils/serviceUtils";

interface CalendarViewProps {
  servizi: Servizio[];
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
}

export const CalendarView = ({ servizi, users, onNavigateToDetail }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const serviziDelGiorno = servizi.filter(s => 
    isSameDay(parseISO(s.data_servizio), currentDate)
  );

  const goToPreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-3">
        <h2 className="text-xl font-semibold">
          {format(currentDate, "EEEE d MMMM yyyy", { locale: it })}
        </h2>

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
      </div>

      {serviziDelGiorno.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nessun servizio programmato per questo giorno
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviziDelGiorno.map(servizio => (
            <Card 
              key={servizio.id} 
              className="cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => onNavigateToDetail(servizio.id)}
            >
              <CardHeader className="pb-2 flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    {servizio.numero_commessa 
                      ? `Commessa: ${servizio.numero_commessa}` 
                      : "Servizio di trasporto"}
                  </CardTitle>
                  <p className="text-sm font-medium mt-1">
                    Ore {servizio.orario_servizio}
                  </p>
                </div>
                <div>{getStatoBadge(servizio.stato)}</div>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>Da: {servizio.indirizzo_presa}</p>
                <p>A: {servizio.indirizzo_destinazione}</p>
                <p>Metodo pagamento: {servizio.metodo_pagamento}</p>
                {servizio.assegnato_a && (
                  <p>Assegnato a: {getUserName(users, servizio.assegnato_a) || "Utente sconosciuto"}</p>
                )}
                {servizio.conducente_esterno && servizio.conducente_esterno_nome && (
                  <p>Conducente esterno: {servizio.conducente_esterno_nome}</p>
                )}
                {servizio.note && <p>Note: {servizio.note}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
