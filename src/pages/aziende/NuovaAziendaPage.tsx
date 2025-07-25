import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaForm } from '@/components/aziende/AziendaForm';
import { ChevronRight, Home, Building2, Plus } from 'lucide-react';
import { AziendaFormData } from '@/lib/api/aziende';
import { toast } from '@/components/ui/use-toast';
import { createAzienda } from '@/lib/api/aziende';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
      <div className="min-h-full pb-8">
        {/* Header con breadcrumb */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 pb-4 mb-6">
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
            
            {/* Header con avatar e titolo */}
            <div className="flex items-start gap-4 animate-fade-in">
              <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                  <Plus className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                  <Plus className="h-7 w-7 text-green-500" />
                  Nuova Azienda
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Inserisci tutti i dettagli necessari per creare una nuova azienda nel sistema
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Container del Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fade-in">
            <AziendaForm
              azienda={null}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}