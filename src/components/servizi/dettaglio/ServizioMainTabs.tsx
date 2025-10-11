import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  FileText, DollarSign, Users, FileSignature 
} from 'lucide-react';
import { Servizio, PasseggeroConDettagli } from "@/lib/types/servizi";
import { Profile, Azienda } from "@/lib/types";
import { BasicInfoSection } from "./sections/BasicInfoSection";
import { RouteSection } from "./sections/RouteSection";
import { AssignmentInfoSection } from "./sections/AssignmentInfoSection";
import { OperationalSection } from "./sections/OperationalSection";
import { FinancialSection } from "./sections/FinancialSection";
import { NotesSignatureSection } from "./sections/NotesSignatureSection";

interface ServizioMainTabsProps {
  servizio: Servizio;
  passeggeri: PasseggeroConDettagli[];
  users: Profile[];
  getAziendaName: (id?: string) => string;
  getAzienda?: (id?: string) => Azienda | undefined;
  getUserName: (users: Profile[], id?: string) => string | null;
  formatCurrency: (value?: number | null) => string;
  firmaDigitaleAttiva: boolean;
}

export function ServizioMainTabs({
  servizio,
  passeggeri,
  users,
  getAziendaName,
  getAzienda,
  getUserName,
  formatCurrency,
  firmaDigitaleAttiva,
}: ServizioMainTabsProps) {
  const [activeTab, setActiveTab] = useState('dettagli');
  
  const azienda = getAzienda ? getAzienda(servizio.azienda_id) : undefined;

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0">
        <TabsTrigger 
          value="dettagli" 
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <FileText className="mr-2 h-4 w-4" />
          Dettagli
        </TabsTrigger>
        
        <TabsTrigger 
          value="economico"
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <DollarSign className="mr-2 h-4 w-4" />
          Economico
        </TabsTrigger>
        
        <TabsTrigger 
          value="passeggeri"
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <Users className="mr-2 h-4 w-4" />
          Passeggeri
          {passeggeri.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {passeggeri.length}
            </Badge>
          )}
        </TabsTrigger>
        
        <TabsTrigger 
          value="note"
          className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
        >
          <FileSignature className="mr-2 h-4 w-4" />
          Note e Firma
        </TabsTrigger>
      </TabsList>

      {/* Tab: Dettagli */}
      <TabsContent value="dettagli" className="mt-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <BasicInfoSection
            servizio={servizio}
            getAziendaName={getAziendaName}
            users={users}
            getUserName={getUserName}
          />
          
          <RouteSection servizio={servizio} passeggeri={passeggeri} />
          
          <AssignmentInfoSection
            servizio={servizio}
            users={users}
            getUserName={getUserName}
          />
          
          <OperationalSection
            servizio={servizio}
            passeggeriCount={passeggeri.length}
          />
        </div>
      </TabsContent>

      {/* Tab: Economico */}
      <TabsContent value="economico" className="mt-6">
        <FinancialSection
          servizio={servizio}
          users={users}
          azienda={azienda}
          getUserName={getUserName}
          formatCurrency={formatCurrency}
        />
      </TabsContent>

      {/* Tab: Passeggeri */}
      <TabsContent value="passeggeri" className="mt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Passeggeri ({passeggeri.length})
            </h3>
          </div>
          
          {passeggeri.length > 0 ? (
            <div className="grid gap-4">
              {passeggeri.map((passeggero, index) => (
                <Card key={passeggero.id} className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Nome</div>
                        <div className="font-medium">{passeggero.nome_cognome}</div>
                      </div>
                      {passeggero.email && (
                        <div>
                          <div className="text-sm text-muted-foreground">Email</div>
                          <div className="font-medium">{passeggero.email}</div>
                        </div>
                      )}
                      {passeggero.telefono && (
                        <div>
                          <div className="text-sm text-muted-foreground">Telefono</div>
                          <div className="font-medium">{passeggero.telefono}</div>
                        </div>
                      )}
                      {passeggero.luogo_presa_personalizzato && (
                        <div>
                          <div className="text-sm text-muted-foreground">Punto Ritiro</div>
                          <div className="font-medium">{passeggero.luogo_presa_personalizzato}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-muted-foreground">
              Nessun passeggero associato
            </Card>
          )}
        </div>
      </TabsContent>

      {/* Tab: Note e Firma */}
      <TabsContent value="note" className="mt-6">
        <NotesSignatureSection
          servizio={servizio}
          firmaDigitaleAttiva={firmaDigitaleAttiva}
        />
      </TabsContent>
    </Tabs>
  );
}
