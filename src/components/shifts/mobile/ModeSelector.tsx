import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, User, ChevronRight } from 'lucide-react';

interface ModeSelectorProps {
  onSelectMode: (mode: 'single' | 'batch') => void;
  onCancel: () => void;
}

export function ModeSelector({ onSelectMode, onCancel }: ModeSelectorProps) {
  return (
    <div className="space-y-3 p-4">
      <div className="text-center">
        <h3 className="text-base font-semibold">Che tipo di turno vuoi creare?</h3>
      </div>

      <div className="flex flex-col gap-2.5">
        {/* Single Shift Option */}
        <button
          onClick={() => onSelectMode('single')}
          className="w-full p-3.5 flex items-center justify-between gap-3 rounded-lg border-2 border-border hover:border-primary/50 bg-background hover:bg-accent transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <User className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">Turno Singolo</div>
              <div className="text-xs text-muted-foreground">Un turno per una persona</div>
            </div>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" />
        </button>

        {/* Batch Shifts Option */}
        <button
          onClick={() => onSelectMode('batch')}
          className="w-full p-3.5 flex items-center justify-between gap-3 rounded-lg border-2 border-border hover:border-blue-500/50 bg-background hover:bg-accent transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-blue-500" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-sm">Turni Multipli</div>
              <div className="text-xs text-muted-foreground">Più turni insieme</div>
            </div>
          </div>
          <ChevronRight className="w-4.5 h-4.5 text-muted-foreground flex-shrink-0" />
        </button>
      </div>

      <div className="pt-1">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="w-full h-9"
        >
          Annulla
        </Button>
      </div>
    </div>
  );
}