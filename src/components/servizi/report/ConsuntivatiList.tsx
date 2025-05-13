
import React, { useState } from 'react';
import { useServizi } from '@/hooks/useServizi';
import { useUsers } from '@/hooks/useUsers';
import { useAziende } from '@/hooks/useAziende';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ServizioTable } from '@/components/servizi/ServizioTable';
import { Loader2, Layout, Table as TableIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { ServizioTabContent } from '@/components/servizi/ServizioTabContent';

export const ConsuntivatiList = () => {
  const { servizi, isLoading } = useServizi();
  const { users } = useUsers();
  const { aziende } = useAziende();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"cards" | "table">(isMobile ? "cards" : "table");

  // Filter services with status "consuntivato"
  const consuntivatiServizi = servizi.filter(s => s.stato === 'consuntivato');

  // Group by month and year
  const groupedServizi = consuntivatiServizi.reduce((acc, servizio) => {
    const date = new Date(servizio.data_servizio);
    const month = date.getMonth();
    const year = date.getFullYear();
    const key = `${year}-${month}`;
    
    if (!acc[key]) {
      acc[key] = {
        month,
        year,
        servizi: []
      };
    }
    
    acc[key].servizi.push(servizio);
    return acc;
  }, {} as Record<string, { month: number; year: number; servizi: typeof consuntivatiServizi }>);

  // Sort keys by date (most recent first)
  const sortedKeys = Object.keys(groupedServizi).sort((a, b) => {
    const [yearA, monthA] = a.split('-').map(Number);
    const [yearB, monthB] = b.split('-').map(Number);
    if (yearA !== yearB) return yearB - yearA;
    return monthB - monthA;
  });

  // Format month name
  const getMonthName = (monthNum: number) => {
    const date = new Date(2022, monthNum, 1);
    return date.toLocaleString('it-IT', { month: 'long' });
  };

  const handleNavigateToDetail = (id: string) => {
    window.location.href = `/servizi/${id}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Servizi Consuntivati</h2>
        
        {!isMobile && (
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as "cards" | "table")}>
            <ToggleGroupItem value="cards" aria-label="Visualizza schede">
              <Layout className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Visualizza tabella">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        )}
      </div>

      {consuntivatiServizi.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium">Nessun servizio consuntivato</h3>
            <p className="text-muted-foreground mt-1">
              Non ci sono servizi consuntivati da visualizzare.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={sortedKeys[0]} className="w-full">
          <TabsList className="mb-4 flex overflow-x-auto">
            {sortedKeys.map(key => {
              const { month, year, servizi } = groupedServizi[key];
              return (
                <TabsTrigger key={key} value={key} className="whitespace-nowrap">
                  {getMonthName(month)} {year} ({servizi.length})
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {sortedKeys.map(key => {
            const { servizi: periodServizi } = groupedServizi[key];
            return (
              <TabsContent key={key} value={key} className="pt-2">
                {viewMode === "table" ? (
                  <ServizioTable
                    servizi={periodServizi}
                    users={users}
                    onNavigateToDetail={handleNavigateToDetail}
                    allServizi={servizi}
                  />
                ) : (
                  <ServizioTabContent
                    status="consuntivato"
                    servizi={periodServizi}
                    users={users}
                    isAdminOrSocio={true}
                    onSelectServizio={() => {}}
                    onNavigateToDetail={handleNavigateToDetail}
                    allServizi={servizi}
                  />
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      )}
    </div>
  );
};
