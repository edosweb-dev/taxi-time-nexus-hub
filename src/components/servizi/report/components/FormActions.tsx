
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  serviziCount?: number;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isLoading,
  isDisabled,
  serviziCount = 0
}) => {
  // Funzione per mostrare un messaggio in caso di permessi mancanti
  const handleSubmitClick = () => {
    if (isDisabled) {
      if (serviziCount === 0) {
        toast({
          title: "Nessun servizio disponibile",
          description: "Non ci sono servizi consuntivati per i criteri selezionati.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex justify-end space-x-2">
      <Button 
        variant="outline" 
        type="button" 
        onClick={onCancel}
        disabled={isLoading}
      >
        Annulla
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || isDisabled}
        onClick={handleSubmitClick}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generazione...
          </>
        ) : (
          'Genera Report PDF'
        )}
      </Button>
    </div>
  );
};
