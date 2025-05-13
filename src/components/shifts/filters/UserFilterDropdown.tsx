
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, Filter, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUsers } from "@/hooks/useUsers";
import { Profile } from "@/lib/types";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";

const USER_COLORS = [
  "bg-blue-100 text-blue-800 border-blue-300",
  "bg-green-100 text-green-800 border-green-300",
  "bg-purple-100 text-purple-800 border-purple-300",
  "bg-amber-100 text-amber-800 border-amber-300",
  "bg-rose-100 text-rose-800 border-rose-300",
  "bg-cyan-100 text-cyan-800 border-cyan-300",
  "bg-indigo-100 text-indigo-800 border-indigo-300",
  "bg-pink-100 text-pink-800 border-pink-300",
  "bg-emerald-100 text-emerald-800 border-emerald-300",
  "bg-orange-100 text-orange-800 border-orange-300"
];

export interface UserFilterProps {
  selectedUserId: string | null;
  onSelectUser: (userId: string | null) => void;
  showOnlyAdminAndSocio?: boolean;
  className?: string;
}

export function UserFilterDropdown({ 
  selectedUserId, 
  onSelectUser, 
  showOnlyAdminAndSocio = false,
  className 
}: UserFilterProps) {
  const { users, isLoading } = useUsers();
  const [open, setOpen] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  
  // Filter users based on role if needed
  useEffect(() => {
    if (users) {
      const filtered = showOnlyAdminAndSocio 
        ? users.filter(user => user.role === 'admin' || user.role === 'socio' || user.role === 'dipendente')
        : users;
      setFilteredUsers(filtered);
    }
  }, [users, showOnlyAdminAndSocio]);

  // Get the selected user name
  const selectedUser = filteredUsers.find(user => user.id === selectedUserId);
  const displayName = selectedUser 
    ? `${selectedUser.first_name} ${selectedUser.last_name}` 
    : "Tutti gli utenti";

  // Get user color by index (cycled if more users than colors)
  const getUserColor = (index: number) => {
    return USER_COLORS[index % USER_COLORS.length];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "flex items-center gap-2",
            selectedUserId ? "border-primary" : "border-muted-foreground border-dashed",
            className
          )}
        >
          {selectedUserId ? (
            <User className="h-4 w-4" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          <span className="truncate max-w-[150px]">{displayName}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Cerca utente..." />
          <CommandEmpty>Nessun utente trovato.</CommandEmpty>
          <CommandGroup>
            <CommandItem
              key="all-users"
              value="all"
              onSelect={() => {
                onSelectUser(null);
                setOpen(false);
              }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Tutti gli utenti</span>
              </div>
              {!selectedUserId && <Check className="h-4 w-4" />}
            </CommandItem>
            
            {filteredUsers.map((user, index) => (
              <CommandItem
                key={user.id}
                value={`${user.first_name} ${user.last_name}`}
                onSelect={() => {
                  onSelectUser(user.id);
                  setOpen(false);
                }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-3 w-3 rounded-full",
                    getUserColor(index).split(" ")[0]
                  )} />
                  <span>{user.first_name} {user.last_name}</span>
                </div>
                {selectedUserId === user.id && <Check className="h-4 w-4" />}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Export a function to get color for a specific user
export function getUserColorClass(users: Profile[], userId: string): string {
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) return "";
  
  return USER_COLORS[userIndex % USER_COLORS.length];
}
