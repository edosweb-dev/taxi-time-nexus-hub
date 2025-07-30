
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User, X } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

// Map of user IDs to tailwind color classes for consistent coloring
const userColorMap = [
  'bg-red-200 border-red-400',
  'bg-blue-200 border-blue-400',
  'bg-green-200 border-green-400',
  'bg-yellow-200 border-yellow-400',
  'bg-purple-200 border-purple-400',
  'bg-pink-200 border-pink-400',
  'bg-indigo-200 border-indigo-400',
  'bg-orange-200 border-orange-400',
  'bg-teal-200 border-teal-400',
  'bg-cyan-200 border-cyan-400',
];

// Helper function to get a color class based on user ID
export const getUserColorClass = (users: any[] | undefined, userId: string) => {
  if (!users || !users.length || !userId) return '';
  
  // Find user index to determine color
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return '';
  
  // Return consistent color based on user's position in the array
  return userColorMap[userIndex % userColorMap.length];
};

interface UserFilterDropdownProps {
  selectedUserIds: string[];
  onSelectUsers: (userIds: string[]) => void;
  showOnlyAdminAndSocio?: boolean;
}

export function UserFilterDropdown({ 
  selectedUserIds, 
  onSelectUsers, 
  showOnlyAdminAndSocio = false
}: UserFilterDropdownProps) {
  const { users, isLoading } = useUsers({ 
    includeRoles: ['admin', 'socio', 'dipendente'] 
  });
  const [open, setOpen] = useState(false);
  
  // Safely handle potentially undefined users array
  const safeUsers = users || [];
  
  // Filter users based on roles if needed
  const filteredUsers = showOnlyAdminAndSocio 
    ? safeUsers.filter(user => user.role === 'admin' || user.role === 'socio')
    : safeUsers;
  
  // Find the selected users
  const selectedUsers = selectedUserIds.length > 0 
    ? filteredUsers.filter(user => selectedUserIds.includes(user.id)) 
    : [];
  
  // Handle the case where some selected users don't exist in the filtered list
  useEffect(() => {
    if (selectedUserIds.length > 0 && filteredUsers.length > 0) {
      const validUserIds = selectedUserIds.filter(id => 
        filteredUsers.some(user => user.id === id)
      );
      if (validUserIds.length !== selectedUserIds.length) {
        onSelectUsers(validUserIds);
      }
    }
  }, [selectedUserIds, filteredUsers, onSelectUsers]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[200px] justify-between"
        >
          {selectedUsers.length > 0 ? (
            selectedUsers.length === 1 ? (
              <>
                <User className="mr-2 h-4 w-4" />
                {selectedUsers[0].first_name} {selectedUsers[0].last_name}
              </>
            ) : (
              <>
                <User className="mr-2 h-4 w-4" />
                {selectedUsers.length} utenti selezionati
              </>
            )
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              Tutti gli utenti
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[250px] p-0 bg-background border z-50">
        <Command>
          <CommandInput placeholder="Cerca utente..." />
          <CommandList>
            <CommandEmpty>Nessun utente trovato.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-users"
                onSelect={() => {
                  onSelectUsers([]);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedUserIds.length === 0 ? "opacity-100" : "opacity-0"
                  )}
                />
                Tutti gli utenti
              </CommandItem>
              
              {filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <CommandItem
                    key={user.id}
                    value={`${user.first_name} ${user.last_name}`}
                    onSelect={() => {
                      if (isSelected) {
                        // Remove user from selection
                        onSelectUsers(selectedUserIds.filter(id => id !== user.id));
                      } else {
                        // Add user to selection
                        onSelectUsers([...selectedUserIds, user.id]);
                      }
                      // Don't close dropdown for multi-select
                    }}
                    className={cn(
                      "cursor-pointer",
                      getUserColorClass(safeUsers, user.id)
                    )}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {user.first_name} {user.last_name}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            
            {/* Footer with action buttons */}
            {selectedUserIds.length > 0 && (
              <div className="p-2 border-t bg-muted/30">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {selectedUserIds.length} utente{selectedUserIds.length > 1 ? 'i' : ''} selezionat{selectedUserIds.length > 1 ? 'i' : 'o'}
                  </span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelectUsers([])}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Pulisci
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setOpen(false)}
                      className="h-6 px-2 text-xs"
                    >
                      Applica
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
