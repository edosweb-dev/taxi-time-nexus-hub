
import { Shift } from "../types";

interface ShiftEventProps {
  shift: Shift;
  top: number;
  height: number;
  spanRows: boolean;
  onClick: () => void;
}

// Define color classes for each shift type
export const getShiftTypeColor = (type: string, halfDayType?: string) => {
  switch (type) {
    case 'specific_hours':
      return "bg-primary/80 hover:bg-primary text-primary-foreground";
    case 'full_day':
      return "bg-green-400/90 hover:bg-green-500/90 text-green-950";
    case 'half_day':
      return "bg-blue-400/90 hover:bg-blue-500/90 text-blue-950";
    case 'sick_leave':
      return "bg-red-400/90 hover:bg-red-500/90 text-red-950";
    case 'unavailable':
      return "bg-amber-400/90 hover:bg-amber-500/90 text-amber-950";
    default:
      return "bg-slate-400/90 hover:bg-slate-500/90 text-slate-950";
  }
};

export const ShiftEvent = ({ shift, top, height, spanRows, onClick }: ShiftEventProps) => {
  const colorClass = getShiftTypeColor(shift.shift_type, shift.half_day_type);
  
  const getShiftTitle = () => {
    if (shift.shift_type === 'specific_hours' && shift.start_time && shift.end_time) {
      return `${shift.start_time.substring(0, 5)}-${shift.end_time.substring(0, 5)}`;
    } else if (shift.shift_type === 'half_day') {
      return shift.half_day_type === 'morning' ? 'Mattina' : 'Pomeriggio';
    } else if (shift.shift_type === 'full_day') {
      return 'Giornata intera';
    } else if (shift.shift_type === 'sick_leave') {
      return 'Malattia';
    } else {
      return 'Non disponibile';
    }
  };
  
  return (
    <div 
      className={`absolute left-1 right-1 ${colorClass} rounded px-2 py-1 overflow-hidden cursor-pointer transition-colors shadow-sm z-20 ${spanRows ? "left-0 right-0 flex items-center justify-center" : ""}`}
      style={{ 
        top: `${top}px`, 
        height: `${height}px`,
      }}
      onClick={onClick}
    >
      <div className="font-medium text-xs truncate">
        {getShiftTitle()}
      </div>
      {shift.user_first_name && shift.user_last_name && (
        <div className="text-xs truncate">
          {shift.user_first_name} {shift.user_last_name}
        </div>
      )}
      {shift.note && (
        <div className="text-xs truncate">
          {shift.note}
        </div>
      )}
    </div>
  );
};
