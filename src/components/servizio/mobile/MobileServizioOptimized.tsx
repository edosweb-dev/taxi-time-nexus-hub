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
  Pencil,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatoServizio } from '@/lib/types/servizi';
import { MobileButton } from '@/components/ui/mobile-button';
import { FinancialSection } from '@/components/servizi/dettaglio/sections/FinancialSection';
import { useAziende } from '@/hooks/useAziende';
import { PasseggeriCard } from '@/components/dipendente/servizi/dettaglio/PasseggeriCard';
import { NoteCard } from '@/components/dipendente/servizi/dettaglio/NoteCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  allPasseggeriSigned?: boolean;
  firmePasseggeri?: number;
  onAssegna: () => void;
  onCompleta: () => void;
  onConsuntiva: () => void;
  onModifica: () => void;
  onElimina: () => void;
  onFirmaCliente: () => void;
  onRimuoviAssegnazione?: () => void;
  isRimuoviAssegnazioneLoading?: boolean;
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
  allPasseggeriSigned = false,
  firmePasseggeri = 0,
  onAssegna,
  onCompleta,
  onConsuntiva,
  onModifica,
  onElimina,
  onFirmaCliente,
  onRimuoviAssegnazione,
  isRimuoviAssegnazioneLoading,
}: MobileServizioOptimizedProps) {
  const { profile } = useAuth();
  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  const { aziende } = useAziende();
  const azienda = aziende?.find(a => a.id === servizio.azienda_id);
  
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

  // Determine progressive ID format - prioritize DB value
  const progressiveId = servizio.id_progressivo || 
    (servizioIndex > 0 
      ? `TT-${String(servizioIndex).padStart(3, '0')}-${format(new Date(servizio.data_servizio), 'yyyy')}` 
      : servizio.id.substring(0, 8));

  const referenteName = getUserName(users, servizio.referente_id);
  const assignedToName = getUserName(users, servizio.assegnato_a);

  return (
    <div className="space-y-4 pb-24">
      {/* Header Card: ID, Azienda/Cliente, Referente, Stato */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary">{progressiveId}</h2>
          <Badge variant={badgeConfig.variant}>{badgeConfig.label}</Badge>
        </div>
        
        {/* Data e Orario Servizio */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground border-t pt-2">
          <Clock className="h-4 w-4" />
          <span className="font-medium">
            {formatDate(servizio.data_servizio)}
            {servizio.orario_servizio && (
              <> • ore {formatTime(servizio.orario_servizio)}</>
            )}
          </span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-20">
              {servizio.tipo_cliente === 'privato' ? 'Cliente:' : 'Azienda:'}
            </span>
            <span className="font-medium">
              {servizio.tipo_cliente === 'privato' 
                ? `${servizio.cliente_privato_nome || ''} ${servizio.cliente_privato_cognome || ''}`.trim() || 'Cliente Privato'
                : getAziendaName(servizio.azienda_id)}
            </span>
            <Badge 
              variant="outline" 
              className={servizio.tipo_cliente === 'privato' 
                ? 'bg-purple-500/10 text-purple-700 border-purple-300 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-700' 
                : 'bg-blue-500/10 text-blue-700 border-blue-300 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-700'}
            >
              {servizio.tipo_cliente === 'privato' ? 'Privato' : 'Azienda'}
            </Badge>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-24">Assegnato a:</span>
              <span className="font-medium">{assignedToName || 'Non assegnato'}</span>
            </div>
            {/* Link Rimuovi - Solo se assegnato e admin */}
            {servizio.stato === 'assegnato' && isAdmin && onRimuoviAssegnazione && (
              <button
                onClick={onRimuoviAssegnazione}
                disabled={isRimuoviAssegnazioneLoading}
                className="text-xs text-orange-600 hover:text-orange-700 font-medium disabled:opacity-50"
              >
                {isRimuoviAssegnazioneLoading ? "..." : "Rimuovi"}
              </button>
            )}
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

          {/* Fermate intermedie (esclude primo passeggero già in partenza) */}
          {passeggeri
            .sort((a: any, b: any) => ((a as any).ordine_presa || 0) - ((b as any).ordine_presa || 0))
            .slice(1) // Escludi primo passeggero
            .filter((p: any) => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato)
            .map((passeggero: any, idx: number) => {
              // Fallback località: campo dedicato → località inline → località rubrica → città servizio
              const cittaFermata = passeggero.localita_presa_personalizzato || 
                passeggero.localita_inline || 
                passeggero.localita || 
                servizio.citta_presa;
              
              return (
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
                    <div className="text-sm">
                      {cittaFermata && (
                        <span className="font-semibold text-foreground">{cittaFermata}</span>
                      )}
                      {cittaFermata && passeggero.luogo_presa_personalizzato && " • "}
                      <span className="text-muted-foreground">{passeggero.luogo_presa_personalizzato}</span>
                    </div>
                  </div>
                </div>
              );
            })}


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
      <PasseggeriCard
        passeggeri={passeggeri}
        orarioServizio={formatTime(servizio.orario_servizio)}
        indirizzoPresa={servizio.indirizzo_presa}
      />

      {/* KM Totali Card - solo per completati/consuntivati */}
      {(servizio.stato === 'completato' || servizio.stato === 'consuntivato') && 
        servizio.km_totali !== null && servizio.km_totali > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">KM Totali</span>
            </div>
            <span className="font-medium">{servizio.km_totali} km</span>
          </div>
        </Card>
      )}

      {/* Dettagli Economici Card */}
      <FinancialSection
        servizio={servizio}
        users={users}
        azienda={azienda}
        getUserName={getUserName}
        formatCurrency={formatCurrency}
      />

      {/* Note Card - Bug #19 fix */}
      {servizio.note && (
        <NoteCard note={servizio.note} />
      )}

      {/* Firma Cliente Card - only if active */}
      {firmaDigitaleAttiva && (
        <Card className="p-4 space-y-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <FileSignature className="h-4 w-4" />
            Firma Cliente
          </h3>

          {allPasseggeriSigned ? (
            <div className="space-y-3">
              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                {passeggeri.length > 1 
                  ? `Tutti i passeggeri hanno firmato (${passeggeri.length}/${passeggeri.length})`
                  : 'Cliente ha firmato'
                }
              </Badge>
              
              {/* Griglia firme multiple passeggeri */}
              {passeggeri.length > 1 && passeggeri.filter(p => p.firma_url).length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground">Firme Raccolte</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {passeggeri.filter(p => p.firma_url).map((passeggero, idx) => (
                      <div key={idx} className="border rounded-lg p-2 bg-muted/30 space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium">{passeggero.nome_cognome}</p>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                            ✓
                          </Badge>
                        </div>
                        {passeggero.firma_timestamp && (
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(passeggero.firma_timestamp), "dd/MM/yyyy HH:mm", { locale: it })}
                          </p>
                        )}
                        <div className="border rounded p-1.5 bg-white dark:bg-card">
                          <img 
                            src={passeggero.firma_url} 
                            alt={`Firma ${passeggero.nome_cognome}`}
                            className="w-full h-auto max-h-16 object-contain"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Firma singola cliente */
                servizio.firma_url && (
                  <div className="space-y-2">
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
                )
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                {passeggeri.length > 1 
                  ? `In attesa firme (${firmePasseggeri}/${passeggeri.length})`
                  : 'In attesa firma'
                }
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
      <div className="fixed bottom-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4 z-40">
        <div className="flex items-center gap-3">
          {/* CTA Primaria: Completa o Consuntiva */}
          {canBeCompleted && !canRequestSignature && (
            <MobileButton
              variant="default"
              className="flex-1"
              onClick={onCompleta}
            >
              <CheckCircle2 className="h-5 w-5" />
              Completa Servizio
            </MobileButton>
          )}

          {canBeConsuntivato && (
            <MobileButton
              variant="default"
              className="flex-1"
              onClick={onConsuntiva}
            >
              <FileText className="h-5 w-5" />
              Consuntiva
            </MobileButton>
          )}

          {/* Se nessuna CTA primaria, mostra placeholder per mantenere layout */}
          {!canBeCompleted && !canBeConsuntivato && (canBeEdited || isAdmin) && (
            <div className="flex-1" />
          )}

          {/* Menu Kebab per azioni secondarie */}
          {(canBeEdited || isAdmin) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-12 w-12 shrink-0">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {canBeEdited && (
                  <DropdownMenuItem onClick={onModifica} className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Modifica
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem 
                    onClick={onElimina} 
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Elimina
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
