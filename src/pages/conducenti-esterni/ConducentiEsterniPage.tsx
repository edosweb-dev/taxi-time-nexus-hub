import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, Home } from 'lucide-react';
import { ConducenteEsternoList } from '@/components/conducenti-esterni/ConducenteEsternoList';
import { ConducenteEsternoDialog } from '@/components/conducenti-esterni/ConducenteEsternoDialog';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

export default function ConducentiEsterniPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedConducente, setSelectedConducente] = useState<ConducenteEsterno | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  const handleCreate = () => {
    setSelectedConducente(null);
    setMode('create');
    setIsDialogOpen(true);
  };

  const handleEdit = (conducente: ConducenteEsterno) => {
    setSelectedConducente(conducente);
    setMode('edit');
    setIsDialogOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Conducenti Esterni</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Conducenti Esterni</h1>
                <p className="text-muted-foreground text-lg">
                  Gestisci i conducenti esterni per l'assegnazione dei servizi
                </p>
              </div>
              
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nuovo Conducente
              </Button>
            </div>
          </div>

        <ConducenteEsternoList onEdit={handleEdit} />

        <ConducenteEsternoDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          conducente={selectedConducente}
          mode={mode}
        />
      </div>
    </MainLayout>
  );
}