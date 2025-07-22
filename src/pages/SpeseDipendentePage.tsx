
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SpeseList } from '@/components/spese/SpeseList';
import { SpesaSheet } from '@/components/spese/SpesaSheet';
import { ChevronRight, Home } from 'lucide-react';

export default function SpeseDipendentePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Le mie spese</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Le mie spese</h1>
                <p className="text-muted-foreground text-lg">
                  Gestisci e monitora le tue spese personali
                </p>
              </div>
              
              {/* Pulsante per aprire il sheet */}
              <SpesaSheet />
            </div>
          </div>

          {/* Lista spese unificata */}
          <SpeseList />
      </div>
    </MainLayout>
  );
}
