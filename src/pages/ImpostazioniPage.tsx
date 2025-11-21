
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ImpostazioniForm } from '@/components/impostazioni/ImpostazioniForm';
import { ChevronRight, Home, Settings, Info, CreditCard, Receipt } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
      <div className="space-y-4 md:space-y-6 p-4 md:p-0">
        {/* Header principale - Ottimizzato per mobile */}
        <div className="flex items-start gap-3">
          <Settings className="h-6 w-6 md:h-8 md:w-8 text-primary flex-shrink-0 mt-1" />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground truncate">
              Impostazioni
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Configura le impostazioni generali del sistema
            </p>
          </div>
        </div>

        {/* Sezioni di configurazione - Stack su mobile */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              
              {/* Sezione Informazioni Azienda */}
              <div className="space-y-2 md:space-y-3 pb-4 md:pb-0 border-b md:border-b-0">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 md:h-5 md:w-5 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-base md:text-lg">Informazioni Azienda</h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Configura i dati principali della tua azienda
                </p>
              </div>

              {/* Sezione Metodi di Pagamento */}
              <div className="space-y-2 md:space-y-3 pb-4 md:pb-0 border-b md:border-b-0">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-blue-600 flex-shrink-0" />
                  <h3 className="font-semibold text-base md:text-lg">Metodi di Pagamento</h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Gestisci i metodi di pagamento disponibili
                </p>
              </div>

              {/* Sezione Aliquote IVA */}
              <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 md:h-5 md:w-5 text-green-600 flex-shrink-0" />
                  <h3 className="font-semibold text-base md:text-lg">Aliquote IVA</h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Configura le aliquote IVA per la fatturazione
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <ImpostazioniForm initialData={defaultImpostazioni} />
      </div>
    </MainLayout>
  );
}
