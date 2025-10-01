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
    <Card className="p-4 border-border rounded-lg hover:shadow-md transition-shadow">
      {/* Header: Status + Actions */}
      <div className="flex items-center justify-between mb-3">
        <Badge 
          variant={veicolo.attivo ? 'default' : 'secondary'}
          className={cn(
            "text-xs font-medium px-3 py-1",
            veicolo.attivo ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : ""
          )}
        >
          {veicolo.attivo ? 'ATTIVO' : 'INATTIVO'}
        </Badge>
        
        <div className="flex gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            onClick={() => onEdit(veicolo)}
            className="h-10 w-10" // Touch-friendly 44px+
          >
            <Edit className="h-4 w-4" />
          </Button>
          {veicolo.attivo && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => onDelete(veicolo)}
              className="h-10 w-10 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Primary Info: Targa + Modello */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg font-mono tracking-wider text-foreground">
            {veicolo.targa}
          </h3>
          {veicolo.anno && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{veicolo.anno}</span>
            </div>
          )}
        </div>
        
        <p className="text-base font-medium text-foreground">
          {veicolo.modello}
        </p>
      </div>

      {/* Secondary Info: Posti + Colore */}
      <div className="flex items-center justify-between pt-3 border-t border-border text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{veicolo.numero_posti || '-'} posti</span>
        </div>
        
        {veicolo.colore && (
          <div className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded-full border-2 border-border"
              style={{ backgroundColor: veicolo.colore.toLowerCase() }}
            />
            <span className="text-muted-foreground capitalize">{veicolo.colore}</span>
          </div>
        )}
      </div>

      {/* Notes indicator if present */}
      {veicolo.note && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {veicolo.note}
          </p>
        </div>
      )}
    </Card>
  );
}
