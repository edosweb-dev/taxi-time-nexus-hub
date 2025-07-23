import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { EditServizioForm } from "@/components/servizi/EditServizioForm";
import { useServizioDetail } from "@/hooks/useServizioDetail";
import { ServizioLoading, ServizioError } from "@/components/servizi/dettaglio/ServizioLoadingError";

export default function EditServizioPage() {
  const { id } = useParams<{ id: string }>();
  const { servizio, passeggeri, isLoading, error } = useServizioDetail(id);

  console.log('[EditServizioPage] ID servizio:', id);
  console.log('[EditServizioPage] Servizio caricato:', servizio);
  console.log('[EditServizioPage] Passeggeri caricati:', passeggeri);
  console.log('[EditServizioPage] Loading:', isLoading);
  console.log('[EditServizioPage] Error:', error);

  if (isLoading) {
    return <ServizioLoading />;
  }

  if (error || !servizio) {
    return <ServizioError />;
  }

  return (
    <MainLayout>
      <div className="space-y-6 min-h-full pb-20">
        {/* Header */}
        <div className="mb-8 flex-shrink-0">
          <div className="bg-card border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Modifica Servizio
                </h1>
                <p className="text-muted-foreground mt-1">
                  Modifica le informazioni del servizio di trasporto
                </p>
              </div>
              <div className="hidden sm:flex items-center space-x-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  Modifica servizio
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 min-h-0">
          <EditServizioForm servizio={servizio} passeggeri={passeggeri} />
        </div>
      </div>
    </MainLayout>
  );
}