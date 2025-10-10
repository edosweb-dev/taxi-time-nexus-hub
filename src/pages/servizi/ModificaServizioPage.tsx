import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from "@/components/layouts/MainLayout";
import { NuovoServizioForm } from "@/components/servizi/NuovoServizioForm";
import { useServizioDetail } from "@/hooks/useServizioDetail";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ModificaServizioPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { servizio, passeggeri, isLoading, error } = useServizioDetail(id);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Caricamento servizio...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !servizio) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
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
      </MainLayout>
    );
  }

  // Prepara initial data con passeggeri
  const initialData = {
    ...servizio,
    passeggeri: passeggeri.map(p => ({
      id: p.id,
      passeggero_id: p.id, // Usa l'id del passeggero
      nome_cognome: p.nome_cognome,
      nome: p.nome ?? "",
      cognome: p.cognome ?? "",
      localita: p.localita ?? "",
      indirizzo: p.indirizzo ?? "",
      email: p.email ?? "",
      telefono: p.telefono ?? "",
      orario_presa_personalizzato: p.orario_presa_personalizzato ?? "",
      luogo_presa_personalizzato: p.luogo_presa_personalizzato ?? "",
      destinazione_personalizzato: p.destinazione_personalizzato ?? "",
      usa_indirizzo_personalizzato: p.usa_indirizzo_personalizzato ?? false,
    })),
  };

  return (
    <MainLayout>
      <div className="wizard-fullwidth -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-8 xl:-mx-8">
        <NuovoServizioForm
          mode="edit"
          servizioId={id}
          initialData={initialData}
          onSuccess={() => navigate(`/servizi/${id}`)}
        />
      </div>
    </MainLayout>
  );
}
