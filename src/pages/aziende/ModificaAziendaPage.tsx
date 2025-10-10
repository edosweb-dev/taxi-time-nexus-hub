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
      <MainLayout title="Modifica Azienda" showBottomNav={true}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!azienda) {
    return (
      <MainLayout title="Modifica Azienda" showBottomNav={true}>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Azienda non trovata</p>
          <Button onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Aziende
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Modifica Azienda" 
      showBottomNav={true}
    >
      <div className="w-full px-0 md:px-4">
        <div className="space-y-6">
          {/* Back button */}
          <div className="px-4 md:px-0">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alle Aziende
            </Button>
          </div>

          {/* Form using AziendaFormManager in page mode */}
          <div className="px-4 md:px-0">
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
