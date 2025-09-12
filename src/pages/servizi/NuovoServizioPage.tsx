
import { MainLayout } from "@/components/layouts/MainLayout";
import { NuovoServizioForm } from "@/components/servizi/NuovoServizioForm";
import { ArrowLeft, CheckCircle2, FileText, Users, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NuovoServizioPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="min-h-full">
        {/* Modern Header */}
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-9 w-9 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Nuovo Servizio
                </h1>
                <p className="text-muted-foreground mt-1">
                  Compila i campi per creare un nuovo servizio di trasporto
                </p>
              </div>
            </div>
            
            {/* Enhanced Progress Steps */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-muted">
                <div className="h-full bg-gradient-to-r from-primary to-primary/50 rounded-full transition-all duration-500" style={{ width: '0%' }}></div>
              </div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
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
        <div className="container mx-auto px-4 py-8">
          <NuovoServizioForm />
        </div>
      </div>
    </MainLayout>
  );
}
