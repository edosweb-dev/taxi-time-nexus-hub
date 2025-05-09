
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="rounded-full h-24 w-24 taxitime-gradient flex items-center justify-center mb-6">
        <span className="text-white text-4xl font-bold">404</span>
      </div>
      <h1 className="text-3xl font-bold mb-2">Pagina non trovata</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        La pagina che stai cercando non esiste o è stata spostata.
      </p>
      <Button 
        onClick={() => navigate(-1)} 
        variant="outline" 
        className="mr-2"
      >
        Torna indietro
      </Button>
      <Button 
        onClick={() => navigate('/')}
        className="bg-taxitime-600 hover:bg-taxitime-700"
      >
        Vai alla home
      </Button>
    </div>
  );
}
