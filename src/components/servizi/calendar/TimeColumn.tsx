
import { TimeColumnProps } from "./types";

export const TimeColumn = ({ hours }: TimeColumnProps) => {
  return (
    <div className="w-16 flex-shrink-0 border-r">
      {/* Time header - empty cell */}
      <div className="h-10 border-b bg-muted/50" />
      
      {/* Time slots */}
      {hours.map((hour) => (
        <div 
          key={hour} 
          className="h-[60px] border-b flex flex-col justify-start items-center text-xs text-muted-foreground pt-0.5"
        >
          <span>{hour}:00</span>
        </div>
      ))}
    </div>
  );
};
