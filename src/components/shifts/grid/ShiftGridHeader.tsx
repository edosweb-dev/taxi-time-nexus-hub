import { format, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ShiftGridHeaderProps {
  monthDays: Date[];
}

export function ShiftGridHeader({ monthDays }: ShiftGridHeaderProps) {
  const weekDays = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  
  return (
    <div className="grid grid-cols-[220px_1fr] bg-primary text-primary-foreground sticky top-0 z-30">
      {/* Employee column header */}
      <div className="p-4 border-r border-primary-foreground/20 font-semibold text-center bg-primary">
        <div className="text-sm font-bold tracking-wide">
          DIPENDENTI
        </div>
      </div>
      
      {/* Days grid header */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${monthDays.length}, 1fr)` }}>
        {monthDays.map((day, index) => {
          const dayOfWeek = getDay(day);
          const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday from 0 to 6
          const isWeekend = adjustedDayOfWeek >= 5; // Saturday (5) and Sunday (6)
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div
              key={index}
              className={cn(
                "p-3 border-r border-primary-foreground/20 text-center",
                "flex flex-col items-center justify-center min-h-[70px]",
                "transition-colors duration-200",
                isWeekend && "bg-primary-foreground/10",
                isToday && "bg-accent text-accent-foreground font-bold"
              )}
            >
              <div className="text-xs font-medium opacity-90">
                {weekDays[adjustedDayOfWeek]}
              </div>
              <div className={cn(
                "text-lg font-bold",
                isToday && "bg-accent-foreground text-accent rounded-full w-7 h-7 flex items-center justify-center"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}