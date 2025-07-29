import { Profile } from '@/lib/types';
import { Shift } from '../ShiftContext';
import { ShiftGridCell } from './ShiftGridCell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ShiftGridRowProps {
  user: Profile;
  monthDays: Date[];
  getShiftsForCell: (userId: string, date: Date) => Shift[];
  onCellClick: (userId: string, date: Date) => void;
}

export function ShiftGridRow({ 
  user, 
  monthDays, 
  getShiftsForCell, 
  onCellClick 
}: ShiftGridRowProps) {
  const getUserInitials = (firstName: string | null, lastName: string | null) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return first + last || 'U';
  };

  const getUserName = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user.first_name || user.last_name || 'Nome non specificato';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'socio': return 'bg-blue-100 text-blue-800';
      case 'dipendente': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'socio': return 'Socio';
      case 'dipendente': return 'Dipendente';
      default: return role;
    }
  };

  return (
    <div className="grid grid-cols-[220px_1fr] border-b border-gray-200 hover:bg-muted/20 transition-colors">
      {/* Enhanced Employee Info */}
      <div className="p-4 border-r border-gray-200 bg-muted/30 sticky left-0 z-20">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-background">
            <AvatarImage src={undefined} />
            <AvatarFallback className="text-sm font-medium">
              {getUserInitials(user.first_name, user.last_name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-foreground truncate">
                {getUserName()}
              </p>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getRoleColor(user.role))}
              >
                {getRoleLabel(user.role)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
      </div>
      
      {/* Days grid with hover effects */}
      <div 
        className="grid hover:bg-background/50 transition-colors" 
        style={{ gridTemplateColumns: `repeat(${monthDays.length}, 1fr)` }}
      >
        {monthDays.map((day, index) => (
          <ShiftGridCell
            key={index}
            date={day}
            shifts={getShiftsForCell(user.id, day)}
            userId={user.id}
            onClick={onCellClick}
          />
        ))}
      </div>
    </div>
  );
}