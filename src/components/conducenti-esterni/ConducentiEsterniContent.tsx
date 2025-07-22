import { useState } from 'react';
import { ConducenteEsternoList } from './ConducenteEsternoList';
import { ConducentiEsterniStats } from './ConducentiEsterniStats';
import { ConducenteEsternoSheet } from './ConducenteEsternoSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';
import { useConducentiEsterni } from '@/hooks/useConducentiEsterni';

interface ConducentiEsterniContentProps {
  onEdit: (conducente: ConducenteEsterno) => void;
  onAddConducente: () => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  selectedConducente: ConducenteEsterno | null;
  mode: 'create' | 'edit';
}

export function ConducentiEsterniContent({
  onEdit,
  onAddConducente,
  isSheetOpen,
  setIsSheetOpen,
  selectedConducente,
  mode,
}: ConducentiEsterniContentProps) {
  const { data: conducenti = [], isLoading } = useConducentiEsterni();

  // Filter drivers by status
  const conducentiAttivi = conducenti.filter(c => c.attivo);
  const conducentiInattivi = conducenti.filter(c => !c.attivo);

  if (isLoading) {
    return <div className="text-center py-8">Caricamento conducenti esterni...</div>;
  }

  return (
    <div className="space-y-6">
      <ConducentiEsterniStats conducenti={conducenti} />

      <Tabs defaultValue="tutti" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="tutti">Tutti</TabsTrigger>
          <TabsTrigger value="attivi">Attivi ({conducentiAttivi.length})</TabsTrigger>
          <TabsTrigger value="inattivi">Inattivi ({conducentiInattivi.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tutti" className="space-y-4">
          <ConducenteEsternoList 
            conducenti={conducenti}
            onEdit={onEdit}
            onAddConducente={onAddConducente}
            title="Tutti i Conducenti"
            description="Gestione completa dei conducenti esterni"
          />
        </TabsContent>
        
        <TabsContent value="attivi" className="space-y-4">
          <ConducenteEsternoList 
            conducenti={conducentiAttivi}
            onEdit={onEdit}
            onAddConducente={onAddConducente}
            title="Conducenti Attivi"
            description="Conducenti disponibili per i servizi"
            showOnlyActive={true}
          />
        </TabsContent>

        <TabsContent value="inattivi" className="space-y-4">
          <ConducenteEsternoList 
            conducenti={conducentiInattivi}
            onEdit={onEdit}
            onAddConducente={onAddConducente}
            title="Conducenti Inattivi"
            description="Conducenti non disponibili per i servizi"
            showOnlyInactive={true}
          />
        </TabsContent>
      </Tabs>

      <ConducenteEsternoSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        conducente={selectedConducente}
        mode={mode}
      />
    </div>
  );
}