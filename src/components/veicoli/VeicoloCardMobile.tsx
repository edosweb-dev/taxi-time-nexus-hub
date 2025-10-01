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
    <Card className="p-5 border-border rounded-xl hover:shadow-lg transition-all duration-200 active:scale-[0.99]">
      {/* Header: Status + Actions */}
      <div className="flex items-center justify-between mb-4">
        <Badge 
          variant={veicolo.attivo ? 'default' : 'secondary'}
          className={cn(
            "text-xs font-medium px-3 py-1.5",
            veicolo.attivo ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""
          )}
        >
          {veicolo.attivo ? 'ATTIVO' : 'INATTIVO'}
        </Badge>
        
        <div className="flex gap-3">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onEdit(veicolo)}
            className="h-11 w-11 hover:bg-muted transition-colors"
            aria-label={`Modifica veicolo ${veicolo.targa}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {veicolo.attivo && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onDelete(veicolo)}
              className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label={`Elimina veicolo ${veicolo.targa}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Primary Info: Targa + Modello */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-xl font-mono tracking-wider text-foreground">
            {veicolo.targa}
          </h3>
          {veicolo.anno && (
            <div className="flex items-center gap-1.5 text-base text-muted-foreground font-medium">
              <Calendar className="h-4 w-4" />
              <span>{veicolo.anno}</span>
            </div>
          )}
        </div>
        
        <p className="text-lg font-medium text-foreground">
          {veicolo.modello}
        </p>
      </div>

      {/* Secondary Info: Posti + Colore */}
      <div className="flex items-center justify-between pt-4 border-t border-border/50 text-base">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-muted-foreground" />
          <span>
            <span className="font-medium text-foreground">{veicolo.numero_posti || '-'}</span>
            <span className="text-muted-foreground"> posti</span>
          </span>
        </div>
        
        {veicolo.colore && (
          <div className="flex items-center gap-2">
            <div 
              className="w-5 h-5 rounded-full border-2 border-border shadow-sm"
              style={{ backgroundColor: veicolo.colore.toLowerCase() }}
            />
            <span className="text-foreground font-medium capitalize">{veicolo.colore}</span>
          </div>
        )}
      </div>

      {/* Notes indicator if present */}
      {veicolo.note && (
        <div className="mt-4 pt-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {veicolo.note}
          </p>
        </div>
      )}
    </Card>
  );
}
