
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SpeseFilters } from '@/components/spese/SpeseFilters';
import { SpeseAziendaliReport } from '@/components/spese/SpeseAziendaliReport';
import { SpeseFilters as SpeseFiltersType } from '@/hooks/useSpeseDipendenti';

export default function SpeseAziendaliPage() {
  const [filters, setFilters] = useState<SpeseFiltersType>({});

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Report Spese Dipendenti</h1>
        </div>

        <SpeseFilters 
          onFiltersChange={setFilters}
          currentFilters={filters}
        />

        <SpeseAziendaliReport filters={filters} />
      </div>
    </MainLayout>
  );
}
