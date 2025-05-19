
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader2, X } from 'lucide-react';

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
  // Show a message when there are no services available
  const handleSubmitClick = (e: React.MouseEvent) => {
    if (isDisabled) {
      e.preventDefault(); // Prevent form submission if disabled
      
      if (serviziCount === 0) {
        toast({
          title: "Nessun servizio disponibile",
          description: "Non ci sono servizi consuntivati per i criteri selezionati.",
          variant: "destructive",
        });
      }
    } else {
      // Quando il pulsante è abilitato e si fa clic su di esso, mostra un toast per dare feedback all'utente
      if (!isLoading) {
        toast({
          title: "Richiesta inviata",
          description: "Preparazione della generazione del report..."
        });
      }
    }
    // If not disabled, the form's onSubmit will handle the action
    console.log('Generate button clicked, disabled:', isDisabled);
  };

  return (
    <div className="flex justify-end space-x-2">
      <Button 
        variant="outline" 
        type="button" 
        onClick={onCancel}
        disabled={isLoading}
        size="sm"
      >
        <X className="h-4 w-4 mr-1" />
        Annulla
      </Button>
      <Button 
        type="submit" 
        disabled={isLoading || isDisabled}
        onClick={handleSubmitClick}
        size="sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            Generazione...
          </>
        ) : (
          'Genera Report PDF'
        )}
      </Button>
    </div>
  );
};
