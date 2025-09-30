import { Button } from '@/components/ui/button';
import { Save, X, Loader2 } from 'lucide-react';

interface MobileAziendaFormFooterProps {
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export function MobileAziendaFormFooter({ 
  onCancel, 
  onSubmit, 
  isSubmitting, 
  isEditing 
}: MobileAziendaFormFooterProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 bg-background border-t p-4 pb-safe z-30">
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 min-h-[48px]"
        >
          <X className="h-4 w-4 mr-2" />
          Annulla
        </Button>
        <Button
          type="submit"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 min-h-[48px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvataggio...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? 'Aggiorna' : 'Crea'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
