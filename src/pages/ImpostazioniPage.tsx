
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
      <div className="space-y-6">
          {/* Header */}
          <div className="space-y-4">
            <div className="space-y-6">
              {/* Header principale */}
              <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">Impostazioni</h1>
                  <p className="text-muted-foreground">
                    Configura le impostazioni generali del sistema
                  </p>
                </div>
              </div>

              {/* Sezioni di configurazione */}
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Sezione Informazioni Azienda */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Info className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold text-lg">Informazioni Azienda</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Configura i dati principali della tua azienda
                      </p>
                    </div>

                    {/* Sezione Metodi di Pagamento */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        <h3 className="font-semibold text-lg">Metodi di Pagamento</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Gestisci i metodi di pagamento disponibili
                      </p>
                    </div>

                    {/* Sezione Aliquote IVA */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-green-600" />
                        <h3 className="font-semibold text-lg">Aliquote IVA</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Configura le aliquote IVA per la fatturazione
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <ImpostazioniForm initialData={defaultImpostazioni} />
      </div>
    </MainLayout>
  );
}
