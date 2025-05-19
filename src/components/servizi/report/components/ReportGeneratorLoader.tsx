
import React from 'react';
import { Loader2 } from 'lucide-react';

export const ReportGeneratorLoader = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-medium">Generazione report in corso...</h3>
        <p className="text-sm text-muted-foreground mt-2">
          La generazione del report potrebbe richiedere alcuni secondi.
        </p>
      </div>
    </div>
  );
};
