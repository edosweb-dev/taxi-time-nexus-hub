
import React from 'react';
import { Button } from '@/components/ui/button';
import { DownloadIcon } from 'lucide-react';

export const ClientEmptyReport: React.FC = () => {
  return (
    <div className="bg-muted/30 p-6 rounded-lg text-center">
      <h2 className="text-xl font-medium mb-2">Nessun report disponibile</h2>
      <p className="text-muted-foreground mb-4">
        Non ci sono dati disponibili per il periodo selezionato.
      </p>
      <Button variant="outline" disabled>
        <DownloadIcon className="mr-2 h-4 w-4" />
        Scarica Report
      </Button>
    </div>
  );
};
