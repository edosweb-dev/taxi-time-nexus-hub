import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { ServizioWithRelations } from '@/lib/api/dipendente/servizi';
import { ServizioCard } from '../ServizioCard';
import { Calendar } from 'lucide-react';

interface AgendaDayProps {
  date: Date | null;
  servizi: ServizioWithRelations[];
  onClose: () => void;
  onServizioClick: (id: string) => void;
  onCompleta?: (id: string) => void;
  isMobile: boolean;
}

export function AgendaDay({ date, servizi, onClose, onServizioClick, onCompleta, isMobile }: AgendaDayProps) {
  if (!date) return null;

  const content = (
    <div className="space-y-4">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {format(date, 'EEEE d MMMM yyyy', { locale: it })}
        </SheetTitle>
      </SheetHeader>
      
      {servizi.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nessun servizio in questa data
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {servizi.length} {servizi.length === 1 ? 'servizio' : 'servizi'}
          </p>
          {servizi.map(servizio => (
            <ServizioCard 
              key={servizio.id}
              servizio={servizio}
              onViewDetails={onServizioClick}
              onCompleta={onCompleta}
            />
          ))}
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={!!date} onOpenChange={() => onClose()}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: render inline
  return (
    <div className="bg-card border rounded-lg p-6">
      {content}
    </div>
  );
}
