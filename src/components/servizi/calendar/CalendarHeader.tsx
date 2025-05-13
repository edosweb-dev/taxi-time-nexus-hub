
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChevronLeft, ChevronRight, TableIcon } from "lucide-react";
import { CalendarHeaderProps } from "./types";

export const CalendarHeader = ({
  currentDate,
  viewMode,
  setViewMode,
  goToPreviousPeriod,
  goToNextPeriod,
  goToToday,
  formatViewPeriod
}: CalendarHeaderProps) => {
  return (
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
        </div>
        
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as any)}>
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
  );
};
