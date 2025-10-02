
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
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-title">Gestione Conducenti Esterni</h1>
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
