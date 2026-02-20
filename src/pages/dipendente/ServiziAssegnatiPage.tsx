import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { DipendenteLayout } from "@/components/layouts/DipendenteLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useServiziAssegnati } from "@/hooks/dipendente/useServiziAssegnati";
import { cn } from "@/lib/utils";
import {
  Circle, CheckCircle, Clock, MapPin, Navigation, Car, Eye, Calendar as CalendarIcon
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ServizioWithRelations } from "@/lib/api/dipendente/servizi";

export default function ServiziAssegnatiPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'da_completare' | 'completati'>('da_completare');

  const { data, isLoading } = useServiziAssegnati({});

  const servizi = useMemo(() =>
    data?.pages.flatMap(page => page.data) || [],
    [data]
  );

  const serviziDaCompletare = useMemo(() =>
    servizi.filter(s => ['assegnato', 'in_corso'].includes(s.stato)),
    [servizi]
  );

  const serviziCompletati = useMemo(() =>
    servizi.filter(s => ['completato', 'consuntivato'].includes(s.stato)),
    [servizi]
  );

  return (
    <DipendenteLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="px-4 md:px-0">
          <h1 className="text-xl md:text-2xl font-bold">I Miei Servizi</h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full">
          <div className="px-4 md:px-0">
            <TabsList className="w-full h-12 grid grid-cols-2">
              <TabsTrigger value="da_completare" className="h-10 text-sm font-semibold gap-1.5">
                <Circle className="h-4 w-4" />
                Da fare ({serviziDaCompletare.length})
              </TabsTrigger>
              <TabsTrigger value="completati" className="h-10 text-sm font-semibold gap-1.5">
                <CheckCircle className="h-4 w-4" />
                Completati ({serviziCompletati.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="da_completare" className="mt-4 px-4 md:px-0 space-y-3">
            {isLoading ? (
              <LoadingSkeleton />
            ) : serviziDaCompletare.length === 0 ? (
              <EmptyState
                title="Nessun servizio da completare"
                description="Ottimo! Non hai servizi in attesa al momento."
              />
            ) : (
              serviziDaCompletare.map(servizio => (
                <ServizioCard
                  key={servizio.id}
                  servizio={servizio}
                  onDettagli={() => navigate(`/servizi/${servizio.id}`)}
                  onCompleta={() => navigate(`/dipendente/servizi-assegnati/${servizio.id}/completa`)}
                  showCompleteButton
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="completati" className="mt-4 px-4 md:px-0 space-y-3">
            {isLoading ? (
              <LoadingSkeleton />
            ) : serviziCompletati.length === 0 ? (
              <EmptyState
                title="Nessun servizio completato"
                description="I servizi completati appariranno qui."
              />
            ) : (
              serviziCompletati.map(servizio => (
                <ServizioCard
                  key={servizio.id}
                  servizio={servizio}
                  onDettagli={() => navigate(`/servizi/${servizio.id}`)}
                  showCompleteButton={false}
                />
              ))
            )}
          </TabsContent>
        </Tabs>

        <div className="h-20 md:h-4" aria-hidden="true" />
      </div>
    </DipendenteLayout>
  );
}

// --- Card Servizio ---
function ServizioCard({
  servizio,
  onDettagli,
  onCompleta,
  showCompleteButton
}: {
  servizio: ServizioWithRelations;
  onDettagli: () => void;
  onCompleta?: () => void;
  showCompleteButton: boolean;
}) {
  const getStatoBadge = (stato: string) => {
    const configs: Record<string, { label: string; className: string; icon: LucideIcon }> = {
      assegnato: { label: 'Da completare', className: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800', icon: Circle },
      in_corso: { label: 'In corso', className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800', icon: Clock },
      completato: { label: 'Completato', className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800', icon: CheckCircle },
      consuntivato: { label: 'Consuntivato', className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-800', icon: CheckCircle },
    };
    return configs[stato] || configs.assegnato;
  };

  const badge = getStatoBadge(servizio.stato);
  const BadgeIcon = badge.icon;

  const cliente = servizio.tipo_cliente === 'privato'
    ? `${servizio.cliente_privato_nome || ''} ${servizio.cliente_privato_cognome || ''}`.trim() || 'Cliente privato'
    : servizio.azienda_nome || servizio.aziende?.nome || 'Azienda';

  const getBorderColor = (stato: string) => {
    const colors: Record<string, string> = {
      assegnato: 'border-l-4 border-l-yellow-400',
      in_corso: 'border-l-4 border-l-blue-400',
      completato: 'border-l-4 border-l-green-400',
      consuntivato: 'border-l-4 border-l-green-400',
    };
    return colors[stato] || colors.assegnato;
  };

  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-md active:scale-[0.98] transition-all duration-200',
        getBorderColor(servizio.stato)
      )}
      onClick={onDettagli}
    >
      <CardContent className="p-4 space-y-3">
        {/* Header: Date + Time + Badge */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm text-muted-foreground capitalize">
              {format(new Date(servizio.data_servizio + 'T00:00:00'), 'EEEE d MMM', { locale: it })}
            </p>
            <span className="text-xl font-bold tabular-nums flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {servizio.orario_servizio?.slice(0, 5)}
            </span>
          </div>
          <span className={cn(
            'px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5',
            badge.className
          )}>
            <BadgeIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{badge.label}</span>
          </span>
        </div>

        {/* Client */}
        <p className="font-semibold text-base">{cliente}</p>

        {/* Route */}
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate">
                {servizio.citta_presa && <span className="text-muted-foreground">{servizio.citta_presa} • </span>}
                {servizio.indirizzo_presa}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Navigation className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate">
                {servizio.citta_destinazione && <span className="text-muted-foreground">{servizio.citta_destinazione} • </span>}
                {servizio.indirizzo_destinazione}
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle */}
        {servizio.veicolo_modello && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-2 rounded-md">
            <Car className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">
              {servizio.veicolo_modello}{servizio.veicolo_targa && ` • ${servizio.veicolo_targa}`}
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
          {showCompleteButton && onCompleta && (
            <Button size="lg" className="flex-1 h-12 text-base font-semibold" onClick={onCompleta}>
              <CheckCircle className="h-5 w-5 mr-2" />
              Completa
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className={cn('h-12 text-base font-semibold', showCompleteButton ? 'flex-1' : 'w-full')}
            onClick={onDettagli}
          >
            <Eye className="h-5 w-5 mr-2" />
            Dettagli
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Empty State ---
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <Card>
      <CardContent className="py-16 px-4 text-center">
        <div className="mb-4 text-muted-foreground">
          <CalendarIcon className="h-16 w-16 mx-auto" />
        </div>
        <p className="text-xl font-semibold mb-2">{title}</p>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">{description}</p>
      </CardContent>
    </Card>
  );
}

// --- Loading Skeleton ---
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
