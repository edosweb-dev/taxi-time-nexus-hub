import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight, FileText } from 'lucide-react';

export default function ServizioConfermatoPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const servizioId = searchParams.get('id');
  const [countdown, setCountdown] = useState(5);

  // Countdown automatico per redirect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/dashboard-cliente/servizi');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <MainLayout>
      <div className="container mx-auto py-12 px-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-12 pb-8">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="rounded-full bg-green-100 p-4">
                <CheckCircle2 className="h-16 w-16 text-green-600" />
              </div>

              {/* Titolo */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-green-600">
                  Servizio Richiesto con Successo!
                </h1>
                <p className="text-xl text-muted-foreground">
                  Il servizio è stato preso in carico dal nostro team
                </p>
              </div>

              {/* Messaggio */}
              <div className="bg-muted/50 rounded-lg p-6 space-y-3 w-full">
                <p className="text-sm text-muted-foreground">
                  ✅ La tua richiesta di servizio è stata registrata correttamente
                </p>
                <p className="text-sm text-muted-foreground">
                  📧 Riceverai una notifica quando il servizio verrà assegnato a un conducente
                </p>
                <p className="text-sm text-muted-foreground">
                  📊 Puoi monitorare lo stato del servizio nella sezione "I Miei Servizi"
                </p>
                {servizioId && (
                  <p className="text-xs text-muted-foreground mt-4 font-mono">
                    ID Servizio: {servizioId.slice(0, 8)}
                  </p>
                )}
              </div>

              {/* Countdown */}
              <p className="text-sm text-muted-foreground">
                Verrai reindirizzato automaticamente tra <span className="font-bold">{countdown}</span> secondi...
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/dashboard-cliente/servizi')}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Vai ai Miei Servizi
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard-cliente/nuovo-servizio')}
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Richiedi Altro Servizio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
