import { useState, useEffect } from "react";
import { format, addDays, subDays, isSameDay, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { it } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { getAziende } from "@/lib/api/aziende";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarLegend } from "./CalendarLegend";
import { ServizioTable } from "../ServizioTable";
import { CalendarViewProps, ViewMode } from "./types";

// Define time slots for the calendar (from 6:00 to 22:00)
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6);
const HOUR_HEIGHT = 60; // Height in pixels for each hour slot

export const CalendarView = ({ servizi, users, onNavigateToDetail, allServizi }: CalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
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
        .from('servizi_passeggeri')
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
  const getServizioPosition = (servizio: any) => {
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
        <CalendarHeader 
          currentDate={currentDate}
          viewMode={viewMode}
          setViewMode={setViewMode}
          goToPreviousPeriod={goToPreviousPeriod}
          goToNextPeriod={goToNextPeriod}
          goToToday={goToToday}
          formatViewPeriod={formatViewPeriod}
        />

        <CalendarLegend />

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
      <CalendarHeader 
        currentDate={currentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        goToPreviousPeriod={goToPreviousPeriod}
        goToNextPeriod={goToNextPeriod}
        goToToday={goToToday}
        formatViewPeriod={formatViewPeriod}
      />
      
      <CalendarLegend />
      
      <CalendarGrid 
        viewMode={viewMode}
        daysInView={daysInView}
        hours={HOURS}
        serviziInView={serviziInView}
        getServizioPosition={getServizioPosition}
        onNavigateToDetail={onNavigateToDetail}
        getAziendaName={getAziendaName}
      />
      
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
