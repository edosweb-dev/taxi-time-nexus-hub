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
      <div className="wizard-fullwidth -mx-4 sm:-mx-6 md:-mx-8 lg:-mx-8 xl:-mx-8">
        <NuovoServizioForm />
      </div>
    </MainLayout>
  );
}
