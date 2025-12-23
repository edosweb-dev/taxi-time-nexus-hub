import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Car, 
  Calendar, 
  Users, 
  Palette, 
  FileText, 
  Edit,
  MapPin,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Veicolo } from '@/lib/types/veicoli';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface ServizioConVeicolo {
  id: string;
  data_servizio: string;
  orario_servizio: string;
  indirizzo_presa: string;
  indirizzo_destinazione: string;
  stato: string;
  azienda?: { nome: string } | null;
  cliente_privato_nome?: string | null;
  cliente_privato_cognome?: string | null;
}

export default function VeicoloDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch veicolo
  const { data: veicolo, isLoading: loadingVeicolo } = useQuery({
    queryKey: ['veicolo', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('veicoli')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Veicolo;
    },
    enabled: !!id,
  });

  // Fetch servizi collegati
  const { data: servizi = [], isLoading: loadingServizi } = useQuery({
    queryKey: ['veicolo-servizi', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('servizi')
        .select(`
          id,
          data_servizio,
          orario_servizio,
          indirizzo_presa,
          indirizzo_destinazione,
          stato,
          azienda:aziende(nome),
          cliente_privato_nome,
          cliente_privato_cognome
        `)
        .eq('veicolo_id', id)
        .order('data_servizio', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as ServizioConVeicolo[];
    },
    enabled: !!id,
  });

  const getStatoColor = (stato: string) => {
    switch (stato) {
      case 'completato': return 'bg-green-500/15 text-green-700 dark:text-green-400';
      case 'in_corso': return 'bg-blue-500/15 text-blue-700 dark:text-blue-400';
      case 'confermato': return 'bg-amber-500/15 text-amber-700 dark:text-amber-400';
      case 'annullato': return 'bg-red-500/15 text-red-700 dark:text-red-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatoLabel = (stato: string) => {
    switch (stato) {
      case 'completato': return 'Completato';
      case 'in_corso': return 'In corso';
      case 'confermato': return 'Confermato';
      case 'annullato': return 'Annullato';
      case 'da_confermare': return 'Da confermare';
      default: return stato;
    }
  };

  if (loadingVeicolo) {
    return (
      <MainLayout title="Dettaglio Veicolo" showBottomNav={true}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!veicolo) {
    return (
      <MainLayout title="Veicolo non trovato" showBottomNav={true}>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Veicolo non trovato</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/veicoli')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna ai veicoli
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dettaglio Veicolo" showBottomNav={true}>
      <div className="space-y-4 md:space-y-6">
        {/* Header con back button */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/veicoli')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold truncate">{veicolo.modello}</h1>
            <p className="text-sm font-mono text-primary">{veicolo.targa}</p>
          </div>
          <Badge 
            className={cn(
              "shrink-0",
              veicolo.attivo 
                ? "bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/30" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {veicolo.attivo ? 'Attivo' : 'Inattivo'}
          </Badge>
        </div>

        {/* Card dettagli veicolo */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Car className="h-5 w-5" />
              Informazioni Veicolo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  Anno
                </div>
                <p className="font-medium">{veicolo.anno || '-'}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Posti
                </div>
                <p className="font-medium">{veicolo.numero_posti || '-'}</p>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Palette className="h-3.5 w-3.5" />
                  Colore
                </div>
                <div className="flex items-center gap-2">
                  {veicolo.colore && (
                    <div 
                      className="w-4 h-4 rounded-full ring-1 ring-border"
                      style={{ backgroundColor: veicolo.colore.toLowerCase() }}
                    />
                  )}
                  <span className="font-medium">{veicolo.colore || '-'}</span>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FileText className="h-3.5 w-3.5" />
                  Note
                </div>
                <p className="font-medium text-sm">{veicolo.note || '-'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card servizi collegati */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Servizi Collegati
              </span>
              <Badge variant="secondary" className="font-normal">
                {servizi.length} servizi
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingServizi ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : servizi.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">
                  Nessun servizio associato a questo veicolo
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {servizi.map((servizio) => {
                  const clienteNome = servizio.azienda?.nome || 
                    (servizio.cliente_privato_nome && servizio.cliente_privato_cognome
                      ? `${servizio.cliente_privato_nome} ${servizio.cliente_privato_cognome}`
                      : null);

                  return (
                    <div
                      key={servizio.id}
                      onClick={() => navigate(`/servizi/${servizio.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium">
                            {format(new Date(servizio.data_servizio), 'dd MMM yyyy', { locale: it })}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {servizio.orario_servizio}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {servizio.indirizzo_presa} → {servizio.indirizzo_destinazione}
                        </p>
                        {clienteNome && (
                          <p className="text-xs text-muted-foreground">
                            {clienteNome}
                          </p>
                        )}
                      </div>
                      <Badge className={cn("shrink-0 text-[10px]", getStatoColor(servizio.stato))}>
                        {getStatoLabel(servizio.stato)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
