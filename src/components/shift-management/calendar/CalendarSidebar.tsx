import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserFilterDropdown } from '@/components/shifts/filters/UserFilterDropdown';
import { Users, Plus, Palette } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';

interface CalendarSidebarProps {
  selectedUsers: string[];
  onUsersChange: (users: string[]) => void;
  isAdminOrSocio: boolean;
}

const userColors = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // green
  '#F59E0B', // yellow
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
];

export function CalendarSidebar({
  selectedUsers,
  onUsersChange,
  isAdminOrSocio
}: CalendarSidebarProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { users: allUsers, isLoading } = useUsers({
    includeRoles: ['admin', 'socio', 'dipendente']
  });

  const handleUserToggle = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onUsersChange(selectedUsers.filter(id => id !== userId));
    } else {
      onUsersChange([...selectedUsers, userId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === allUsers?.length) {
      onUsersChange([]);
    } else {
      onUsersChange(allUsers?.map(user => user.id) || []);
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-5 w-5" />
          Dipendenti
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 overflow-y-auto">
        {/* Select All */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSelectAll}
            className="text-xs"
          >
            {selectedUsers.length === allUsers?.length ? 'Deseleziona tutto' : 'Seleziona tutto'}
          </Button>
          <Badge variant="secondary" className="text-xs">
            {selectedUsers.length}/{allUsers?.length || 0}
          </Badge>
        </div>

        {/* Quick Create Button */}
        {isAdminOrSocio && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="w-full gap-2"
          >
            <Plus className="h-4 w-4" />
            Crea turno rapido
          </Button>
        )}

        {/* Users List */}
        <div className="space-y-2">
          {allUsers?.map((user, index) => {
            const isSelected = selectedUsers.includes(user.id);
            const userColor = user.color || userColors[index % userColors.length];
            
            return (
              <div
                key={user.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => handleUserToggle(user.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleUserToggle(user.id)}
                />
                
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: userColor }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {user.role}
                  </div>
                </div>
                
                {user.role === 'admin' && (
                  <Badge variant="secondary" className="text-xs">
                    Admin
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Color Legend */}
        <div className="border-t pt-4">
          <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Palette className="h-3 w-3" />
            Legenda colori
          </div>
          <div className="text-xs text-muted-foreground">
            Ogni dipendente ha un colore univoco per identificare facilmente i propri turni nel calendario.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}