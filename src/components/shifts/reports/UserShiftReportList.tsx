
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Users, Filter, SortAsc, SortDesc, Clock, Calendar } from 'lucide-react';
import { UserShiftStats } from './shiftReportsApi';
import { ShiftStatsCard } from './ShiftStatsCard';

interface UserShiftReportListProps {
  userStats: UserShiftStats[];
  selectedUserId: string | null;
  onUserSelect: (userId: string) => void;
  isLoading?: boolean;
}

export function UserShiftReportList({ 
  userStats, 
  selectedUserId, 
  onUserSelect, 
  isLoading = false 
}: UserShiftReportListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'hours' | 'days' | 'name'>('hours');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtra gli utenti in base ai criteri di ricerca
  const filteredUsers = userStats.filter(user => {
    const displayName = `${user.user_first_name || ''} ${user.user_last_name || ''}`.toLowerCase();
    const email = (user.user_email || '').toLowerCase();
    const searchMatch = searchTerm === '' || 
                       displayName.includes(searchTerm.toLowerCase()) || 
                       email.includes(searchTerm.toLowerCase());
    
    // Filtro per ruolo (se abbiamo informazioni sul ruolo)
    const roleMatch = roleFilter === 'all'; // Per ora manteniamo tutti, in futuro si può filtrare per ruolo
    
    return searchMatch && roleMatch;
  });

  // Ordina gli utenti in base ai criteri selezionati
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'hours':
        comparison = a.total_hours - b.total_hours;
        break;
      case 'days':
        comparison = a.working_days - b.working_days;
        break;
      case 'name':
        const nameA = `${a.user_first_name || ''} ${a.user_last_name || ''}`.toLowerCase();
        const nameB = `${b.user_first_name || ''} ${b.user_last_name || ''}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setSortBy('hours');
    setSortOrder('desc');
  };

  const hasActiveFilters = searchTerm !== '' || roleFilter !== 'all';

  return (
    <Card className="h-full border-l-4 border-l-primary">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Report Utenti
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {sortedUsers.length} di {userStats.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="h-8 w-8 p-0"
            >
              <Filter className={`h-4 w-4 ${hasActiveFilters ? 'text-primary' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Barra di ricerca sempre visibile */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {/* Filtri avanzati */}
        {showFilters && (
          <div className="space-y-3 pt-3 border-t bg-muted/30 -mx-6 px-6 pb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Ordinamento */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Ordina per:</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: 'hours' | 'days' | 'name') => setSortBy(value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Ore totali
                        </div>
                      </SelectItem>
                      <SelectItem value="days">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Giorni lavorativi
                        </div>
                      </SelectItem>
                      <SelectItem value="name">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Nome utente
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSortOrder}
                    className="px-3"
                  >
                    {sortOrder === 'desc' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              {/* Ruolo filter placeholder per future implementazioni */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Filtra per ruolo:</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i ruoli</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="socio">Socio</SelectItem>
                    <SelectItem value="dipendente">Dipendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Reset filters */}
            {hasActiveFilters && (
              <div className="flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Rimuovi filtri
                </Button>
              </div>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Caricamento statistiche...
            </div>
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground space-y-2">
            <Users className="h-8 w-8 mx-auto opacity-50" />
            <p className="font-medium">
              {searchTerm || hasActiveFilters ? 'Nessun utente trovato' : 'Nessun dato disponibile'}
            </p>
            <p className="text-sm">
              {searchTerm || hasActiveFilters 
                ? 'Prova a modificare i criteri di ricerca o i filtri.' 
                : 'Seleziona un periodo diverso o verifica che ci siano turni registrati.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 p-4 max-h-[calc(100vh-400px)] overflow-y-auto">
            {sortedUsers.map((user) => (
              <ShiftStatsCard
                key={user.user_id}
                stats={user}
                onClick={() => onUserSelect(user.user_id)}
                isSelected={selectedUserId === user.user_id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
