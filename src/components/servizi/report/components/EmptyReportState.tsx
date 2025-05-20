
import React from 'react';

export const EmptyReportState: React.FC = () => {
  return (
    <div className="text-center py-12 border rounded-md bg-muted/30">
      <h3 className="text-lg font-medium">Nessun report generato</h3>
      <p className="text-muted-foreground mt-1">
        I report generati appariranno qui. Usa il pulsante "Genera Report" per crearne uno.
      </p>
    </div>
  );
};
