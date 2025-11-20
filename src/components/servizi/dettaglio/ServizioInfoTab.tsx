
import React from "react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { getStatoBadge, getStateIcon } from "@/components/servizi/utils/statusUtils";
import {
  BasicInfoSection,
  RouteSection,
  AssignmentInfoSection,
  FinancialSection,
  OperationalSection,
  NotesSignatureSection,
} from "./sections";

interface ServizioInfoTabProps {
  servizio: Servizio;
  passeggeri: any[];
  users: Profile[];
  getAziendaName: (aziendaId?: string) => string;
  getAzienda?: (aziendaId?: string) => any;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
  firmaDigitaleAttiva: boolean;
}

export function ServizioInfoTab({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getAzienda,
  getUserName,
  formatCurrency,
  firmaDigitaleAttiva,
}: ServizioInfoTabProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Row 1: Informazioni principali | Assegnazione e veicolo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <BasicInfoSection 
          servizio={servizio}
          users={users}
          getAziendaName={getAziendaName}
          getUserName={getUserName}
        />
        
        <AssignmentInfoSection 
          servizio={servizio}
          users={users}
          getUserName={getUserName}
        />
      </div>
      
      {/* Row 2: Percorso del servizio | Dati operativi */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 md:gap-6">
        <div className="lg:col-span-7">
          <RouteSection servizio={servizio} passeggeri={passeggeri} />
        </div>
        
        <div className="lg:col-span-3">
          <OperationalSection 
            servizio={servizio}
            passeggeriCount={passeggeri.length}
          />
        </div>
      </div>
      
      {/* Row 3: Passeggeri | Informazioni finanziarie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Passengers Summary - Mobile optimized */}
        <div className="bg-card border rounded-lg p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base md:text-lg font-semibold">Passeggeri</div>
            <span className="bg-primary/10 text-primary px-2 md:px-3 py-1 md:py-2 rounded-full text-xs md:text-sm font-medium">
              {passeggeri.length}
            </span>
          </div>
          
          {passeggeri.length === 0 ? (
            <div className="text-center py-6 md:py-8">
              <div className="text-3xl md:text-4xl mb-2">👥</div>
              <p className="text-sm text-muted-foreground">Nessun passeggero</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-64 overflow-y-auto">
              {passeggeri.map((passeggero: any, index: number) => {
                const orarioPresa = passeggero.orario_presa_personalizzato || servizio.orario_servizio;
                const haPresaPersonalizzata = passeggero.usa_indirizzo_personalizzato && passeggero.luogo_presa_personalizzato;
                
                return (
                  <div key={passeggero.id} className="bg-muted/30 rounded-lg p-3 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <div className="font-medium text-sm truncate">{passeggero.nome_cognome}</div>
                    </div>
                    
                    {/* Orario di presa */}
                    <div className="flex items-center gap-1.5 mb-1 text-xs text-muted-foreground">
                      <span className="font-medium">Presa:</span>
                      <span>{orarioPresa}</span>
                      {haPresaPersonalizzata && (
                        <span className="text-primary text-[10px]">● Intermedia</span>
                      )}
                    </div>
                    
                    {(passeggero.email || passeggero.telefono) && (
                      <div className="text-xs space-y-1 text-muted-foreground">
                        {passeggero.email && <div className="truncate">{passeggero.email}</div>}
                        {passeggero.telefono && <div>{passeggero.telefono}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <FinancialSection 
          servizio={servizio}
          users={users}
          azienda={getAzienda?.(servizio.azienda_id)}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
        />
      </div>
      
      {/* Note e firma - Full width */}
      <NotesSignatureSection 
        servizio={servizio}
        firmaDigitaleAttiva={firmaDigitaleAttiva}
      />
    </div>
  );
}
