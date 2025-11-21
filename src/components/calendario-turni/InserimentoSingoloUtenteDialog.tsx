import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, X } from 'lucide-react';
import { InserimentoSingoloUtenteForm } from './shared/InserimentoSingoloUtenteForm';

interface InserimentoSingoloUtenteDialogProps {
  currentDate: Date;
  onClose: () => void;
  onStartProgress: (total: number) => void;
  onUpdateProgress: (created: number, errors: number) => void;
  onCompleteProgress: () => void;
}

export function InserimentoSingoloUtenteDialog({ 
  currentDate, 
  onClose, 
  onStartProgress, 
  onUpdateProgress, 
  onCompleteProgress 
}: InserimentoSingoloUtenteDialogProps) {
  
  const handleStartProgress = (total: number) => {
    onClose();
    onStartProgress(total);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="h-6 w-6" />
              Inserimento Rapido Turni
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Seleziona date specifiche e applica un turno per un singolo dipendente
          </p>
        </CardHeader>
        
        <CardContent>
          <InserimentoSingoloUtenteForm
            currentDate={currentDate}
            onCancel={onClose}
            onStartProgress={handleStartProgress}
            onUpdateProgress={onUpdateProgress}
            onCompleteProgress={onCompleteProgress}
          />
        </CardContent>
      </Card>
    </div>
  );
}
