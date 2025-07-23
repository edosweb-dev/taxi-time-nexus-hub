
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ConducentiEsterniContent } from '@/components/conducenti-esterni/ConducentiEsterniContent';
import { ChevronRight, Home } from 'lucide-react';
import { ConducenteEsterno } from '@/lib/types/conducenti-esterni';

export default function ConducentiEsterniPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedConducente, setSelectedConducente] = useState<ConducenteEsterno | null>(null);
  const [mode, setMode] = useState<'create' | 'edit'>('create');

  const handleCreate = () => {
    setSelectedConducente(null);
    setMode('create');
    setIsSheetOpen(true);
  };

  const handleEdit = (conducente: ConducenteEsterno) => {
    setSelectedConducente(conducente);
    setMode('edit');
    setIsSheetOpen(true);
  };

  return (
    <MainLayout>
      <div className="w-full space-y-6">
        {/* Header con breadcrumb */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Conducenti Esterni</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title">Gestione Conducenti Esterni</h1>
              <p className="text-description">
                Amministra i conducenti esterni per l'assegnazione dei servizi
              </p>
            </div>
          </div>
        </div>

        <ConducentiEsterniContent
          onEdit={handleEdit}
          onAddConducente={handleCreate}
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          selectedConducente={selectedConducente}
          mode={mode}
        />
      </div>
    </MainLayout>
  );
}
