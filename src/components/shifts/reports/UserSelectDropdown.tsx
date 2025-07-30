import React, { useState } from 'react';
import { Check, ChevronsUpDown, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { UserShiftStats } from './shiftReportsApi';

interface UserSelectDropdownProps {
  users: UserShiftStats[];
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
  isLoading?: boolean;
}

export function UserSelectDropdown({ 
  users, 
  selectedUserId, 
  onSelectUser, 
  isLoading = false 
}: UserSelectDropdownProps) {
  const [open, setOpen] = useState(false);
  
  const selectedUser = users.find(user => user.user_id === selectedUserId);
  
  const getUserDisplayName = (user: UserShiftStats) => {
    const name = `${user.user_first_name || ''} ${user.user_last_name || ''}`.trim();
    return name || user.user_email || 'Utente senza nome';
  };
  
  const getUserInitials = (user: UserShiftStats) => {
    return `${user.user_first_name?.charAt(0) || ''}${user.user_last_name?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full sm:w-[350px] justify-start gap-3 h-12"
          disabled={isLoading}
        >
          {selectedUser ? (
            <>
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10">
                  {getUserInitials(selectedUser)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="font-medium truncate">
                  {getUserDisplayName(selectedUser)}
                </span>
                <span className="text-xs text-muted-foreground truncate">
                  {selectedUser.total_hours}h • {selectedUser.working_days} giorni
                </span>
              </div>
            </>
          ) : (
            <>
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {isLoading ? 'Caricamento utenti...' : 'Seleziona un utente'}
              </span>
            </>
          )}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0 bg-background border z-50">
        <Command>
          <div className="flex items-center gap-2 p-3 border-b">
            <Search className="h-4 w-4 text-muted-foreground" />
            <CommandInput 
              placeholder="Cerca utente per nome..." 
              className="border-0 p-0 h-auto focus:ring-0"
            />
          </div>
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Nessun utente trovato.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.user_id}
                  value={getUserDisplayName(user)}
                  onSelect={() => {
                    onSelectUser(user.user_id);
                    setOpen(false);
                  }}
                  className="cursor-pointer p-3"
                >
                  <div className="flex items-center gap-3 w-full">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {getUserInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium truncate">
                          {getUserDisplayName(user)}
                        </span>
                        <Check
                          className={cn(
                            "h-4 w-4 flex-shrink-0",
                            selectedUserId === user.user_id ? "opacity-100" : "opacity-0"
                          )}
                        />
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{user.total_hours}h totali</span>
                        <span>{user.working_days} giorni</span>
                        <span>Media: {user.average_hours_per_day.toFixed(1)}h/g</span>
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}