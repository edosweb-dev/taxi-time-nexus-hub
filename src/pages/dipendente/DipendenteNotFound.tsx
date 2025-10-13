import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Search, Home, ArrowLeft } from "lucide-react";

export default function DipendenteNotFound() {
  const navigate = useNavigate();
  
  return (
    <DipendenteLayout title="Pagina Non Trovata">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-8xl mb-6">
          <Search className="w-24 h-24 text-muted-foreground mx-auto" />
        </div>
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Pagina Non Trovata</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Button onClick={() => navigate('/dipendente/dashboard')} className="min-h-[44px]">
            <Home className="mr-2 h-4 w-4" />
            Torna alla Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)} className="min-h-[44px]">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Indietro
          </Button>
        </div>
      </div>
    </DipendenteLayout>
  );
}
