
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

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
      <Button variant="outline" type="button" onClick={onCancel}>
        Annulla
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || isDisabled}
        onClick={handleSubmitClick}
      >
        {isLoading ? 'Generazione...' : 'Genera Report PDF'}
      </Button>
    </div>
  );
};
