
import { useState, useEffect } from "react";
import { format, addDays, subDays, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addHours, setHours, isBefore, isAfter } from "date-fns";
import { it } from "date-fns/locale";
import { TableIcon, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  allServizi: Servizio[];
}

// Define time slots for the calendar (from 6:00 to 22:00)
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_HEIGHT = 60; // Height in pixels for each hour slot

export const CalendarView = ({ servizi, users, onNavigateToDetail, allServizi }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"week" | "day" | "table">("week");
  const [passeggeriCounts, setPasseggeriCounts] = useState<Record<string, number>>({});
  
  // Get the start and end of the week for the current date
  const startDay = viewMode === "week" 
    ? startOfWeek(currentDate, { weekStartsOn: 1 }) // Start from Monday
    : currentDate;
    
  const endDay = viewMode === "week"
    ? endOfWeek(currentDate, { weekStartsOn: 1 }) // End on Sunday
    : currentDate;
    
  // Get all days in the current view period
  const daysInView = eachDayOfInterval({ start: startDay, end: endDay });
  
  // Filter servizi for the current view period
  const serviziInView = servizi.filter(s => {
    const servizioDate = parseISO(s.data_servizio);
    return daysInView.some(day => isSameDay(servizioDate, day));
  });
  
  // Fetch all companies for reference
  const { data: aziende = [] } = useQuery({
    queryKey: ['aziende'],
    queryFn: getAziende,
  });

  // Fetch passenger counts for services in view
  useEffect(() => {
    const fetchPasseggeriCounts = async () => {
      if (serviziInView.length === 0) return;
      
      const servizioIds = serviziInView.map(s => s.id);
      
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
  }, [serviziInView]);

  const goToPreviousPeriod = () => {
    setCurrentDate(viewMode === "week" ? subDays(currentDate, 7) : subDays(currentDate, 1));
  };
  
  const goToNextPeriod = () => {
    setCurrentDate(viewMode === "week" ? addDays(currentDate, 7) : addDays(currentDate, 1));
  };
  
  const goToToday = () => setCurrentDate(new Date());

  // Get company name by ID
  const getAziendaName = (aziendaId?: string) => {
    if (!aziendaId) return "Azienda sconosciuta";
    const azienda = aziende.find(a => a.id === aziendaId);
    return azienda ? azienda.nome : "Azienda sconosciuta";
  };

  // Helper to parse the time string (format: "HH:MM") to a number of hours
  const parseTimeToHours = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours + (minutes / 60);
  };

  // Position a service in the calendar grid based on its time
  const getServizioPosition = (servizio: Servizio): { top: number, height: number } => {
    // Default height (1 hour)
    const defaultHeight = HOUR_HEIGHT;
    
    // Default start time (8:00 AM if not specified)
    const startTime = servizio.orario_servizio 
      ? parseTimeToHours(servizio.orario_servizio)
      : 8;
      
    // Calculate position relative to the first hour of the day (6 AM)
    const top = (startTime - 6) * HOUR_HEIGHT;
    
    // For now use default height, but could be customized based on estimated duration
    return { top, height: defaultHeight };
  };

  // Render servizi for a specific day in the calendar view
  const renderServiziForDay = (day: Date) => {
    const serviziOfDay = serviziInView.filter(s => isSameDay(parseISO(s.data_servizio), day));
    
    return serviziOfDay.map(servizio => {
      const { top, height } = getServizioPosition(servizio);
      
      return (
        <div 
          key={servizio.id}
          className="absolute left-1 right-1 bg-primary/80 text-white rounded px-2 py-1 overflow-hidden cursor-pointer hover:bg-primary transition-colors"
          style={{ 
            top: `${top}px`, 
            height: `${height}px`,
            zIndex: 10
          }}
          onClick={() => onNavigateToDetail(servizio.id)}
        >
          <div className="font-medium text-xs truncate">
            {servizio.orario_servizio} - {servizio.numero_commessa || "Servizio"}
          </div>
          <div className="text-xs truncate">
            {getAziendaName(servizio.azienda_id)}
          </div>
        </div>
      );
    });
  };

  const formatViewPeriod = () => {
    if (viewMode === "day") {
      return format(currentDate, "EEEE d MMMM yyyy", { locale: it });
    } else {
      const start = format(startDay, "d MMMM", { locale: it });
      const end = format(endDay, "d MMMM yyyy", { locale: it });
      return `${start} - ${end}`;
    }
  };

  if (viewMode === "table") {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center space-y-3">
          <h2 className="text-xl font-semibold">
            {formatViewPeriod()}
          </h2>
          <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
              <Button variant="outline" onClick={goToPreviousPeriod} size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" />
                Precedente
              </Button>
              <Button variant="outline" onClick={goToToday} size="sm">
                Oggi
              </Button>
              <Button variant="outline" onClick={goToNextPeriod} size="sm">
                Successivo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
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
            
            <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "week" | "day" | "table")}>
              <ToggleGroupItem value="day" aria-label="Visualizza giorno">
                Giorno
              </ToggleGroupItem>
              <ToggleGroupItem value="week" aria-label="Visualizza settimana">
                Settimana
              </ToggleGroupItem>
              <ToggleGroupItem value="table" aria-label="Visualizza tabella">
                <TableIcon className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <ServizioTable
          servizi={serviziInView}
          users={users}
          onNavigateToDetail={onNavigateToDetail}
          allServizi={allServizi}
          isAdminOrSocio={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-3">
        <h2 className="text-xl font-semibold">
          {formatViewPeriod()}
        </h2>
        <div className="flex justify-between items-center w-full">
          <div className="flex gap-2">
            <Button variant="outline" onClick={goToPreviousPeriod} size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Precedente
            </Button>
            <Button variant="outline" onClick={goToToday} size="sm">
              Oggi
            </Button>
            <Button variant="outline" onClick={goToNextPeriod} size="sm">
              Successivo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calendar className="h-4 w-4" />
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
          
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "week" | "day" | "table")}>
            <ToggleGroupItem value="day" aria-label="Visualizza giorno">
              Giorno
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Visualizza settimana">
              Settimana
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Visualizza tabella">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
      
      <div className="bg-background border rounded-md overflow-auto">
        {/* Time labels column */}
        <div className="flex">
          <div className="w-16 flex-shrink-0 border-r">
            {/* Time header - empty cell */}
            <div className="h-10 border-b bg-muted/50" />
            
            {/* Time slots */}
            {HOURS.map((hour) => (
              <div 
                key={hour} 
                className="h-[60px] border-b flex flex-col justify-start items-center text-xs text-muted-foreground pt-0.5"
              >
                <span>{hour}:00</span>
              </div>
            ))}
          </div>
          
          {/* Days columns */}
          <div className={`flex-1 flex ${viewMode === "day" ? "" : "divide-x"}`}>
            {daysInView.map((day) => (
              <div 
                key={day.toISOString()} 
                className={`${viewMode === "week" ? "w-1/7" : "w-full"} relative`}
              >
                {/* Day header */}
                <div className={`h-10 flex justify-center items-center border-b bg-muted/50 sticky top-0 z-20 
                  ${isSameDay(day, new Date()) ? "font-bold text-primary" : ""}`}
                >
                  <div className="text-sm">
                    {format(day, "EEE", { locale: it })}
                  </div>
                  <div className="text-sm ml-1">
                    {format(day, "d", { locale: it })}
                  </div>
                </div>
                
                {/* Hour grid lines */}
                {HOURS.map((hour) => (
                  <div 
                    key={`${day.toISOString()}-${hour}`}
                    className="h-[60px] border-b"
                  />
                ))}
                
                {/* Servizi for the day */}
                {renderServiziForDay(day)}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {serviziInView.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nessun servizio programmato per questo periodo
          </CardContent>
        </Card>
      )}
    </div>
  );
};
