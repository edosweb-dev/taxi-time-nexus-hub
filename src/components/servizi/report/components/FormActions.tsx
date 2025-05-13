
import React from 'react';
import { Button } from '@/components/ui/button';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({
  onCancel,
  isLoading,
  isDisabled
}) => {
  return (
    <div className="flex justify-end space-x-2">
      <Button variant="outline" type="button" onClick={onCancel}>
        Annulla
      </Button>
      <Button type="submit" disabled={isLoading || isDisabled}>
        {isLoading ? 'Generazione...' : 'Genera Report PDF'}
      </Button>
    </div>
  );
};
