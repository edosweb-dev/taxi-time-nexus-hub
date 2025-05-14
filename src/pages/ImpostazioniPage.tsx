
import React from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { getImpostazioni } from '@/lib/api/impostazioni/getImpostazioni';
import { ImpostazioniForm } from '@/components/impostazioni/ImpostazioniForm';
import { toast } from 'sonner';
import { ImpostazioniFormData } from '@/lib/types/impostazioni';

export default function ImpostazioniPage() {
  const {
    data: impostazioni,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['impostazioni'],
    queryFn: getImpostazioni,
  });

  const handleImpostazioniSaved = () => {
    toast.success('Impostazioni salvate con successo');
    refetch();
  };

  const defaultImpostazioni: ImpostazioniFormData = {
    nome_azienda: '',
    partita_iva: '',
    indirizzo_sede: '',
    telefono: '',
    email: '',
    metodi_pagamento: [],
    aliquote_iva: [],
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
          <p className="text-muted-foreground">
            Configura le impostazioni generali dell'azienda, metodi di pagamento e aliquote IVA
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 p-4 rounded-md border border-destructive">
            <p className="text-destructive">
              Si è verificato un errore durante il caricamento delle impostazioni.
              {error instanceof Error ? ` ${error.message}` : ''}
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="bg-card rounded-lg border shadow-sm">
            <ImpostazioniForm 
              initialData={impostazioni || defaultImpostazioni} 
              onSaved={handleImpostazioniSaved}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
