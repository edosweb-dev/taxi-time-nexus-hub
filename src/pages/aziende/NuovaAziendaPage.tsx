import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaForm } from '@/components/aziende/AziendaForm';
import { ChevronRight, Home, Plus } from 'lucide-react';
import { AziendaFormData } from '@/lib/api/aziende';
import { toast } from '@/components/ui/use-toast';
import { createAzienda } from '@/lib/api/aziende';

export default function NuovaAziendaPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: AziendaFormData) => {
    try {
      setIsSubmitting(true);
      await createAzienda(data);
      toast({
        title: "Azienda creata",
        description: "L'azienda è stata creata con successo.",
      });
      navigate('/aziende');
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la creazione dell'azienda.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/aziende');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con breadcrumb */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span 
              className="hover:text-foreground cursor-pointer transition-colors duration-200" 
              onClick={() => navigate('/aziende')}
            >
              Aziende
            </span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Nuova Azienda</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title flex items-center gap-3">
                <Plus className="h-7 w-7 text-green-500" />
                Nuova Azienda
              </h1>
              <p className="text-description">
                Inserisci tutti i dettagli necessari per creare una nuova azienda nel sistema
              </p>
            </div>
          </div>
        </div>

        <AziendaForm
          azienda={null}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </div>
    </MainLayout>
  );
}