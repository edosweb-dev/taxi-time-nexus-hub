
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ImpostazioniForm } from '@/components/impostazioni/ImpostazioniForm';
import { ChevronRight, Home } from 'lucide-react';
import { useImpostazioni } from '@/hooks/useImpostazioni';
import { Loader2 } from 'lucide-react';

export default function ImpostazioniPage() {
  const { impostazioni, isLoading } = useImpostazioni();

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const defaultImpostazioni = {
    id: impostazioni?.id || '',
    nome_azienda: impostazioni?.nome_azienda || '',
    partita_iva: impostazioni?.partita_iva || '',
    indirizzo_sede: impostazioni?.indirizzo_sede || '',
    telefono: impostazioni?.telefono || '',
    email: impostazioni?.email || '',
    metodi_pagamento: impostazioni?.metodi_pagamento || [],
    aliquote_iva: impostazioni?.aliquote_iva || [],
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Impostazioni</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Impostazioni</h1>
                <p className="text-muted-foreground text-lg">
                  Configura le impostazioni del sistema
                </p>
              </div>
            </div>
          </div>

          <ImpostazioniForm initialData={defaultImpostazioni} />
        </div>
      </div>
    </MainLayout>
  );
}
