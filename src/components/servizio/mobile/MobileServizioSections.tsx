import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp, Euro, FileText, Settings, History, User, AlertCircle } from 'lucide-react';
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

export function MobileServizioSections({ servizio, passeggeri = [], formatCurrency, users, getUserName }: MobileServizioSectionsProps) {
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

  return (
    <div className="mobile-sections space-y-3 pb-8">
      {/* Context-aware info banner */}
      {workflow.autoOpenSections.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2 animate-fade-in">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Sezioni rilevanti aperte automaticamente</strong> in base allo stato del servizio
            </div>
          </div>
        </div>
      )}

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
                    {passeggero.nome} {passeggero.cognome}
                  </p>
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