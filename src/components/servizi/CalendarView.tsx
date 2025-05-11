
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Layout, Table as TableIcon } from "lucide-react";
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { cn, formatDate } from '@/lib/utils';
import { addDays } from 'date-fns';
import { it } from 'date-fns/locale';
import { ServizioCard } from './ServizioCard';
import { ServizioTable } from './ServizioTable';

interface CalendarViewProps {
  servizi: Servizio[];
  users: Profile[];
  onNavigateToDetail: (id: string) => void;
}

export function CalendarView({ servizi, users, onNavigateToDetail }: CalendarViewProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  
  // Get servizi for the selected date
  const serviziByDate = servizi.filter(servizio => {
    return servizio.data_servizio === formatDate(date, "yyyy-MM-dd");
  });
  
  // Calculate dates with servizi for the calendar highlight
  const datesWithServizi = servizi.reduce((acc: Date[], servizio) => {
    const serviceDate = new Date(servizio.data_servizio);
    // Check if date already exists in accumulator to avoid duplicates
    if (!acc.some(d => d.toDateString() === serviceDate.toDateString())) {
      acc.push(serviceDate);
    }
    return acc;
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-1">
        <CardContent className="p-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={date => date && setDate(date)}
            className="w-full"
            locale={it}
            modifiersStyles={{
              selected: {
                backgroundColor: 'var(--primary)',
                color: 'white'
              }
            }}
            modifiers={{
              hasServizio: datesWithServizi
            }}
            modifiersClassNames={{
              hasServizio: "bg-amber-100 text-amber-900 font-medium"
            }}
            components={{
              DayContent: (props) => (
                <div className="relative">
                  {props.children}
                  {servizi.filter(s => s.data_servizio === formatDate(props.date, "yyyy-MM-dd")).length > 0 && (
                    <Badge variant="outline" className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs px-1 py-0 h-4 bg-amber-100 text-amber-900 hover:bg-amber-100">
                      {servizi.filter(s => s.data_servizio === formatDate(props.date, "yyyy-MM-dd")).length}
                    </Badge>
                  )}
                </div>
              )
            }}
          />
        </CardContent>
      </Card>
      
      <div className="md:col-span-2 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">
            Servizi per il {formatDate(date, 'dd MMMM yyyy')}
          </h3>
          
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "cards" | "table")}>
            <ToggleGroupItem value="cards" aria-label="Visualizza schede">
              <Layout className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Visualizza tabella">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        {serviziByDate.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">
                Nessun servizio in programma per {formatDate(date, 'dd MMMM yyyy')}
              </p>
            </CardContent>
          </Card>
        ) : (
          viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {serviziByDate.map((servizio) => (
                <ServizioCard
                  key={servizio.id}
                  servizio={servizio}
                  users={users}
                  onSelectServizio={() => {}}
                  onNavigateToDetail={onNavigateToDetail}
                  isAdminOrSocio={false}
                />
              ))}
            </div>
          ) : (
            <ServizioTable
              servizi={serviziByDate}
              users={users}
              onNavigateToDetail={onNavigateToDetail}
            />
          )
        )}
      </div>
    </div>
  );
}
