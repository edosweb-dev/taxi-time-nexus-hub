import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaFormManager } from '@/components/aziende/AziendaFormManager';
import { useAziende } from '@/hooks/useAziende';
import { AziendaFormData } from '@/lib/api/aziende';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLayout } from '@/contexts/LayoutContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function NuovaAziendaPage() {
  const navigate = useNavigate();
  const { createCompany, isCreating } = useAziende();
  const isMobile = useIsMobile();
  const { setPaddingMode } = useLayout();

  useEffect(() => {
    if (isMobile) {
      setPaddingMode('full-width');
    }
    return () => setPaddingMode('default');
  }, [isMobile, setPaddingMode]);

  const handleSubmit = (data: AziendaFormData) => {
    createCompany(data);
    // Navigate back to aziende list after successful creation
    setTimeout(() => {
      navigate('/aziende');
    }, 500);
  };

  const handleBack = () => {
    navigate('/aziende');
  };

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
          
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Nuova Azienda</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Inserisci tutti i dettagli necessari per creare una nuova azienda nel sistema
          </p>
        </div>

        {/* Form using AziendaFormManager in page mode */}
        <div className="w-full sm:max-w-7xl">
          <div className="w-full space-y-4 sm:space-y-6 pb-20 sm:pb-0">
            <AziendaFormManager
              mode="page"
              onSubmit={handleSubmit}
              isSubmitting={isCreating}
            />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
