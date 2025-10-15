import { DipendenteLayout } from '@/components/layouts/DipendenteLayout';
import CalendarioTurniPage from '@/pages/CalendarioTurniPage';
import { useAuth } from '@/contexts/AuthContext';

export default function TurniPage() {
  const { profile } = useAuth();

  return (
    <DipendenteLayout>
      <CalendarioTurniPage 
        filterUserId={profile?.id}
        showUserFilter={false}
        layout="dipendente"
      />
    </DipendenteLayout>
  );
}
