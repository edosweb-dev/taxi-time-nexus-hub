import { format, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ShiftGridHeaderProps {
  monthDays: Date[];
}

export function ShiftGridHeader({ monthDays }: ShiftGridHeaderProps) {
  const weekDays = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  
  return (
    <div className="grid grid-cols-[180px_1fr] bg-primary text-primary-foreground sticky top-0 z-30">
      {/* Compact Employee column header */}
      <div className="px-3 py-2 border-r border-primary-foreground/20 font-semibold text-center bg-primary">
        <div className="text-xs font-bold tracking-wide">
          DIPENDENTI
        </div>
      </div>
      
      {/* Compact Days grid header */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${monthDays.length}, minmax(45px, 1fr))` }}>
        {monthDays.map((day, index) => {
          const dayOfWeek = getDay(day);
          const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
          const isWeekend = adjustedDayOfWeek >= 5;
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div
              key={index}
              className={cn(
                "px-1 py-2 border-r border-primary-foreground/20 text-center",
                "flex flex-col items-center justify-center min-h-[50px]",
                "transition-colors duration-200",
                isWeekend && "bg-primary-foreground/10",
                isToday && "bg-accent text-accent-foreground font-bold"
              )}
            >
              <div className="text-xs font-medium opacity-90">
                {weekDays[adjustedDayOfWeek]}
              </div>
              <div className={cn(
                "text-sm font-bold",
                isToday && "bg-accent-foreground text-accent rounded-full w-6 h-6 flex items-center justify-center text-xs"
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