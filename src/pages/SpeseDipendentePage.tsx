
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SpesaDipendentForm } from '@/components/spese/SpesaDipendentForm';
import { SpeseDipendentiList } from '@/components/spese/SpeseDipendentiList';

export default function SpeseDipendentePage() {
  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Le mie spese</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form inserimento spesa */}
          <div className="lg:col-span-1">
            <SpesaDipendentForm />
          </div>

          {/* Lista storico spese */}
          <div className="lg:col-span-2">
            <SpeseDipendentiList />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
