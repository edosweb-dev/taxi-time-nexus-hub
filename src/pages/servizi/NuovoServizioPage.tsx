
import { MainLayout } from "@/components/layouts/MainLayout";
import { NuovoServizioForm } from "@/components/servizi/NuovoServizioForm";

export default function NuovoServizioPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuovo Servizio</h1>
          <p className="text-muted-foreground">
            Inserisci i dettagli per creare un nuovo servizio di trasporto
          </p>
        </div>

        <NuovoServizioForm />
      </div>
    </MainLayout>
  );
}
