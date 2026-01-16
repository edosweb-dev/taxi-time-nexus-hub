import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Euro, FileText, Settings, History, User, Edit3 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useVeicoli } from '@/hooks/useVeicoli';
import { useServizioWorkflow, getPriorityStyles, type SectionPriority } from '@/hooks/useServizioWorkflow';
import { useAuth } from '@/contexts/AuthContext';
import { StatoServizio } from '@/lib/types/servizi';

interface MobileServizioSectionsProps {
  servizio: any;
  passeggeri?: any[];
  formatCurrency: (value: number | string) => string;
  users: any[];
  getUserName: (users: any[], userId?: string) => string | null;
  firmaDigitaleAttiva?: boolean;
  allPasseggeriSigned?: boolean;
  firmePasseggeri?: number;
}

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  priority?: SectionPriority;
  isVisible?: boolean;
}

function CollapsibleSection({ 
  id,
  title, 
  icon, 
  children, 
  defaultOpen = false, 
  priority = 'important',
  isVisible = true 
}: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-open when defaultOpen changes (context-aware)
  useEffect(() => {
    if (defaultOpen && !isOpen) {
      setIsOpen(true);
      
      // Auto-scroll to critical sections after a brief delay
      if (priority === 'critical') {
        setTimeout(() => {
          sectionRef.current?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
          });
        }, 300);
      }
    }
  }, [defaultOpen, priority]);

  if (!isVisible) return null;

  const styles = getPriorityStyles(priority);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div 
        ref={sectionRef}
        className={`collapsible-section ${styles.bg} ${styles.border} transition-all duration-300`}
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="section-trigger w-full">
            <div className="section-header w-full">
              <div className="section-title">
                {icon}
                <span className="font-medium">{title}</span>
                {priority === 'critical' && (
                  <Badge variant="destructive" className="ml-2 text-[10px] px-1.5 py-0">
                    Importante
                  </Badge>
                )}
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 section-chevron text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 section-chevron text-muted-foreground" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="section-content animate-accordion-down">
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function MobileServizioSections({ 
  servizio, 
  passeggeri = [], 
  formatCurrency, 
  users, 
  getUserName,
  firmaDigitaleAttiva = false,
  allPasseggeriSigned = false,
  firmePasseggeri = 0,
}: MobileServizioSectionsProps) {
  const { veicoli } = useVeicoli();
  const { profile } = useAuth();
  const veicolo = (veicoli || []).find(v => v.id === servizio.veicolo_id);
  
  // Get context-aware workflow configuration
  const workflow = useServizioWorkflow(
    servizio.stato as StatoServizio,
    profile?.role || 'dipendente',
    passeggeri.length > 0,
    !!servizio.note
  );

  const safeFormat = (value?: string | Date, fmt: string = 'dd/MM HH:mm') => {
    if (!value) return '—';
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return '—';
    try {
      return format(d, fmt);
    } catch {
      return '—';
    }
  };

  // Helper to get section config
  const getSectionConfig = (id: string) => {
    return workflow.sections.find(s => s.id === id);
  };

  const operationalConfig = getSectionConfig('operational');
  const financialConfig = getSectionConfig('financial');
  const passengersConfig = getSectionConfig('passengers');
  const notesConfig = getSectionConfig('notes');
  const historyConfig = getSectionConfig('history');
  
  // Check if signature section should be visible
  const hasSignatureContent = firmaDigitaleAttiva && (servizio.firma_url || servizio.firma_timestamp);

  return (
    <div className="mobile-sections space-y-3 pb-8">

      {/* Dettagli Operativi - Context-aware */}
      {operationalConfig?.isVisible && (
        <CollapsibleSection
          id="operational"
          title={operationalConfig.title}
          icon={<Settings className="w-4 h-4" />}
          defaultOpen={operationalConfig.isAutoOpen}
          priority={operationalConfig.priority}
          isVisible={operationalConfig.isVisible}
        >
        <div className="operational-details">
          {/* Percorso */}
          <div className="detail-row full-width">
            <span className="detail-label">Partenza</span>
            <div className="detail-value">
              {servizio.citta_presa && <div className="font-semibold">{servizio.citta_presa}</div>}
              <div>{servizio.indirizzo_presa}</div>
            </div>
          </div>

          {/* Fermate intermedie */}
          {passeggeri && passeggeri.some((p: any) => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato) && (
            <div className="detail-row full-width">
              <span className="detail-label">Fermate intermedie</span>
              <div className="space-y-2">
                {passeggeri
                  .filter((p: any) => p.usa_indirizzo_personalizzato && p.luogo_presa_personalizzato)
                  .map((p: any, idx: number) => (
                    <div key={idx} className="detail-value text-sm">
                      <div className="font-medium text-muted-foreground">{p.nome_cognome}</div>
                      <div>
                        {p.luogo_presa_personalizzato}
                        {/* ✅ FIX BUG #41: Aggiungi località */}
                        {p.localita_presa_personalizzato && `, ${p.localita_presa_personalizzato}`}
                      </div>
                      {p.orario_presa_personalizzato && (
                        <div className="text-xs text-muted-foreground">
                          Orario: {p.orario_presa_personalizzato.substring(0, 5)}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="detail-row full-width">
            <span className="detail-label">Destinazione</span>
            <div className="detail-value">
              {servizio.citta_destinazione && <div className="font-semibold">{servizio.citta_destinazione}</div>}
              <div>{servizio.indirizzo_destinazione}</div>
            </div>
          </div>

          <div className="detail-row">
            <span className="detail-label">Tipo Servizio</span>
            <span className="detail-value">{servizio.tipo_servizio || 'Standard'}</span>
          </div>
          
          <div className="detail-row">
            <span className="detail-label">Metodo Pagamento</span>
            <span className="detail-value">{servizio.metodo_pagamento || 'Da definire'}</span>
          </div>

          {/* Informazioni veicolo */}
          <div className="detail-row">
            <span className="detail-label">Veicolo</span>
            <span className="detail-value">
              {veicolo ? `${veicolo.modello} (${veicolo.targa})` : 'Da assegnare'}
            </span>
          </div>

          {/* Ore lavorate se disponibili */}
          {servizio.ore_lavorate && (
            <div className="detail-row">
              <span className="detail-label">Ore Lavorate</span>
              <span className="detail-value">{servizio.ore_lavorate} ore</span>
            </div>
          )}

          {/* Ore effettive se disponibili */}
          {servizio.ore_effettive && (
            <div className="detail-row">
              <span className="detail-label">Ore Effettive</span>
              <span className="detail-value">{servizio.ore_effettive} ore</span>
            </div>
          )}
          
          {passeggeri && passeggeri.length > 0 && (
            <div className="detail-row">
              <span className="detail-label">Passeggeri</span>
              <span className="detail-value">{passeggeri.length}</span>
            </div>
          )}
          
          {servizio.note && (
            <div className="detail-row full-width">
              <span className="detail-label">Note Speciali</span>
              <div className="detail-note">{servizio.note}</div>
            </div>
          )}
        </div>
        </CollapsibleSection>
      )}

      {/* Informazioni Finanziarie - Context-aware */}
      {financialConfig?.isVisible && (
        <CollapsibleSection
          id="financial"
          title={financialConfig.title}
          icon={<Euro className="w-4 h-4" />}
          defaultOpen={financialConfig.isAutoOpen}
          priority={financialConfig.priority}
          isVisible={financialConfig.isVisible}
        >
        <div className="financial-details">
          <div className="financial-summary">
            <div className="price-main">
              <span className="price-label">Prezzo Totale</span>
              <span className="price-value">{formatCurrency(servizio.prezzo || 0)}</span>
            </div>
          </div>
          
          <div className="financial-breakdown">
            <div className="breakdown-row">
              <span>Tariffa Base</span>
              <span>{formatCurrency(servizio.prezzo || 0)}</span>
            </div>
            
            <div className="breakdown-row total">
              <span>Totale</span>
              <span>{formatCurrency(servizio.prezzo || 0)}</span>
            </div>
          </div>
        </div>
        </CollapsibleSection>
      )}

      {/* Passeggeri - Context-aware */}
      {passengersConfig?.isVisible && passeggeri && passeggeri.length > 0 && (
        <CollapsibleSection
          id="passengers"
          title={`${passengersConfig.title} (${passeggeri.length})`}
          icon={<User className="w-4 h-4" />}
          defaultOpen={passengersConfig.isAutoOpen}
          priority={passengersConfig.priority}
          isVisible={passengersConfig.isVisible}
        >
          <div className="space-y-3">
            {passeggeri.map((passeggero, index) => (
              <div key={index} className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                <User className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5 min-w-0">
                  <p className="font-semibold text-base text-foreground">
                    {passeggero.nome_cognome || 'Passeggero senza nome'}
                  </p>
                  {passeggero.email && (
                    <p className="text-sm text-muted-foreground">{passeggero.email}</p>
                  )}
                  {passeggero.telefono && (
                    <p className="text-sm text-muted-foreground">{passeggero.telefono}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Note del Servizio - Context-aware */}
      {notesConfig?.isVisible && servizio.note && (
        <CollapsibleSection
          id="notes"
          title={notesConfig.title}
          icon={<FileText className="w-4 h-4" />}
          defaultOpen={notesConfig.isAutoOpen}
          priority={notesConfig.priority}
          isVisible={notesConfig.isVisible}
        >
          <div className="documentation">
            <div className="doc-section">
              <p>{servizio.note}</p>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Firma Cliente - Context-aware */}
      {firmaDigitaleAttiva && (
        <CollapsibleSection
          id="signature"
          title="Firma Cliente"
          icon={<Edit3 className="w-4 h-4" />}
          defaultOpen={hasSignatureContent}
          priority="important"
          isVisible={true}
        >
          <div className="space-y-4">
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
                      {passeggeri.filter(p => p.firma_url).map((passeggero: any, idx: number) => (
                        <div key={idx} className="border rounded-lg p-2 bg-muted/30 space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium">{passeggero.nome_cognome}</p>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400">
                              ✓ Firmato
                            </Badge>
                          </div>
                          {passeggero.firma_timestamp && (
                            <p className="text-[10px] text-muted-foreground">
                              {safeFormat(passeggero.firma_timestamp, "dd/MM/yyyy 'alle' HH:mm")}
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
                        <span className="text-xs text-muted-foreground">
                          il {safeFormat(servizio.firma_timestamp, "dd/MM/yyyy 'alle' HH:mm")}
                        </span>
                      )}
                      <div className="border rounded-lg p-3 bg-muted/30">
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
              <div className="text-center py-4">
                <Badge variant="secondary" className="mb-2 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                  {passeggeri.length > 1 
                    ? `In attesa firme (${firmePasseggeri}/${passeggeri.length})`
                    : 'In attesa firma cliente'
                  }
                </Badge>
                <div className="text-xs text-muted-foreground mt-2">
                  {passeggeri.length > 1
                    ? `${firmePasseggeri} su ${passeggeri.length} passeggeri hanno firmato`
                    : 'Il cliente non ha ancora firmato digitalmente il servizio'
                  }
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Storico Modifiche - Context-aware */}
      {historyConfig?.isVisible && (
        <CollapsibleSection
          id="history"
          title={historyConfig.title}
          icon={<History className="w-4 h-4" />}
          defaultOpen={historyConfig.isAutoOpen}
          priority={historyConfig.priority}
          isVisible={historyConfig.isVisible}
        >
        <div className="history-timeline">
          <div className="history-item">
            <div className="history-time">
              {safeFormat(servizio.created_at, 'dd/MM HH:mm')}
            </div>
            <div className="history-content">
              <span className="history-action">Servizio creato</span>
              <span className="history-user">Sistema</span>
            </div>
          </div>
          
          {servizio.updated_at !== servizio.created_at && (
            <div className="history-item">
              <div className="history-time">
                {safeFormat(servizio.updated_at, 'dd/MM HH:mm')}
              </div>
              <div className="history-content">
                <span className="history-action">Ultima modifica</span>
                <span className="history-user">Sistema</span>
              </div>
            </div>
          )}
        </div>
        </CollapsibleSection>
      )}
    </div>
  );
}