
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users } from 'lucide-react';
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

  // Filtra gli utenti in base ai criteri di ricerca
  const filteredUsers = userStats.filter(user => {
    const displayName = `${user.user_first_name || ''} ${user.user_last_name || ''}`.toLowerCase();
    const email = (user.user_email || '').toLowerCase();
    const searchMatch = displayName.includes(searchTerm.toLowerCase()) || 
                       email.includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  // Ordina gli utenti per ore totali (decrescente)
  const sortedUsers = [...filteredUsers].sort((a, b) => b.total_hours - a.total_hours);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Report Utenti ({sortedUsers.length})
        </CardTitle>
        
        {/* Filtri */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca per nome o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">
            Caricamento statistiche...
          </div>
        ) : sortedUsers.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground">
            {searchTerm ? 'Nessun utente trovato con i criteri di ricerca.' : 'Nessun dato disponibile per il periodo selezionato.'}
          </div>
        ) : (
          <div className="space-y-4 p-4 max-h-[calc(100vh-300px)] overflow-y-auto">
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
