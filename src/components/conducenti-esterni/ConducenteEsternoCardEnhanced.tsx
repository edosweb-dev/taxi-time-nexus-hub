import { useState } from 'react';
import { Mail, Phone, Pencil, UserX, RotateCcw } from 'lucide-react';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

interface ConducenteEsternoCardEnhancedProps {
  conducente: ConducenteEsterno;
  onEdit: (conducente: ConducenteEsterno) => void;
  onToggle: (conducente: ConducenteEsterno) => void;
  onCall?: (telefono: string) => void;
}

export function ConducenteEsternoCardEnhanced({
  conducente,
  onEdit,
  onToggle,
  onCall,
}: ConducenteEsternoCardEnhancedProps) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);

  const minSwipeDistance = 50;

  // Swipe gesture handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
    const distance = e.targetTouches[0].clientX - touchStart;
    // Limit swipe to max 120px in either direction
    setSwipeOffset(Math.max(-120, Math.min(120, distance)));
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe left → Toggle status (verde)
      onToggle(conducente);
    } else if (isRightSwipe) {
      // Swipe right → Edit (blu)
      onEdit(conducente);
    }
    
    // Reset swipe state
    setSwipeOffset(0);
    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Swipe Actions Background */}
      <div className="absolute inset-0 flex">
        {/* Left side - Edit (Blue) */}
        <div className="w-1/2 bg-blue-500 flex items-center justify-start pl-6">
          <Pencil className="w-6 h-6 text-white" />
          <span className="ml-2 text-white font-medium">Modifica</span>
        </div>
        {/* Right side - Toggle (Green) */}
        <div className="w-1/2 bg-emerald-500 flex items-center justify-end pr-6">
          <span className="mr-2 text-white font-medium">
            {conducente.attivo ? 'Disattiva' : 'Attiva'}
          </span>
          {conducente.attivo ? (
            <UserX className="w-6 h-6 text-white" />
          ) : (
            <RotateCcw className="w-6 h-6 text-white" />
          )}
        </div>
      </div>

      {/* Card Content */}
      <div
        className="relative bg-card rounded-xl shadow-sm border p-6 transition-transform duration-150"
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header: Nome + Status Badge */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">
              {conducente.nome_cognome}
            </h3>
            {conducente.email && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {conducente.email}
              </p>
            )}
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap ml-2 ${
              conducente.attivo
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {conducente.attivo ? 'Attivo' : 'Inattivo'}
          </span>
        </div>

        {/* Info Row: Telefono + Note Preview */}
        <div className="space-y-2 mb-4">
          {conducente.telefono && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{conducente.telefono}</span>
            </div>
          )}
          {conducente.note && (
            <p className="text-sm text-muted-foreground italic line-clamp-2">
              {conducente.note}
            </p>
          )}
        </div>

        {/* Action Buttons - Touch Compliant */}
        <div className="flex gap-3">
          <button
            onClick={() => onEdit(conducente)}
            className="flex-1 h-12 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-400 rounded-lg font-medium transition-colors active:scale-95"
          >
            <Pencil className="w-5 h-5" />
            <span>Modifica</span>
          </button>

          {conducente.telefono && (
            <button
              onClick={() => onCall?.(conducente.telefono!)}
              className="h-12 w-12 flex items-center justify-center bg-green-50 hover:bg-green-100 dark:bg-green-950/30 dark:hover:bg-green-950/50 text-green-700 dark:text-green-400 rounded-lg transition-colors active:scale-95"
              aria-label="Chiama conducente"
            >
              <Phone className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={() => onToggle(conducente)}
            className="h-12 w-12 flex items-center justify-center bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors active:scale-95"
            aria-label={conducente.attivo ? 'Disattiva conducente' : 'Riattiva conducente'}
          >
            {conducente.attivo ? (
              <UserX className="w-5 h-5" />
            ) : (
              <RotateCcw className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
