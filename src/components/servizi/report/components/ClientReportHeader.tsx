
import React from 'react';
import { BarChart } from 'lucide-react';

interface ClientReportHeaderProps {
  title: string;
  description: string;
}

export const ClientReportHeader: React.FC<ClientReportHeaderProps> = ({ 
  title, 
  description 
}) => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        {description}
      </p>
    </div>
  );
};
