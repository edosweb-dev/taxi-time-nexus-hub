import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { 
  MapPin, 
  Clock, 
  User, 
  Car, 
  Euro, 
  FileSignature,
  CheckCircle2,
  FileText,
  Edit,
  Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatoServizio } from '@/lib/types/servizi';
import { MobileButton } from '@/components/ui/mobile-button';

interface MobileServizioOptimizedProps {
  servizio: any;
  passeggeri?: any[];
  formatCurrency: (value: number | string) => string;
  getAziendaName: (id?: string) => string;
  getUserName: (users: any[], userId?: string) => string | null;
  users: any[];
  veicoloModello?: string;
  firmaDigitaleAttiva?: boolean;
  canBeEdited: boolean;
  canBeCompleted: boolean;
  canBeConsuntivato: boolean;
  canRequestSignature: boolean;
  isAdmin: boolean;
  servizioIndex: number;
  onAssegna: () => void;
  onCompleta: () => void;
  onConsuntiva: () => void;
  onModifica: () => void;
  onElimina: () => void;
  onFirmaCliente: () => void;
}

export function MobileServizioOptimized({
  servizio,
  passeggeri = [],
  formatCurrency,
  getAziendaName,
  getUserName,
  users,
  veicoloModello,
  firmaDigitaleAttiva = false,
  canBeEdited,
  canBeCompleted,
  canBeConsuntivato,
  canRequestSignature,
  isAdmin,
  servizioIndex,
  onAssegna,
  onCompleta,
  onConsuntiva,
  onModifica,
  onElimina,
  onFirmaCliente,
}: MobileServizioOptimizedProps) {
  
  // Get badge configuration
  const getBadgeConfig = () => {
    switch (servizio.stato) {
      case 'da_assegnare':
        return { variant: 'destructive' as const, label: 'Da Assegnare' };
      case 'assegnato':
        return { variant: 'secondary' as const, label: 'Assegnato' };
      case 'completato':
        return { variant: 'outline' as const, label: 'Completato' };
      case 'consuntivato':
        return { variant: 'default' as const, label: 'Consuntivato' };
      case 'annullato':
        return { variant: 'destructive' as const, label: 'Annullato' };
      default:
        return { variant: 'secondary' as const, label: servizio.stato };
    }
  };

  const badgeConfig = getBadgeConfig();

  const formatDate = (date: any) => {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return 'Data non disponibile';
    return format(d, 'dd/MM/yyyy', { locale: it });
  };

  const formatTime = (time: string) => {
    return time?.substring(0, 5) || '--:--';
  };

  // Determine progressive ID format
  const progressiveId = servizioIndex > 0 ? `TT-${String(servizioIndex).padStart(3, '0')}-${format(new Date(servizio.data_servizio), 'yyyy')}` : servizio.id_progressivo || servizio.id.substring(0, 8);

  const referenteName = getUserName(users, servizio.referente_id);
  const assignedToName = getUserName(users, servizio.assegnato_a);

  return (
    <div className="space-y-4 pb-24">
      {/* Header Card: ID, Azienda, Referente, Stato */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">{progressiveId}</h2>
          <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">Azienda:</span>
            <span className="font-medium">{getAziendaName(servizio.azienda_id)}</span>
          </div>
          
          {referenteName && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-20">Referente:</span>
              <span className="font-medium">{referenteName}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Assegnazione e Veicolo Card */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <User className="h-4 w-4" />
          Assegnazione e Veicolo
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-24">Assegnato a:</span>
            <span className="font-medium">{assignedToName || 'Non assegnato'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground w-20">Veicolo:</span>
            <span className="font-medium">{veicoloModello || 'Non assegnato'}</span>
          </div>
        </div>

        {/* CTA Assegna - only if not assigned */}
        {servizio.stato === 'da_assegnare' && isAdmin && (
          <MobileButton
            variant="secondary"
            className="w-full mt-2"
            onClick={onAssegna}
          >
            <User className="h-4 w-4" />
            Assegna Servizio
          </MobileButton>
        )}
      </Card>

      {/* Percorso Card */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Percorso
        </h3>

        <div className="space-y-4">
          {/* Partenza */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-chart-1 border-2 border-background shadow-sm" />
              <div className="w-0.5 flex-1 bg-border min-h-[40px]" />
            </div>
            <div className="flex-1 pb-2">
              <div className="text-xs text-muted-foreground font-medium mb-1">Partenza</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                <Clock className="h-3 w-3" />
                {formatTime(servizio.orario_servizio)}
              </div>
              {servizio.citta_presa && (
                <div className="font-semibold text-sm">{servizio.citta_presa}</div>
              )}
              <div className="text-sm">{servizio.indirizzo_presa}</div>
            </div>
          </div>

          {/* Fermate intermedie */}
          {passeggeri.filter((p: any) => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato).map((passeggero: any, idx: number) => (
            <div key={idx} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground border-2 border-background shadow-sm" />
                <div className="w-0.5 flex-1 bg-border min-h-[40px]" />
              </div>
              <div className="flex-1 pb-2">
                <div className="text-xs text-muted-foreground font-medium mb-1">
                  Fermata - {passeggero.nome_cognome}
                </div>
                {passeggero.orario_presa_personalizzato && (
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(passeggero.orario_presa_personalizzato)}
                  </div>
                )}
                <div className="text-sm">{passeggero.luogo_presa_personalizzato}</div>
              </div>
            </div>
          ))}

          {/* Arrivo */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-destructive border-2 border-background shadow-sm" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground font-medium mb-1">Arrivo</div>
              {servizio.citta_destinazione && (
                <div className="font-semibold text-sm">{servizio.citta_destinazione}</div>
              )}
              <div className="text-sm">{servizio.indirizzo_destinazione}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Passeggeri Card */}
      {passeggeri.length > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <User className="h-4 w-4" />
            Passeggeri ({passeggeri.length})
          </h3>
          
          <div className="space-y-2">
            {passeggeri.map((passeggero: any, index: number) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-0.5 min-w-0 text-sm">
                  <p className="font-semibold">
                    {passeggero.nome_cognome || 'Passeggero senza nome'}
                  </p>
                  {passeggero.email && (
                    <p className="text-xs text-muted-foreground">{passeggero.email}</p>
                  )}
                  {passeggero.telefono && (
                    <p className="text-xs text-muted-foreground">{passeggero.telefono}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Dettagli Economici Card */}
      <Card className="p-4 space-y-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Euro className="h-4 w-4" />
          Dettagli Economici
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Metodo di pagamento</span>
            <span className="font-medium">{servizio.metodo_pagamento || 'Non specificato'}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Incasso previsto</span>
            <span className="font-semibold text-primary">
              {formatCurrency(servizio.incasso_previsto || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Incasso ricevuto</span>
            <span className="font-semibold">
              {formatCurrency(servizio.incasso_ricevuto || 0)}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-muted-foreground">Ore effettive</span>
            <span className="font-medium">{servizio.ore_effettive || '--'}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Ore fatturate</span>
            <span className="font-medium">{servizio.ore_fatturate || '--'}</span>
          </div>
        </div>

        {/* Note - if present */}
        {servizio.note && (
          <div className="pt-3 border-t">
            <div className="text-xs text-muted-foreground font-medium mb-1">Note</div>
            <p className="text-sm bg-muted/30 p-2 rounded">{servizio.note}</p>
          </div>
        )}
      </Card>

      {/* Firma Cliente Card - only if active */}
      {firmaDigitaleAttiva && (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Firma Cliente
          </h3>

          {servizio.firma_url ? (
            <div className="space-y-2">
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Cliente ha firmato
              </Badge>
              {servizio.firma_timestamp && (
                <p className="text-xs text-muted-foreground">
                  Firmato il {format(new Date(servizio.firma_timestamp), "dd/MM/yyyy 'alle' HH:mm", { locale: it })}
                </p>
              )}
              <div className="border rounded-lg p-2 bg-muted/30">
                <img 
                  src={servizio.firma_url} 
                  alt="Firma cliente" 
                  className="max-w-full h-auto border rounded"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                In attesa firma
              </Badge>
              
              {canRequestSignature && (
                <MobileButton
                  variant="secondary"
                  className="w-full"
                  onClick={onFirmaCliente}
                >
                  <FileSignature className="h-4 w-4" />
                  Richiedi Firma Cliente
                </MobileButton>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Action Buttons - Fixed at bottom */}
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 z-40 space-y-2">
        {/* CTA Completa Servizio */}
        {canBeCompleted && !canRequestSignature && (
          <MobileButton
            variant="default"
            className="w-full"
            onClick={onCompleta}
          >
            <CheckCircle2 className="h-5 w-5" />
            Completa Servizio
          </MobileButton>
        )}

        {/* CTA Consuntiva Servizio */}
        {canBeConsuntivato && (
          <MobileButton
            variant="default"
            className="w-full"
            onClick={onConsuntiva}
          >
            <FileText className="h-5 w-5" />
            Consuntiva Servizio
          </MobileButton>
        )}

        {/* CTA Modifica | Elimina */}
        {(canBeEdited || isAdmin) && (
          <div className="flex gap-2">
            {canBeEdited && (
              <MobileButton
                variant="outline"
                className="flex-1"
                onClick={onModifica}
              >
                <Edit className="h-4 w-4" />
                Modifica
              </MobileButton>
            )}
            
            {isAdmin && (
              <MobileButton
                variant="destructive"
                className="flex-1"
                onClick={onElimina}
              >
                <Trash2 className="h-4 w-4" />
                Elimina
              </MobileButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
