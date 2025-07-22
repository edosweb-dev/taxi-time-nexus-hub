
import React from "react";
import { Servizio } from "@/lib/types/servizi";
import { Profile } from "@/lib/types";
import { LeftColumn } from "./info/LeftColumn";
import { RightColumn } from "./info/RightColumn";
import { FirmaDisplay } from "@/components/firma/FirmaDisplay";

interface ServizioInfoTabProps {
  servizio: Servizio;
  passeggeri: any[];
  users: Profile[];
  getAziendaName: (aziendaId?: string) => string;
  getUserName: (users: Profile[], userId?: string) => string | null;
  formatCurrency: (value?: number) => string;
}

export function ServizioInfoTab({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getUserName,
  formatCurrency
}: ServizioInfoTabProps) {
  return (
    <div className="space-y-6">
      {/* Main Service Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LeftColumn 
          servizio={servizio}
          passeggeri={passeggeri}
          users={users}
          getAziendaName={getAziendaName}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
        />
        
        <RightColumn servizio={servizio} />
      </div>
      
      {/* Digital Signature Section */}
      {servizio.firma_url && (
        <div className="bg-muted/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Firma digitale</h3>
          <FirmaDisplay 
            firmaUrl={servizio.firma_url} 
            firmaTimestamp={servizio.firma_timestamp} 
          />
        </div>
      )}

      {/* Passengers Section */}
      <div className="bg-muted/30 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            Passeggeri del servizio
          </h3>
          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
            {passeggeri.length} passeggero{passeggeri.length !== 1 ? 'i' : ''}
          </span>
        </div>
        
        {passeggeri.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nessun passeggero associato a questo servizio</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {passeggeri.map((passeggero: any) => (
              <div key={passeggero.id} className="bg-background border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-foreground">{passeggero.nome_cognome}</h4>
                </div>
                
                <div className="space-y-2 text-sm">
                  {passeggero.email && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{passeggero.email}</span>
                    </div>
                  )}
                  
                  {passeggero.telefono && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Telefono:</span>
                      <span>{passeggero.telefono}</span>
                    </div>
                  )}
                  
                  {passeggero.usa_indirizzo_personalizzato && (
                    <div className="pt-2 border-t">
                      <div className="text-xs font-medium text-muted-foreground mb-2">INDIRIZZI PERSONALIZZATI</div>
                      
                      {passeggero.luogo_presa_personalizzato && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Presa:</span>
                          <span>{passeggero.luogo_presa_personalizzato}</span>
                        </div>
                      )}
                      
                      {passeggero.destinazione_personalizzato && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Destinazione:</span>
                          <span>{passeggero.destinazione_personalizzato}</span>
                        </div>
                      )}
                      
                      {passeggero.orario_presa_personalizzato && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Orario:</span>
                          <span>{passeggero.orario_presa_personalizzato}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
