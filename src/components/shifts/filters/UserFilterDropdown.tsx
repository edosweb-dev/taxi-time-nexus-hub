
import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, User } from 'lucide-react';
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
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  showOnlyAdminAndSocio?: boolean;
}

export function UserFilterDropdown({ 
  selectedUserId, 
  onSelectUser, 
  showOnlyAdminAndSocio = false
}: UserFilterDropdownProps) {
  const { users, isLoading } = useUsers();
  const [open, setOpen] = useState(false);
  
  // Safely handle potentially undefined users array
  const safeUsers = users || [];
  
  // Filter users based on roles if needed
  const filteredUsers = showOnlyAdminAndSocio 
    ? safeUsers.filter(user => user.role === 'admin' || user.role === 'socio')
    : safeUsers;
  
  // Find the selected user
  const selectedUser = selectedUserId 
    ? filteredUsers.find(user => user.id === selectedUserId) 
    : null;
  
  // Handle the case where the selected user doesn't exist in the filtered list
  useEffect(() => {
    if (selectedUserId && filteredUsers.length > 0 && !filteredUsers.some(user => user.id === selectedUserId)) {
      onSelectUser(null);
    }
  }, [selectedUserId, filteredUsers, onSelectUser]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[200px] justify-between"
        >
          {selectedUser ? (
            <>
              <User className="mr-2 h-4 w-4" />
              {selectedUser.first_name} {selectedUser.last_name}
            </>
          ) : (
            <>
              <User className="mr-2 h-4 w-4" />
              Tutti gli utenti
            </>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full sm:w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Cerca utente..." />
          <CommandList>
            <CommandEmpty>Nessun utente trovato.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all-users"
                onSelect={() => {
                  onSelectUser(null);
                  setOpen(false);
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !selectedUserId ? "opacity-100" : "opacity-0"
                  )}
                />
                Tutti gli utenti
              </CommandItem>
              
              {filteredUsers.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.first_name} ${user.last_name}`}
                  onSelect={() => {
                    onSelectUser(user.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "cursor-pointer",
                    getUserColorClass(safeUsers, user.id)
                  )}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedUserId === user.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {user.first_name} {user.last_name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
