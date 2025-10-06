import { MainLayout } from "@/components/layouts/MainLayout";
import { NuovoServizioForm } from "@/components/servizi/NuovoServizioForm";
import { ServizioVeloceForm } from "@/components/servizi/ServizioVeloceForm";
import { useSearchParams } from "react-router-dom";

export default function NuovoServizioPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "completo";

  // Se mode è veloce, mostra il form veloce
  if (mode === "veloce") {
    return (
      <MainLayout>
        <ServizioVeloceForm />
      </MainLayout>
    );
  }

  // Altrimenti mostra il form completo (wizard)
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-6 py-6">
        {/* Header - Più compatto */}
        <div className="space-y-3 pt-2 md:pt-0 px-4">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Nuovo Servizio</h1>
          <p className="text-muted-foreground">
            Compila i campi per creare un nuovo servizio di trasporto
          </p>
        </div>

        {/* Form Content */}
        <NuovoServizioForm />
      </div>
    </MainLayout>
  );
}
