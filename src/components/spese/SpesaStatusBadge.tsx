
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface SpesaStatusBadgeProps {
  stato: 'in_attesa' | 'approvata' | 'non_autorizzata' | 'in_revisione';
}

export function SpesaStatusBadge({ stato }: SpesaStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'in_attesa':
        return {
          label: 'In attesa',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200'
        };
      case 'approvata':
        return {
          label: 'Approvata',
          className: 'bg-green-100 text-green-800 border-green-200'
        };
      case 'non_autorizzata':
        return {
          label: 'Non autorizzata',
          className: 'bg-red-100 text-red-800 border-red-200'
        };
      case 'in_revisione':
        return {
          label: 'In revisione',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      default:
        return {
          label: 'Sconosciuto',
          className: 'bg-gray-100 text-gray-800 border-gray-200'
        };
    }
  };

  const config = getStatusConfig(stato);

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
