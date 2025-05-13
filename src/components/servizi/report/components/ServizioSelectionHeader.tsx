
import React from 'react';
import { Button } from '@/components/ui/button';

interface ServizioSelectionHeaderProps {
  aziendaName: string;
  referenteName: string;
  monthName: string;
  year: string;
  toggleSelectAll: (select: boolean) => void;
}

export const ServizioSelectionHeader: React.FC<ServizioSelectionHeaderProps> = ({
  aziendaName,
  referenteName,
  monthName,
  year,
  toggleSelectAll
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <h3 className="text-lg font-medium">
        Servizi consuntivati per {aziendaName} - {referenteName} - {monthName} {year}
      </h3>
      <div className="space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => toggleSelectAll(true)}
        >
          Seleziona tutti
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => toggleSelectAll(false)}
        >
          Deseleziona tutti
        </Button>
      </div>
    </div>
  );
};
