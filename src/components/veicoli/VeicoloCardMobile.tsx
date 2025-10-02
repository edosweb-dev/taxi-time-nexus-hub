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
    <Card className="p-4 border border-border rounded-lg shadow-sm">
      <div className="space-y-3">
        {/* Header: Status + Actions */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={veicolo.attivo ? 'default' : 'secondary'}
            className={cn(
              "px-2 py-0.5 text-xs font-semibold rounded-md",
              veicolo.attivo 
                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400"
            )}
          >
            {veicolo.attivo ? 'ATTIVO' : 'INATTIVO'}
          </Badge>
          
          <div className="flex gap-1.5">
            <Button 
              size="icon" 
              variant="outline"
              onClick={() => onEdit(veicolo)}
              className="h-8 w-8 rounded-md border-border hover:border-primary/40"
              aria-label={`Modifica veicolo ${veicolo.targa}`}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
            {veicolo.attivo && (
              <Button 
                size="icon" 
                variant="outline"
                onClick={() => onDelete(veicolo)}
                className="h-8 w-8 rounded-md border-border hover:border-destructive/40 hover:text-destructive"
                aria-label={`Elimina veicolo ${veicolo.targa}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Primary Info: Targa + Modello */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base font-mono tracking-wider text-foreground">
              {veicolo.targa}
            </h3>
            {veicolo.anno && (
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground">Anno</span>
                <p className="text-xs font-semibold text-foreground">{veicolo.anno}</p>
              </div>
            )}
          </div>
          
          <div>
            <p className="text-sm font-semibold text-foreground">{veicolo.modello}</p>
          </div>
        </div>

        {/* Secondary Info: Posti + Colore */}
        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 rounded-md dark:bg-blue-900/30">
              <Users className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground">Posti</span>
              <p className="text-xs font-semibold text-foreground">{veicolo.numero_posti || '-'}</p>
            </div>
          </div>
          
          {veicolo.colore && (
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 rounded-md dark:bg-purple-900/30">
                <div 
                  className="w-3.5 h-3.5 rounded-full border border-border/50"
                  style={{ backgroundColor: veicolo.colore.toLowerCase() }}
                />
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground">Colore</span>
                <p className="text-xs font-semibold text-foreground capitalize">{veicolo.colore}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes indicator if present */}
        {veicolo.note && (
          <div className="pt-2 border-t border-border/50">
            <span className="text-[10px] text-muted-foreground">Note</span>
            <p className="text-xs text-foreground mt-0.5 line-clamp-2">
              {veicolo.note}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
