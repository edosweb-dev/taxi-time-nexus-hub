
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { VeicoloList } from '@/components/veicoli/VeicoloList';
import { VeicoloDialog } from '@/components/veicoli/VeicoloDialog';
import { ChevronRight, Home } from 'lucide-react';

export default function VeicoliPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Veicoli</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Veicoli</h1>
                <p className="text-muted-foreground text-lg">
                  Gestisci la flotta veicoli
                </p>
              </div>
              
              <VeicoloDialog />
            </div>
          </div>

          <VeicoloList />
        </div>
      </div>
    </MainLayout>
  );
}
