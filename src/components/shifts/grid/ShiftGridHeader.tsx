import { format, getDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ShiftGridHeaderProps {
  monthDays: Date[];
}

export function ShiftGridHeader({ monthDays }: ShiftGridHeaderProps) {
  const weekDays = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];
  
  return (
    <div className="grid grid-cols-[200px_1fr] bg-red-500 text-white">
      {/* Employee column header */}
      <div className="p-3 border-r border-red-400 font-semibold text-center">
        DIPENDENTE
      </div>
      
      {/* Days grid header */}
      <div className="grid" style={{ gridTemplateColumns: `repeat(${monthDays.length}, 1fr)` }}>
        {monthDays.map((day, index) => {
          const dayOfWeek = getDay(day);
          const adjustedDayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert Sunday from 0 to 6
          const isWeekend = adjustedDayOfWeek >= 5; // Saturday (5) and Sunday (6)
          
          return (
            <div
              key={index}
              className={cn(
                "p-2 border-r border-red-400 text-center",
                "flex flex-col items-center justify-center min-h-[60px]",
                isWeekend && "bg-red-400"
              )}
            >
              <div className="text-xs font-medium">
                {weekDays[adjustedDayOfWeek]}
              </div>
              <div className="text-lg font-bold">
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}