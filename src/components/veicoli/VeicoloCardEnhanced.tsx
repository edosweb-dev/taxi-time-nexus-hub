import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Users, Calendar } from 'lucide-react';
import { Veicolo } from '@/lib/types/veicoli';
import { cn } from '@/lib/utils';
import { VeicoloActions } from './VeicoloActions';

interface VeicoloCardEnhancedProps {
  veicolo: Veicolo;
  onEdit: (veicolo: Veicolo) => void;
}

export function VeicoloCardEnhanced({ 
  veicolo, 
  onEdit,
}: VeicoloCardEnhancedProps) {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    // Evita navigazione se click su bottoni
    if ((e.target as HTMLElement).closest('button')) return;
    navigate(`/veicoli/${veicolo.id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      className={cn(
        "overflow-hidden border-0 bg-card cursor-pointer",
        "shadow-sm hover:shadow-md transition-shadow duration-200",
        !veicolo.attivo && "bg-muted/50"
      )}
    >
      {/* Status indicator bar */}
      <div className={cn(
        "h-1 w-full",
        veicolo.attivo ? "bg-green-500" : "bg-muted-foreground/30"
      )} />
      
      <div className="p-3">
        {/* Main row: Model + Plate + Status */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className={cn("flex-1 min-w-0", !veicolo.attivo && "opacity-70")}>
            <h3 className="text-base font-semibold text-foreground truncate leading-tight">
              {veicolo.modello}
            </h3>
            <p className="text-sm font-mono font-medium text-primary tracking-wide">
              {veicolo.targa}
            </p>
          </div>
          
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0",
            veicolo.attivo 
              ? "bg-green-500/15 text-green-700 dark:text-green-400" 
              : "bg-muted text-muted-foreground"
          )}>
            {veicolo.attivo ? 'Attivo' : 'Inattivo'}
          </span>
        </div>

        {/* Info chips row */}
        <div className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3",
          !veicolo.attivo && "opacity-70"
        )}>
          {veicolo.anno && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {veicolo.anno}
            </span>
          )}
          
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {veicolo.numero_posti || '-'} posti
          </span>
          
          {veicolo.colore && (
            <span className="flex items-center gap-1">
              <div 
                className="w-2.5 h-2.5 rounded-full ring-1 ring-border"
                style={{ backgroundColor: veicolo.colore.toLowerCase() }}
              />
              {veicolo.colore}
            </span>
          )}
        </div>

        {/* Notes - if present */}
        {veicolo.note && (
          <p className={cn(
            "text-xs text-muted-foreground line-clamp-1 mb-3 italic",
            !veicolo.attivo && "opacity-70"
          )}>
            {veicolo.note}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={() => onEdit(veicolo)}
            variant="ghost"
            size="sm"
            className="flex-1 h-9 text-xs font-medium bg-muted/50 hover:bg-muted"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Modifica
          </Button>
          
          <VeicoloActions veicolo={veicolo} onEdit={onEdit} variant="mobile" />
        </div>
      </div>
    </Card>
  );
}
