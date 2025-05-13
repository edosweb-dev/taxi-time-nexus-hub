
import { cn } from "@/lib/utils";
import { Shift } from "../types";
import { getShiftTypeIcon } from "../utils/shiftDisplayUtils";
import { useUsers } from "@/hooks/useUsers";
import { useEffect, useState } from "react";
import { getUserColorClass } from "../filters/UserFilterDropdown";

interface ShiftEventProps {
  shift: Shift;
  top: number;
  height: number;
  spanRows: boolean;
  onClick: () => void;
}

export const ShiftEvent = ({
  shift,
  top,
  height,
  spanRows,
  onClick
}: ShiftEventProps) => {
  const { users } = useUsers();
  const [userColorClass, setUserColorClass] = useState("");

  useEffect(() => {
    if (users && users.length) {
      setUserColorClass(getUserColorClass(users, shift.user_id));
    }
  }, [users, shift.user_id]);

  // Determine variant based on shift type
  const getVariant = () => {
    switch (shift.shift_type) {
      case "full_day":
        return "success";
      case "half_day":
        return "secondary";
      case "sick_leave":
        return "destructive";
      case "unavailable":
        return "outline";
      case "specific_hours":
        return "default";
      default:
        return "default";
    }
  };

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-10 mx-1 rounded-md border p-1 text-xs overflow-hidden cursor-pointer transition-shadow hover:shadow-md",
        {
          "bg-green-400/90 text-green-950 border-green-500": getVariant() === "success",
          "bg-secondary text-secondary-foreground border-secondary": getVariant() === "secondary",
          "bg-destructive text-destructive-foreground border-destructive/30": getVariant() === "destructive",
          "bg-background border-muted-foreground/50 text-muted-foreground": getVariant() === "outline",
          "bg-primary text-primary-foreground border-primary": getVariant() === "default",
          "z-20": spanRows,
          [userColorClass]: userColorClass !== ""
        }
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        minHeight: "20px",
        maxHeight: spanRows ? "auto" : undefined
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-1">
        {getShiftTypeIcon(shift.shift_type)}
        <span className="font-medium">
          {shift.start_time && shift.end_time
            ? `${shift.start_time.substring(0, 5)}-${shift.end_time.substring(0, 5)}`
            : shift.shift_type === 'half_day'
            ? shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio'
            : shift.shift_type === 'full_day' ? 'Giornata intera'
            : shift.shift_type === 'sick_leave' ? 'Malattia'
            : 'Non disponibile'
          }
        </span>
      </div>
      
      {shift.user_first_name && (
        <div className="text-xs font-medium truncate">
          {shift.user_first_name} {shift.user_last_name}
        </div>
      )}
      
      {shift.notes && (
        <div className="text-xs truncate">
          {shift.notes}
        </div>
      )}
    </div>
  );
};
