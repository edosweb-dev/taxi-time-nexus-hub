
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Calendar, CalendarCheck, CalendarDays } from "lucide-react";

interface ViewFilterDropdownProps {
  viewMode: "month" | "week" | "day";
  onViewModeChange: (mode: "month" | "week" | "day") => void;
}

export function ViewFilterDropdown({ viewMode, onViewModeChange }: ViewFilterDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {viewMode === "month" && <CalendarDays className="h-4 w-4 mr-2" />}
          {viewMode === "week" && <Calendar className="h-4 w-4 mr-2" />}
          {viewMode === "day" && <CalendarCheck className="h-4 w-4 mr-2" />}
          {viewMode === "month" ? "Mese" : viewMode === "week" ? "Settimana" : "Giorno"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background border shadow-lg z-50">
        <DropdownMenuRadioGroup value={viewMode} onValueChange={(value) => onViewModeChange(value as "month" | "week" | "day")}>
          <DropdownMenuRadioItem value="month">
            <CalendarDays className="h-4 w-4 mr-2" />
            Mese
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="week">
            <Calendar className="h-4 w-4 mr-2" />
            Settimana
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="day">
            <CalendarCheck className="h-4 w-4 mr-2" />
            Giorno
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
