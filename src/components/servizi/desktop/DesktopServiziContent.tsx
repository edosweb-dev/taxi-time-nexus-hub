import { useState } from 'react';
import { Calendar, BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServizioStats } from '../ServizioStats';
import { ServiziFilters, ServiziFiltersState } from '../filters/ServiziFilters';
import { ServizioTable } from '../ServizioTable';
import { Servizio } from '@/lib/types/servizi';
import { Profile } from '@/lib/types';
import { groupServiziByStatus } from '../utils/groupingUtils';
import { InserimentoServizioModal } from '../InserimentoServizioModal';
import { useAuth } from '@/contexts/AuthContext';

interface DesktopServiziContentProps {
  servizi: Servizio[];
  users: Profile[];
  isLoading: boolean;
  isAdminOrSocio: boolean;
  onNavigateToDetail: (id: string) => void;
  onNavigateToNewServizio: () => void;
  onSelectServizio: (servizio: Servizio) => void;
  onCompleta: (servizio: Servizio) => void;
  onFirma: (servizio: Servizio) => void;
  allServizi: Servizio[];
  filters: ServiziFiltersState;
  onFiltersChange: (filters: ServiziFiltersState) => void;
  onClearFilters: () => void;
  searchText?: string;
  onSearchTextChange?: (text: string) => void;
}

export function DesktopServiziContent({
  servizi,
  users,
  isLoading,
  isAdminOrSocio,
  onNavigateToDetail,
  onNavigateToNewServizio,
  onSelectServizio,
  onCompleta,
  onFirma,
  allServizi,
  filters,
  onFiltersChange,
  onClearFilters,
  searchText,
  onSearchTextChange
}: DesktopServiziContentProps) {
  const [activeTab, setActiveTab] = useState<string>('da_assegnare');
  const [showModal, setShowModal] = useState(false);
  const { profile } = useAuth();
  
  // Determina se mostrare ricerca globale (senza divisione per tab)
  const isGlobalSearch = (searchText?.trim().length || 0) > 0 || (filters.search?.trim().length || 0) > 0;
  
  const serviziByStatus = groupServiziByStatus(servizi);

  const handleNewServizio = () => {
    if (profile?.role === 'admin' || profile?.role === 'socio') {
      setShowModal(true);
    } else {
      onNavigateToNewServizio();
    }
  };

  // Count servizi by status for tab badges
  const statusCounts = {
    bozza: serviziByStatus.bozza.length,
    da_assegnare: serviziByStatus.da_assegnare.length,
    assegnato: serviziByStatus.assegnato.length,
    completato: serviziByStatus.completato.length,
    annullato: serviziByStatus.annullato.length,
    non_accettato: serviziByStatus.non_accettato.length,
    consuntivato: serviziByStatus.consuntivato.length,
  };

  return (
    <div className="space-y-6">
      {/* Desktop Stats */}
      <ServizioStats servizi={servizi} isLoading={isLoading} />
      
      {/* Desktop Header with Actions */}
      <div className="flex flex-row items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <ServiziFilters
            servizi={allServizi}
            users={users}
            filters={filters}
            onFiltersChange={onFiltersChange}
            onApplyFilters={() => {}}
            onClearFilters={onClearFilters}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/report-servizi'}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Report
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.href = '/calendario-servizi'}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </Button>
          {isAdminOrSocio && (
            <Button size="sm" onClick={handleNewServizio}>
              <Plus className="h-4 w-4 mr-2" />
              Nuovo Servizio
            </Button>
          )}
        </div>
      </div>
      
      <InserimentoServizioModal 
        open={showModal}
        onClose={() => setShowModal(false)}
      />

      {/* Desktop Tabbed Table View or Global Search Results */}
      {isGlobalSearch ? (
        // Vista ricerca globale - senza tab
        <div className="space-y-4">
          <div className="flex items-center justify-between px-4 py-3 bg-primary/10 rounded-lg">
            <span className="text-sm text-primary font-medium">
              {servizi.length} risultati trovati in tutti gli stati
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                onSearchTextChange?.('');
                onFiltersChange({ ...filters, search: '' });
              }}
            >
              Cancella ricerca
            </Button>
          </div>
          
          {servizi.length > 0 ? (
            <div className="rounded-md border h-[600px] flex flex-col">
              <ServizioTable
                servizi={servizi}
                users={users}
                onNavigateToDetail={onNavigateToDetail}
                onSelect={onSelectServizio}
                onCompleta={onCompleta}
                onFirma={onFirma}
                isAdminOrSocio={isAdminOrSocio}
                allServizi={allServizi}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nessun risultato trovato
            </div>
          )}
        </div>
      ) : (
        // Vista normale con tab
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="bozza" className="relative">
              Bozze
              {statusCounts.bozza > 0 && (
                <span className="ml-1 rounded-full bg-blue-500 px-1.5 py-0.5 text-xs text-white">
                  {statusCounts.bozza}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="da_assegnare" className="relative">
              Da Assegnare
              {statusCounts.da_assegnare > 0 && (
                <span className="ml-1 rounded-full bg-destructive px-1.5 py-0.5 text-xs text-destructive-foreground">
                  {statusCounts.da_assegnare}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="assegnato" className="relative">
              Assegnati
              {statusCounts.assegnato > 0 && (
                <span className="ml-1 rounded-full bg-yellow-500 px-1.5 py-0.5 text-xs text-white">
                  {statusCounts.assegnato}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="non_accettato">Non Accettati</TabsTrigger>
            <TabsTrigger value="completato" className="relative">
              Completati
              {statusCounts.completato > 0 && (
                <span className="ml-1 rounded-full bg-green-500 px-1.5 py-0.5 text-xs text-white">
                  {statusCounts.completato}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="annullato" className="relative">
              Annullati
              {statusCounts.annullato > 0 && (
                <span className="ml-1 rounded-full bg-gray-500 px-1.5 py-0.5 text-xs text-white">
                  {statusCounts.annullato}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="consuntivato">Consuntivati</TabsTrigger>
          </TabsList>

          {(["bozza", "da_assegnare", "assegnato", "non_accettato", "completato", "annullato", "consuntivato"] as const).map((status) => (
            <TabsContent key={status} value={status} className="mt-0">
              <div className="rounded-md border h-[600px] flex flex-col">
                <ServizioTable
                  servizi={serviziByStatus[status]}
                  users={users}
                  onNavigateToDetail={onNavigateToDetail}
                  onSelect={onSelectServizio}
                  onCompleta={onCompleta}
                  onFirma={onFirma}
                  isAdminOrSocio={isAdminOrSocio}
                  allServizi={allServizi}
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}