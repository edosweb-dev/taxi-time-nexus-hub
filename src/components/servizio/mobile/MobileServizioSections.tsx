import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Euro, FileText, Settings, History, User } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface MobileServizioSectionsProps {
  servizio: any;
  passeggeri?: any[];
  formatCurrency: (value: number | string) => string;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

function CollapsibleSection({ title, icon, children, defaultOpen = false, priority = 'medium' }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const getPriorityStyles = () => {
    switch (priority) {
      case 'high':
        return 'border-primary/20 bg-primary/5';
      case 'medium':  
        return 'border-border bg-card';
      case 'low':
        return 'border-muted bg-muted/50';
      default:
        return 'border-border bg-card';
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`collapsible-section ${getPriorityStyles()}`}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="section-trigger">
            <div className="section-header">
              <div className="section-title">
                {icon}
                <span>{title}</span>
              </div>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 section-chevron" />
              ) : (
                <ChevronDown className="w-4 h-4 section-chevron" />
              )}
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="section-content">
          {children}
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function MobileServizioSections({ servizio, passeggeri, formatCurrency }: MobileServizioSectionsProps) {
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
  return (
    <div className="mobile-sections">
      {/* Dettagli Operativi - Priority High */}
      <CollapsibleSection
        title="Dettagli Operativi"
        icon={<Settings className="w-4 h-4" />}
        defaultOpen={true}
        priority="high"
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

      {/* Informazioni Finanziarie - Priority Medium */}
      <CollapsibleSection
        title="Informazioni Finanziarie"
        icon={<Euro className="w-4 h-4" />}
        priority="medium"
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

      {/* Passeggeri - Priority Medium se presenti */}
      {passeggeri && passeggeri.length > 0 && (
        <CollapsibleSection
          title={`Passeggeri (${passeggeri.length})`}
          icon={<User className="w-4 h-4" />}
          priority="medium"
        >
          <div className="passeggeri-list">
            {passeggeri.map((passeggero, index) => (
              <div key={index} className="passeggero-item">
                <div className="passeggero-info">
                  <span className="passeggero-nome">{passeggero.nome} {passeggero.cognome}</span>
                  {passeggero.telefono && (
                    <span className="passeggero-telefono">{passeggero.telefono}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* Documentazione - Priority Low - Solo se ci sono note */}
      {servizio.note && (
        <CollapsibleSection
          title="Note del Servizio"
          icon={<FileText className="w-4 h-4" />}
          priority="low"
        >
          <div className="documentation">
            <div className="doc-section">
              <p>{servizio.note}</p>
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* Storico - Priority Low */}
      <CollapsibleSection
        title="Storico Modifiche"
        icon={<History className="w-4 h-4" />}
        priority="low"
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
    </div>
  );
}