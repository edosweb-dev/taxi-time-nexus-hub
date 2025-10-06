import { MainLayout } from "@/components/layouts/MainLayout";
import { NuovoServizioForm } from "@/components/servizi/NuovoServizioForm";
import { ChevronRight, Home, FileText, Users, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NuovoServizioPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con breadcrumb */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate('/servizi')}>
              Servizi
            </span>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Nuovo Servizio</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">Nuovo Servizio</h1>
              <p className="text-muted-foreground text-lg">
                Compila i campi per creare un nuovo servizio di trasporto
              </p>
            </div>
          </div>

          {/* Progress Steps - Solo desktop */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted">
                <div className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
              </div>
              
              {/* Steps */}
              <div className="relative flex justify-between max-w-2xl mx-auto">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                    <FileText className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium mt-2">Dettagli</span>
                  <span className="text-xs text-muted-foreground">Servizio</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium mt-2">Passeggeri</span>
                  <span className="text-xs text-muted-foreground">Gestione</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-medium mt-2">Conferma</span>
                  <span className="text-xs text-muted-foreground">Riepilogo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <NuovoServizioForm />
      </div>
    </MainLayout>
  );
}
