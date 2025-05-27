
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SpesaDipendentForm } from '@/components/spese/SpesaDipendentForm';
import { SpeseDipendentiList } from '@/components/spese/SpeseDipendentiList';
import { ChevronRight, Home } from 'lucide-react';

export default function SpeseDipendentePage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Le mie spese</span>
            </nav>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Le mie spese</h1>
              <p className="text-muted-foreground text-lg">
                Gestisci e monitora le tue spese personali
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            {/* Form inserimento spesa - 40% width su desktop */}
            <div className="lg:col-span-2">
              <div className="sticky top-6">
                <SpesaDipendentForm />
              </div>
            </div>

            {/* Lista storico spese - 60% width su desktop */}
            <div className="lg:col-span-3">
              <SpeseDipendentiList />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
