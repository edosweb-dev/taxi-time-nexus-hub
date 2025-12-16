import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Power, Users, Calendar } from 'lucide-react';
import { Veicolo } from '@/lib/types/veicoli';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface VeicoloCardEnhancedProps {
  veicolo: Veicolo;
  onEdit: (veicolo: Veicolo) => void;
  onToggleStatus: (veicolo: Veicolo) => void;
}

export function VeicoloCardEnhanced({ 
  veicolo, 
  onEdit, 
  onToggleStatus 
}: VeicoloCardEnhancedProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const startX = touch.clientX;
    // Simplified swipe detection - can be enhanced
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setSwipeOffset(0);
  };

  return (
    <Card 
      className={cn(
        "p-4 border border-border rounded-xl shadow-sm",
        "transition-all duration-200",
        "active:scale-[0.98]"
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="space-y-3">
        {/* Header: Status Badge */}
        <div className="flex items-center justify-between">
          <Badge 
            variant={veicolo.attivo ? 'default' : 'secondary'}
            className={cn(
              "px-2 py-0.5 text-xs font-semibold rounded-md",
              veicolo.attivo 
                ? "bg-green-500/10 text-green-700 border border-green-500/30 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500/50" 
                : "bg-gray-500/10 text-gray-700 border border-gray-500/30 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-500/50"
            )}
          >
            {veicolo.attivo ? '● ATTIVO' : '○ INATTIVO'}
          </Badge>
        </div>

        {/* Primary Info: Targa (large, prominent) */}
        <div className="space-y-0.5">
          <h3 className="text-xl font-bold text-foreground leading-tight">
            {veicolo.modello}
          </h3>
          <p className="text-sm font-mono font-semibold text-muted-foreground uppercase tracking-wide">
            {veicolo.targa}
          </p>
        </div>

        {/* Secondary Info - Compact inline */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border/50">
          {veicolo.anno && (
            <div className="flex items-center gap-1.5 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-foreground">{veicolo.anno}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{veicolo.numero_posti || '-'} posti</span>
          </div>
          
          {veicolo.colore && (
            <div className="flex items-center gap-1.5 text-sm">
              <div 
                className="w-3.5 h-3.5 rounded-full border border-border"
                style={{ backgroundColor: veicolo.colore.toLowerCase() }}
              />
              <span className="font-medium text-foreground capitalize">{veicolo.colore}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        {veicolo.note && (
          <p className="text-xs text-muted-foreground line-clamp-2 pt-2 border-t border-border/50">
            {veicolo.note}
          </p>
        )}

        {/* Action Buttons - Compact */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onEdit(veicolo)}
            variant="outline"
            size="sm"
            className="flex-1 h-10 text-sm font-medium"
          >
            <Edit className="h-4 w-4 mr-1.5" />
            Modifica
          </Button>
          
          <Button
            onClick={() => onToggleStatus(veicolo)}
            variant={veicolo.attivo ? 'outline' : 'default'}
            size="sm"
            className={cn(
              "flex-1 h-10 text-sm font-medium",
              veicolo.attivo 
                ? "text-amber-600 border-amber-300 hover:bg-amber-50 dark:text-amber-400 dark:border-amber-600 dark:hover:bg-amber-950" 
                : "bg-green-600 text-white hover:bg-green-700"
            )}
          >
            <Power className="h-4 w-4 mr-1.5" />
            {veicolo.attivo ? 'Disattiva' : 'Attiva'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
