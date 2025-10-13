import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isPast, isSameMonth } from 'date-fns';
import { it } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { ServizioWithRelations } from '@/lib/api/dipendente/servizi';
import { getServiziByDay } from '@/hooks/dipendente/useServiziAgenda';

interface AgendaCalendarProps {
  date: Date;
  servizi: ServizioWithRelations[];
  onDayClick: (date: Date) => void;
  selectedDay?: Date | null;
}

function generateCalendarDays(month: number, year: number): Date[] {
  const firstDay = startOfMonth(new Date(year, month - 1));
  const lastDay = endOfMonth(firstDay);
  const startDate = startOfWeek(firstDay, { weekStartsOn: 1 }); // Lunedì
  const endDate = endOfWeek(lastDay, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start: startDate, end: endDate });
}

export function AgendaCalendar({ date, servizi, onDayClick, selectedDay }: AgendaCalendarProps) {
  const calendarDays = generateCalendarDays(date.getMonth() + 1, date.getFullYear());
  const today = new Date();

  return (
    <div className="bg-card rounded-lg border overflow-hidden">
      {/* Header giorni settimana */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold">
            {day}
          </div>
        ))}
      </div>
      
      {/* Celle giorni */}
      <div className="grid grid-cols-7 gap-px bg-border">
        {calendarDays.map(day => {
          const serviziGiorno = getServiziByDay(servizi, day);
          const isToday = isSameDay(day, today);
          const isPastDay = isPast(day) && !isToday;
          const isCurrentMonth = isSameMonth(day, date);
          const isSelected = selectedDay && isSameDay(day, selectedDay);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[80px] p-2 bg-card hover:bg-accent transition-colors flex flex-col",
                isPastDay && "opacity-60",
                !isCurrentMonth && "text-muted-foreground bg-muted/30",
                isSelected && "ring-2 ring-primary ring-inset"
              )}
            >
              {/* Numero giorno */}
              <div className={cn(
                "text-sm font-medium mb-1",
                isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
              )}>
                {format(day, 'd')}
              </div>
              
              {/* Indicator servizi */}
              {serviziGiorno.length > 0 && (
                <div className="mt-auto space-y-1">
                  {serviziGiorno.slice(0, 3).map(servizio => (
                    <div 
                      key={servizio.id}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate",
                        servizio.stato === 'assegnato' && "bg-yellow-100 text-yellow-800",
                        servizio.stato === 'completato' && "bg-green-100 text-green-800",
                        servizio.stato === 'consuntivato' && "bg-blue-100 text-blue-800"
                      )}
                      title={`${servizio.orario_servizio} - ${servizio.azienda_nome}`}
                    >
                      {servizio.orario_servizio}
                    </div>
                  ))}
                  {serviziGiorno.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{serviziGiorno.length - 3}
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
