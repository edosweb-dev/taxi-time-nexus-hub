import { MainLayout } from "@/components/layouts/MainLayout";
import { NuovoServizioForm } from "@/components/servizi/NuovoServizioForm";
import { ChevronRight, Home, FileText, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NuovoServizioPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 space-y-6 py-6">
        {/* Header - Più compatto */}
        <div className="space-y-3 pt-2 md:pt-0 px-1">
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
