
import React from 'react';
import { FileText } from 'lucide-react';
import { ReportsList } from '@/components/servizi/report/ReportsList';

export const ReportContent: React.FC = () => {
  return (
    <div className="bg-muted/30 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3 text-muted-foreground">
        <FileText className="h-5 w-5" />
        <h2 className="text-lg font-medium">Report generati</h2>
      </div>
      <ReportsList />
    </div>
  );
};
