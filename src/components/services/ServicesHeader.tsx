import React from 'react';
import { Servizio } from '@/lib/types/servizi';
import { groupServiziByStatus } from '@/components/servizi/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ServicesHeaderProps {
  servizi: Servizio[];
}

export function ServicesHeader({ servizi }: ServicesHeaderProps) {
  const groupedServizi = groupServiziByStatus(servizi);
  
  const stats = [
    { 
      label: 'Da Assegnare', 
      value: groupedServizi.da_assegnare.length, 
      variant: 'destructive' as const 
    },
    { 
      label: 'Assegnati', 
      value: groupedServizi.assegnato.length, 
      variant: 'secondary' as const 
    },
    { 
      label: 'Completati', 
      value: groupedServizi.completato.length, 
      variant: 'default' as const 
    },
    { 
      label: 'Totale', 
      value: servizi.length, 
      variant: 'outline' as const 
    }
  ];

  return (
    <Card>
      <CardContent className="p-4">
        <h1 className="text-xl font-semibold mb-4">Servizi</h1>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <Badge variant={stat.variant} className="w-full justify-center mb-1">
                {stat.value}
              </Badge>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}