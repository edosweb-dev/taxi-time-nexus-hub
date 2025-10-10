import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaFormManager } from '@/components/aziende/AziendaFormManager';
import { useAziende } from '@/hooks/useAziende';
import { AziendaFormData } from '@/lib/api/aziende';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAziendaById } from '@/lib/api/aziende';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ModificaAziendaPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { updateCompany, isUpdating } = useAziende();

  const { data: azienda, isLoading } = useQuery({
    queryKey: ['azienda', id],
    queryFn: () => getAziendaById(id!),
    enabled: !!id,
  });

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
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!azienda) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
          <p className="text-muted-foreground">Azienda non trovata</p>
          <Button onClick={handleBack} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alle Aziende
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="wizard-fullwidth -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-8 xl:-mx-8">
        <AziendaFormManager
          mode="page"
          azienda={azienda}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
        />
      </div>
    </MainLayout>
  );
}
