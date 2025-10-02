import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Power, Users, Calendar, Palette } from 'lucide-react';
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
        "p-6 border-2 border-border rounded-xl shadow-sm",
        "mx-4 my-3", // 16px margin laterale, 12px verticale
        "transition-all duration-200",
        "active:scale-[0.98]"
      )}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="space-y-4">
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
        <div className="space-y-2">
          <h3 className="text-2xl font-black font-mono tracking-wider text-foreground uppercase">
            {veicolo.targa}
          </h3>
          <p className="text-lg font-semibold text-foreground">
            {veicolo.modello}
          </p>
        </div>

        {/* Secondary Info Grid - Icons 20px */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t-2 border-border/50">
          {veicolo.anno && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Anno</span>
                <p className="text-sm font-bold text-foreground">{veicolo.anno}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <span className="text-xs text-muted-foreground font-medium">Posti</span>
              <p className="text-sm font-bold text-foreground">{veicolo.numero_posti || '-'}</p>
            </div>
          </div>
          
          {veicolo.colore && (
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Palette className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Colore</span>
                <p className="text-sm font-bold text-foreground capitalize">{veicolo.colore}</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {veicolo.note && (
          <div className="pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground font-medium">Note</span>
            <p className="text-sm text-foreground mt-1 line-clamp-2">
              {veicolo.note}
            </p>
          </div>
        )}

        {/* Action Buttons - 48px height (touch compliant) */}
        <div className="flex gap-3 pt-2">
          <Button
            onClick={() => onEdit(veicolo)}
            variant="outline"
            className={cn(
              "flex-1 h-12 text-base font-semibold",
              "border-2 border-primary/30 text-primary",
              "hover:bg-primary hover:text-primary-foreground",
              "active:scale-95 transition-transform"
            )}
          >
            <Edit className="h-5 w-5 mr-2" />
            Modifica
          </Button>
          
          <Button
            onClick={() => onToggleStatus(veicolo)}
            variant={veicolo.attivo ? 'outline' : 'default'}
            className={cn(
              "flex-1 h-12 text-base font-semibold",
              veicolo.attivo 
                ? "border-2 border-amber-500/30 text-amber-600 hover:bg-amber-500 hover:text-white dark:text-amber-400" 
                : "border-2 border-green-500/30 bg-green-500 text-white hover:bg-green-600",
              "active:scale-95 transition-transform"
            )}
          >
            <Power className="h-5 w-5 mr-2" />
            {veicolo.attivo ? 'Disattiva' : 'Attiva'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
