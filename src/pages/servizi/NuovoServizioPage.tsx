
import { MainLayout } from "@/components/layouts/MainLayout";
import { NuovoServizioForm } from "@/components/servizi/NuovoServizioForm";

export default function NuovoServizioPage() {
  return (
    <MainLayout>
      <div className="space-y-6 min-h-full pb-20">
        {/* Header con progresso */}
        <div className="mb-8">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Nuovo Servizio
                </h1>
                <p className="text-muted-foreground mt-1">
                  Crea un nuovo servizio di trasporto compilando tutti i campi richiesti
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  Creazione servizio
                </div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '33%' }}></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Dettagli</span>
              <span>Passeggeri</span>
              <span>Conferma</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <NuovoServizioForm />
      </div>
    </MainLayout>
  );
}
