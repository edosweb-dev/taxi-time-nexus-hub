import { useParams, useNavigate } from 'react-router-dom';
import { ServizioCreaPage } from "@/pages/servizi/ServizioCreaPage";
import { Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function ModificaServizioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch servizio completo con tutte le relazioni
  const { data: servizio, isLoading, error } = useQuery({
    queryKey: ['servizio-edit', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('servizi')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Caricamento servizio...</p>
        </div>
      </div>
    );
  }

  if (error || !servizio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ? "Errore nel caricamento del servizio" : "Servizio non trovato"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/servizi')} variant="outline">
          Torna ai servizi
        </Button>
      </div>
    );
  }

  return (
    <ServizioCreaPage
      mode="edit"
      servizioId={id}
      initialData={servizio}
      onSuccess={() => navigate(`/servizi/${id}`)}
      onCancel={() => navigate(`/servizi/${id}`)}
    />
  );
}
