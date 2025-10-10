import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaFormManager } from '@/components/aziende/AziendaFormManager';
import { useAziende } from '@/hooks/useAziende';
import { AziendaFormData } from '@/lib/api/aziende';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLayout } from '@/contexts/LayoutContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAziendaById } from '@/lib/api/aziende';

export default function ModificaAziendaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateCompany, isUpdating } = useAziende();
  const isMobile = useIsMobile();
  const { setPaddingMode } = useLayout();

  const { data: azienda, isLoading } = useQuery({
    queryKey: ['azienda', id],
    queryFn: () => getAziendaById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (isMobile) {
      setPaddingMode('full-width');
    }
    return () => setPaddingMode('default');
  }, [isMobile, setPaddingMode]);

  const handleSubmit = (data: AziendaFormData) => {
    if (id) {
      updateCompany(id, data);
      // Navigate back to aziende list after successful update
      setTimeout(() => {
        navigate('/aziende');
      }, 500);
    }
  };

  const handleBack = () => {
    navigate('/aziende');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!azienda) {
    return (
      <MainLayout>
        <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <p className="text-muted-foreground">Azienda non trovata</p>
            <Button onClick={handleBack} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Torna alle Aziende
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-3 sm:mb-4 -ml-2"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Torna alle Aziende</span>
            <span className="sm:hidden">Indietro</span>
          </Button>
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Modifica Azienda</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Modifica i dettagli e le configurazioni dell'azienda esistente
          </p>
        </div>

        {/* Form using AziendaFormManager in page mode */}
        <div className="w-full sm:max-w-7xl">
          <div className="w-full space-y-4 sm:space-y-6 pb-20 sm:pb-0">
            <AziendaFormManager
              mode="page"
              azienda={azienda}
              onSubmit={handleSubmit}
              isSubmitting={isUpdating}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
