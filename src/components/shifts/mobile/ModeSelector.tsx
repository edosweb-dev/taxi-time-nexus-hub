import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, User, Clock, CalendarDays } from 'lucide-react';

interface ModeSelectorProps {
  onSelectMode: (mode: 'single' | 'batch') => void;
  onCancel: () => void;
}

export function ModeSelector({ onSelectMode, onCancel }: ModeSelectorProps) {
  return (
    <div className="space-y-6 p-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Seleziona modalità</h3>
        <p className="text-sm text-muted-foreground">
          Scegli come vuoi creare i turni
        </p>
      </div>

      <div className="grid gap-4">
        {/* Single Shift Option */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
          onClick={() => onSelectMode('single')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Turno Singolo</CardTitle>
                <CardDescription className="text-sm">
                  Crea un singolo turno
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Veloce e preciso</span>
            </div>
          </CardContent>
        </Card>

        {/* Batch Shifts Option */}
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-primary/20"
          onClick={() => onSelectMode('batch')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-base">Turni Multipli</CardTitle>
                <CardDescription className="text-sm">
                  Crea più turni insieme
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="w-4 h-4" />
              <span>Efficiente per pianificazione</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-4">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="w-full"
        >
          Annulla
        </Button>
      </div>
    </div>
  );
}