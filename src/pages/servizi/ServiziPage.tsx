import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layouts/MainLayout";
import { useServizi } from "@/hooks/useServizi";
import { useAziende } from "@/hooks/useAziende";
import { useUsers } from "@/hooks/useUsers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Calendar, MapPin, Loader2, Search, Filter } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import type { Servizio } from "@/lib/types/servizi";

export default function ServiziPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const { servizi = [], isLoading, error } = useServizi();
  const { aziende = [] } = useAziende();
  const { users = [] } = useUsers();
  
  const [activeTab, setActiveTab] = useState("tutti");
  const [filters, setFilters] = useState({
    azienda: "",
    referente: "",
    stato: "",
    searchTerm: ""
  });

  // Filter servizi based on filters
  const filteredServizi = useMemo(() => {
    return servizi.filter((s: Servizio) => {
      if (filters.azienda && s.azienda_id !== filters.azienda) return false;
      if (filters.referente && s.referente_id !== filters.referente) return false;
      if (filters.stato && s.stato !== filters.stato) return false;
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        return (
          s.aziende?.nome?.toLowerCase().includes(term) ||
          s.numero_commessa?.toLowerCase().includes(term) ||
          s.indirizzo_presa?.toLowerCase().includes(term) ||
          s.indirizzo_destinazione?.toLowerCase().includes(term)
        );
      }
      return true;
    });
  }, [servizi, filters]);

  // Group servizi by status for mobile tabs
  const serviziByStatus = useMemo(() => ({
    tutti: filteredServizi,
    da_assegnare: filteredServizi.filter((s: Servizio) => s.stato === 'da_assegnare'),
    assegnato: filteredServizi.filter((s: Servizio) => s.stato === 'assegnato'),
    completato: filteredServizi.filter((s: Servizio) => s.stato === 'completato'),
    consuntivato: filteredServizi.filter((s: Servizio) => s.stato === 'consuntivato')
  }), [filteredServizi]);

  const getStatusColor = (stato: string) => {
    const colors: Record<string, string> = {
      da_assegnare: 'bg-yellow-500 text-white',
      assegnato: 'bg-blue-500 text-white',
      completato: 'bg-green-500 text-white',
      consuntivato: 'bg-purple-500 text-white',
      annullato: 'bg-red-500 text-white'
    };
    return colors[stato] || 'bg-gray-500 text-white';
  };

  const getStatusLabel = (stato: string) => {
    const labels: Record<string, string> = {
      da_assegnare: 'Da Assegnare',
      assegnato: 'Assegnato',
      completato: 'Completato',
      consuntivato: 'Consuntivato',
      annullato: 'Annullato'
    };
    return labels[stato] || stato;
  };

  const renderMobileCard = (servizio: Servizio) => (
    <Card 
      key={servizio.id}
      className="w-full p-3 sm:p-4 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => navigate(`/servizi/${servizio.id}`)}
    >
      {/* Card Header: Azienda + Status */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base truncate">
            {servizio.aziende?.nome || 'N/A'}
          </h3>
          {servizio.numero_commessa && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Commessa: {servizio.numero_commessa}
            </p>
          )}
        </div>
        <Badge className={getStatusColor(servizio.stato)}>
          {getStatusLabel(servizio.stato)}
        </Badge>
      </div>

      {/* Card Body: Info Servizio */}
      <div className="space-y-2 text-sm">
        {/* Data e Orario */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1">
            {format(new Date(servizio.data_servizio), 'dd/MM/yyyy', { locale: it })}
          </span>
          <span className="text-xs text-muted-foreground">
            {servizio.orario_servizio}
          </span>
        </div>

        {/* Percorso */}
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-1">
            <p className="truncate text-xs">
              <span className="text-muted-foreground">Da:</span> {servizio.indirizzo_presa}
            </p>
            <p className="truncate text-xs">
              <span className="text-muted-foreground">A:</span> {servizio.indirizzo_destinazione}
            </p>
          </div>
        </div>
      </div>

      {/* Card Footer: Pagamento + Importo */}
      <div className="flex justify-between items-center mt-3 pt-3 border-t">
        <span className="text-xs uppercase text-muted-foreground">
          {servizio.metodo_pagamento}
        </span>
        {servizio.incasso_previsto && (
          <span className="font-semibold text-primary">
            €{servizio.incasso_previsto.toFixed(2)}
          </span>
        )}
      </div>
    </Card>
  );

  return (
    <MainLayout>
      {/* CRITICAL: Usa ESATTAMENTE lo stesso pattern di ServizioCreaPage */}
      <div className="w-full max-w-full overflow-x-hidden p-3 sm:p-4 md:p-6 lg:p-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Servizi</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              Gestisci tutti i servizi dell'azienda
            </p>
          </div>
          <Button 
            onClick={() => navigate("/servizi/crea")}
            size="default"
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Servizio
          </Button>
        </div>

        {/* Filtri Desktop ONLY */}
        {!isMobile && (
          <Card className="w-full p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4" />
              <h2 className="font-semibold">Filtri</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Ricerca */}
              <div>
                <Label htmlFor="search">Cerca</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Azienda, commessa..."
                    className="pl-9"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  />
                </div>
              </div>

              {/* Azienda */}
              <div>
                <Label htmlFor="azienda">Azienda</Label>
                <Select 
                  value={filters.azienda} 
                  onValueChange={(v) => setFilters({...filters, azienda: v})}
                >
                  <SelectTrigger id="azienda">
                    <SelectValue placeholder="Tutte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutte</SelectItem>
                    {aziende.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>{a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Referente */}
              <div>
                <Label htmlFor="referente">Referente</Label>
                <Select 
                  value={filters.referente} 
                  onValueChange={(v) => setFilters({...filters, referente: v})}
                >
                  <SelectTrigger id="referente">
                    <SelectValue placeholder="Tutti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti</SelectItem>
                    {users.filter((u: any) => u.role === 'cliente').map((u: any) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.first_name} {u.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Stato */}
              <div>
                <Label htmlFor="stato">Stato</Label>
                <Select 
                  value={filters.stato} 
                  onValueChange={(v) => setFilters({...filters, stato: v})}
                >
                  <SelectTrigger id="stato">
                    <SelectValue placeholder="Tutti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti</SelectItem>
                    <SelectItem value="da_assegnare">Da Assegnare</SelectItem>
                    <SelectItem value="assegnato">Assegnato</SelectItem>
                    <SelectItem value="completato">Completato</SelectItem>
                    <SelectItem value="consuntivato">Consuntivato</SelectItem>
                    <SelectItem value="annullato">Annullato</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Reset Filtri */}
            {(filters.azienda || filters.referente || filters.stato || filters.searchTerm) && (
              <Button 
                variant="ghost" 
                size="sm"
                className="mt-4"
                onClick={() => setFilters({ azienda: "", referente: "", stato: "", searchTerm: "" })}
              >
                Reset Filtri
              </Button>
            )}
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="w-full p-8 text-center">
            <p className="text-destructive">Errore nel caricamento dei servizi</p>
          </Card>
        )}

        {/* Content */}
        {!isLoading && !error && (
          <>
            {/* MOBILE: Tabs + Card List */}
            {isMobile ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="tutti">
                    Tutti
                    <span className="ml-1.5 text-xs">({serviziByStatus.tutti.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="da_assegnare">
                    <span className="hidden sm:inline">Da Assegnare</span>
                    <span className="sm:hidden">Da Ass.</span>
                    <span className="ml-1.5 text-xs">({serviziByStatus.da_assegnare.length})</span>
                  </TabsTrigger>
                  <TabsTrigger value="assegnato">
                    <span className="hidden sm:inline">Assegnati</span>
                    <span className="sm:hidden">Ass.</span>
                    <span className="ml-1.5 text-xs">({serviziByStatus.assegnato.length})</span>
                  </TabsTrigger>
                </TabsList>

                {/* Tab Content - TUTTI */}
                <TabsContent value="tutti" className="mt-0">
                  <div className="w-full space-y-3">
                    {serviziByStatus.tutti.map(renderMobileCard)}
                    {serviziByStatus.tutti.length === 0 && (
                      <Card className="w-full p-8 text-center">
                        <p className="text-muted-foreground mb-4">Nessun servizio trovato</p>
                        <Button 
                          onClick={() => navigate("/servizi/crea")}
                          variant="outline"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Crea il primo servizio
                        </Button>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Tab Content - DA ASSEGNARE */}
                <TabsContent value="da_assegnare" className="mt-0">
                  <div className="w-full space-y-3">
                    {serviziByStatus.da_assegnare.map(renderMobileCard)}
                    {serviziByStatus.da_assegnare.length === 0 && (
                      <Card className="w-full p-8 text-center">
                        <p className="text-muted-foreground">Nessun servizio da assegnare</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>

                {/* Tab Content - ASSEGNATO */}
                <TabsContent value="assegnato" className="mt-0">
                  <div className="w-full space-y-3">
                    {serviziByStatus.assegnato.map(renderMobileCard)}
                    {serviziByStatus.assegnato.length === 0 && (
                      <Card className="w-full p-8 text-center">
                        <p className="text-muted-foreground">Nessun servizio assegnato</p>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              /* DESKTOP: Table */
              <Card className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Azienda</TableHead>
                      <TableHead>Commessa</TableHead>
                      <TableHead>Percorso</TableHead>
                      <TableHead>Conducente</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Importo</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredServizi.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Nessun servizio trovato
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredServizi.map((servizio: Servizio) => (
                        <TableRow 
                          key={servizio.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => navigate(`/servizi/${servizio.id}`)}
                        >
                          <TableCell className="font-medium">
                            {format(new Date(servizio.data_servizio), 'dd/MM/yyyy', { locale: it })}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {servizio.orario_servizio}
                            </span>
                          </TableCell>
                          <TableCell>{servizio.aziende?.nome || 'N/A'}</TableCell>
                          <TableCell className="text-xs">{servizio.numero_commessa || '-'}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-xs space-y-0.5">
                              <p className="truncate">
                                <span className="text-muted-foreground">Da:</span> {servizio.indirizzo_presa}
                              </p>
                              <p className="truncate">
                                <span className="text-muted-foreground">A:</span> {servizio.indirizzo_destinazione}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {servizio.assegnato_a ? (
                              (() => {
                                const assignedUser = users.find((u: any) => u.id === servizio.assegnato_a);
                                return assignedUser ? `${assignedUser.first_name} ${assignedUser.last_name}` : 'Assegnato';
                              })()
                            ) : (
                              <span className="text-muted-foreground text-xs">Non assegnato</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(servizio.stato)}>
                              {getStatusLabel(servizio.stato)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {servizio.incasso_previsto ? (
                              `€${servizio.incasso_previsto.toFixed(2)}`
                            ) : (
                              '-'
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            )}
          </>
        )}

      </div>
    </MainLayout>
  );
}
