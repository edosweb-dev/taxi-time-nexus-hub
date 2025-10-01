import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Users, Calendar } from 'lucide-react';
import { Veicolo } from '@/lib/types/veicoli';
import { cn } from '@/lib/utils';

interface VeicoloCardMobileProps {
  veicolo: Veicolo;
  onEdit: (veicolo: Veicolo) => void;
  onDelete: (veicolo: Veicolo) => void;
}

export function VeicoloCardMobile({ veicolo, onEdit, onDelete }: VeicoloCardMobileProps) {
  return (
    <Card className="p-3 border-border rounded-lg hover:shadow-md transition-shadow">
      {/* Header: Status + Actions */}
      <div className="flex items-center justify-between mb-2">
        <Badge 
          variant={veicolo.attivo ? 'default' : 'secondary'}
          className={cn(
            "text-[10px] font-medium px-2 py-0.5",
            veicolo.attivo ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""
          )}
        >
          {veicolo.attivo ? 'ATTIVO' : 'INATTIVO'}
        </Badge>
        
        <div className="flex gap-1">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onEdit(veicolo)}
            className="h-8 w-8"
            aria-label={`Modifica veicolo ${veicolo.targa}`}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          {veicolo.attivo && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onDelete(veicolo)}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              aria-label={`Elimina veicolo ${veicolo.targa}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Primary Info: Targa + Modello */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base font-mono tracking-wider text-foreground">
            {veicolo.targa}
          </h3>
          {veicolo.anno && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{veicolo.anno}</span>
            </div>
          )}
        </div>
        
        <p className="text-sm font-medium text-foreground">
          {veicolo.modello}
        </p>
      </div>

      {/* Secondary Info: Posti + Colore */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-sm">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            <span className="font-medium text-foreground">{veicolo.numero_posti || '-'}</span>
            <span className="text-muted-foreground"> posti</span>
          </span>
        </div>
        
        {veicolo.colore && (
          <div className="flex items-center gap-1.5">
            <div 
              className="w-3.5 h-3.5 rounded-full border border-border"
              style={{ backgroundColor: veicolo.colore.toLowerCase() }}
            />
            <span className="text-foreground text-xs font-medium capitalize">{veicolo.colore}</span>
          </div>
        )}
      </div>

      {/* Notes indicator if present */}
      {veicolo.note && (
        <div className="mt-2 pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {veicolo.note}
          </p>
        </div>
      )}
    </Card>
  );
}
