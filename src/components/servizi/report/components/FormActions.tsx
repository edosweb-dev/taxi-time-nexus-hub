
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  selectedServiziCount?: number;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isLoading,
  isDisabled,
  selectedServiziCount = 0
}) => {
  // Funzione per mostrare un messaggio in caso di permessi mancanti
  const handleSubmitClick = () => {
    if (isDisabled) {
      if (selectedServiziCount === 0) {
        toast({
          title: "Selezione richiesta",
          description: "Seleziona almeno un servizio per generare il report.",
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
