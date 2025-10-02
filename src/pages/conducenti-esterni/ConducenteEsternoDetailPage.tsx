import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ConducenteEsternoForm } from '@/components/conducenti-esterni/ConducenteEsternoForm';
import { useConducentiEsterni } from '@/hooks/useConducentiEsterni';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowLeft, Edit, Plus, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConducenteEsternoDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const mode = (searchParams.get('mode') || 'edit') as 'create' | 'edit';
  
  const { data: conducenti, isLoading } = useConducentiEsterni();
  const conducente = id ? conducenti?.find(c => c.id === id) : null;
  
  const isEditing = mode === 'edit' && !!conducente;

  // Helper function to get driver initials
  const getDriverInitials = (nomeCognome: string) => {
    return nomeCognome
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const handleSuccess = () => {
    navigate('/conducenti-esterni');
  };

  const handleCancel = () => {
    navigate('/conducenti-esterni');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 pb-20">
        {/* Header con pulsante indietro */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/conducenti-esterni')}
            className="h-10 w-10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="page-title">
            {isEditing ? 'Modifica Conducente' : 'Nuovo Conducente'}
          </h1>
        </div>

        {/* Profile Header */}
        <div className="bg-card rounded-xl border p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                {isEditing ? getDriverInitials(conducente.nome_cognome) : <Plus className="h-8 w-8" />}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <Edit className="h-6 w-6 text-amber-500" />
                    <h2 className="text-2xl font-bold">Modifica Conducente</h2>
                  </>
                ) : (
                  <>
                    <Plus className="h-6 w-6 text-green-500" />
                    <h2 className="text-2xl font-bold">Nuovo Conducente</h2>
                  </>
                )}
              </div>
              {isEditing && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span className="text-lg font-medium">{conducente.nome_cognome}</span>
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {isEditing 
                  ? "Modifica i dettagli e le configurazioni del conducente esterno"
                  : "Inserisci tutti i dettagli necessari per aggiungere un nuovo conducente esterno"
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <ConducenteEsternoForm
          conducente={conducente}
          mode={mode}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  );
}
