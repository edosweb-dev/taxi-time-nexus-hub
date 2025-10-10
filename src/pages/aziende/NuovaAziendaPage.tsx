import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaFormManager } from '@/components/aziende/AziendaFormManager';
import { useAziende } from '@/hooks/useAziende';
import { AziendaFormData } from '@/lib/api/aziende';
import { useNavigate } from 'react-router-dom';

export default function NuovaAziendaPage() {
  const navigate = useNavigate();
  const { createCompany, isCreating } = useAziende();

  const handleSubmit = (data: AziendaFormData) => {
    createCompany(data);
    // Navigate back to aziende list after successful creation
    setTimeout(() => {
      navigate('/aziende');
    }, 500);
  };

  return (
    <MainLayout>
      <div className="wizard-fullwidth -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-8 xl:-mx-8">
        <AziendaFormManager
          mode="page"
          onSubmit={handleSubmit}
          isSubmitting={isCreating}
        />
      </div>
    </MainLayout>
  );
}
