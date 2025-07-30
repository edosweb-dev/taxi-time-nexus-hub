
import { cn } from "@/lib/utils";
import { Shift } from "../types";
import { getShiftTypeIcon } from "../utils/shiftDisplayUtils";
import { getUserDisplayName } from "../utils/userDisplayUtils";
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
  const { users } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });
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

  const userDisplayName = getUserDisplayName(shift);

  console.log(`[ShiftEvent] Rendering shift ${shift.id} - User: ${userDisplayName}`);

  return (
    <div
      className={cn(
        "absolute left-0 right-0 z-5 mx-1 rounded border p-1 text-xs overflow-hidden cursor-pointer transition-colors hover:opacity-90 hover:z-10",
        {
          "bg-green-400/90 text-green-950 border-green-400": getVariant() === "success",
          "bg-secondary text-secondary-foreground border-secondary": getVariant() === "secondary",
          "bg-destructive text-destructive-foreground border-destructive": getVariant() === "destructive",
          "bg-background border-muted-foreground/50 text-muted-foreground": getVariant() === "outline",
          "bg-primary text-primary-foreground border-primary": getVariant() === "default",
          "z-15": spanRows,
          [userColorClass]: userColorClass !== ""
        }
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        minHeight: "28px", // Increased minimum height to better accommodate text
        maxHeight: spanRows ? "auto" : undefined
      }}
      onClick={onClick}
    >
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1">
          {getShiftTypeIcon(shift.shift_type)}
          <span className="font-medium text-xs leading-tight">
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
        
        {/* Always show user name with better styling */}
        <div className="text-xs font-semibold truncate leading-tight bg-black/5 px-1 py-0.5 rounded">
          {userDisplayName}
        </div>
        
        {shift.notes && (
          <div className="text-xs truncate leading-tight opacity-80">
            {shift.notes}
          </div>
        )}
      </div>
    </div>
  );
};
