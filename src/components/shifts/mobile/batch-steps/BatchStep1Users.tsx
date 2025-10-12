import React from 'react';
import { Users } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { type BatchShiftFormData } from '@/lib/schemas/shifts';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BatchStep1UsersProps {
  formData: Partial<BatchShiftFormData>;
  onChange: (data: Partial<BatchShiftFormData>) => void;
}

export function BatchStep1Users({ formData, onChange }: BatchStep1UsersProps) {
  const { users } = useUsers();

  const employeeUsers = users?.filter(u => 
    ['admin', 'socio', 'dipendente'].includes(u.role)
  ) || [];

  const selectedUserIds = formData.user_ids || [];
  const allSelected = selectedUserIds.length === employeeUsers.length && employeeUsers.length > 0;

  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      onChange({ user_ids: employeeUsers.map(u => u.id) });
    } else {
      onChange({ user_ids: [] });
    }
  };

  const handleToggleUser = (userId: string, checked: boolean) => {
    const current = formData.user_ids || [];
    if (checked) {
      onChange({ user_ids: [...current, userId] });
    } else {
      onChange({ user_ids: current.filter(id => id !== userId) });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-5 h-5" />
        <h3 className="font-medium text-foreground">Seleziona Dipendenti</h3>
      </div>

      <Card className="p-4 bg-muted/50">
        <div className="flex items-center space-x-3">
          <Checkbox
            id="all-users"
            checked={allSelected}
            onCheckedChange={handleToggleAll}
          />
          <Label
            htmlFor="all-users"
            className="text-base font-medium cursor-pointer"
          >
            Tutti i dipendenti ({employeeUsers.length})
          </Label>
        </div>
      </Card>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            oppure seleziona manualmente
          </span>
        </div>
      </div>

      <ScrollArea className="h-[300px] w-full rounded-md border p-4">
        <div className="space-y-3">
          {employeeUsers.map((user) => {
            const isSelected = selectedUserIds.includes(user.id);
            
            return (
              <div
                key={user.id}
                className="flex items-center space-x-3 py-2"
              >
                <Checkbox
                  id={`user-${user.id}`}
                  checked={isSelected}
                  onCheckedChange={(checked) => 
                    handleToggleUser(user.id, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`user-${user.id}`}
                  className="flex-1 cursor-pointer flex items-center gap-2"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ backgroundColor: user.color || '#6b7280' }}
                  >
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <span>{user.first_name} {user.last_name}</span>
                </Label>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="text-sm text-muted-foreground text-center">
        {selectedUserIds.length} {selectedUserIds.length === 1 ? 'selezionato' : 'selezionati'}
      </div>
    </div>
  );
}
