import { useAuth } from "@/contexts/AuthContext";
import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";

export default function DipendenteDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  return (
    <DipendenteLayout title="Dashboard">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            Ciao, {profile?.first_name}! 👋
          </h1>
          <p className="text-muted-foreground">
            {format(new Date(), "EEEE d MMMM yyyy", { locale: it })}
          </p>
        </div>
        
        <Card className="p-8 text-center">
          <CardContent className="pt-6">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-2xl font-bold mb-2">Dashboard in Costruzione</h2>
            <p className="text-muted-foreground mb-6">
              La tua dashboard personalizzata sarà presto disponibile con statistiche,
              servizi assegnati e molto altro.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button onClick={() => navigate('/dipendente/servizi-assegnati')}>
                Vai ai Servizi
              </Button>
              <Button variant="outline" onClick={() => navigate('/dipendente/turni')}>
                Vai ai Turni
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DipendenteLayout>
  );
}
