
import React from 'react';

interface ServizioSelectionHeaderProps {
  aziendaName: string;
  referenteName: string;
  monthName: string;
  year: string;
}

export const ServizioSelectionHeader: React.FC<ServizioSelectionHeaderProps> = ({
  aziendaName,
  referenteName,
  monthName,
  year,
}) => {
  return (
    <div className="mb-2">
      <h3 className="text-lg font-medium">
        Servizi consuntivati per {aziendaName} - {referenteName} - {monthName} {year}
      </h3>
    </div>
  );
};
