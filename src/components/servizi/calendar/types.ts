
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";

export type ViewMode = "week" | "day" | "table";

export interface CalendarViewProps {
  servizi: Servizio[];
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
  allServizi: Servizio[];
}

export interface CalendarHeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  goToPreviousPeriod: () => void;
  goToNextPeriod: () => void;
  goToToday: () => void;
  formatViewPeriod: () => string;
}

export interface CalendarEventProps {
  servizio: Servizio;
  top: number;
  height: number;
  onClick: () => void;
  aziendaName: string;
}

export interface TimeColumnProps {
  hours: number[];
}

export interface DayColumnProps {
  day: Date;
  serviziOfDay: Servizio[];
  getServizioPosition: (servizio: Servizio) => { top: number; height: number };
  onNavigateToDetail: (id: string) => void;
  getAziendaName: (aziendaId?: string) => string;
}

export interface CalendarGridProps {
  viewMode: ViewMode;
  daysInView: Date[];
  hours: number[];
  serviziInView: Servizio[];
  getServizioPosition: (servizio: Servizio) => { top: number; height: number };
  onNavigateToDetail: (id: string) => void;
  getAziendaName: (aziendaId?: string) => string;
}
