import React from 'react';
import { StatoServizio } from '@/lib/types/servizi';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ServicesTabsProps {
  statusCounts: Record<StatoServizio, number>;
  activeTab: StatoServizio;
  onTabChange: (status: StatoServizio) => void;
}

const statusLabels: Record<StatoServizio, string> = {
  da_assegnare: 'Da Assegnare',
  assegnato: 'Assegnati',
  completato: 'Completati',
  consuntivato: 'Consuntivati',
  annullato: 'Annullati',
  non_accettato: 'Non Accettati'
};

const statusOrder: StatoServizio[] = [
  'da_assegnare',
  'assegnato',
  'completato',
  'consuntivato',
  'annullato',
  'non_accettato'
];

export function ServicesTabs({ statusCounts, activeTab, onTabChange }: ServicesTabsProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex p-1 gap-2 min-w-max">
        {statusOrder.map((status) => {
          const count = statusCounts[status] || 0;
          
          return (
            <button
              key={status}
              onClick={() => onTabChange(status)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border",
                activeTab === status
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <span>{statusLabels[status]}</span>
              {count > 0 && (
                <Badge 
                  variant={activeTab === status ? "secondary" : "outline"}
                  className={cn(
                    "text-xs px-2 py-0.5 min-w-[1.5rem] h-5 flex items-center justify-center",
                    activeTab === status
                      ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {count}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}