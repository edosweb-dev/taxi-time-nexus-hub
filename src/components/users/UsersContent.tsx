import { useState } from 'react';
import { UserList } from './UserList';
import { UserStats } from './UserStats';
import { UserSheet } from './UserSheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Profile, UserRole } from '@/lib/types';
import { UserFormData } from '@/lib/api/users/types';

interface UsersContentProps {
  users: Profile[];
  onEdit: (user: Profile) => void;
  onDelete: (user: Profile) => void;
  onAddUser: (context: 'utenti' | 'clienti') => void;
  onResetPassword: (user: Profile) => void;
  onSubmit: (data: UserFormData) => Promise<void>;
  currentUserId: string;
  isDeleting: boolean;
  isSheetOpen: boolean;
  setIsSheetOpen: (open: boolean) => void;
  selectedUser: Profile | null;
  isSubmitting: boolean;
}

export function UsersContent({
  users,
  onEdit,
  onDelete,
  onAddUser,
  onResetPassword,
  onSubmit,
  currentUserId,
  isDeleting,
  isSheetOpen,
  setIsSheetOpen,
  selectedUser,
  isSubmitting,
}: UsersContentProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'utenti' | 'clienti'>('utenti');

  // Filter users by role
  const clienti = users.filter(user => user.role === 'cliente');
  const utenti = users.filter(user => ['admin', 'socio', 'dipendente'].includes(user.role));
  
  // Filter utenti based on selected role
  const filteredUtenti = selectedRole === 'all' 
    ? utenti 
    : utenti.filter(user => user.role === selectedRole);

  return (
    <div className="space-y-6">
      <UserStats users={users} />

      <Tabs 
        defaultValue="utenti" 
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'utenti' | 'clienti')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="utenti">Utenti</TabsTrigger>
          <TabsTrigger value="clienti">Clienti</TabsTrigger>
        </TabsList>
        
        <TabsContent value="utenti" className="space-y-4">
          <UserList 
            users={filteredUtenti}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddUser={() => onAddUser('utenti')}
            onResetPassword={onResetPassword}
            currentUserId={currentUserId}
            title="Utenti"
            description="Amministratori, soci e dipendenti"
            showRoleFilter={true}
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            isDeleting={isDeleting}
          />
        </TabsContent>
        
        <TabsContent value="clienti" className="space-y-4">
          <UserList 
            users={clienti}
            onEdit={onEdit}
            onDelete={onDelete}
            onAddUser={() => onAddUser('clienti')}
            onResetPassword={onResetPassword}
            currentUserId={currentUserId}
            title="Clienti"
            description="Utenti clienti del sistema"
            showEmailColumn={true}
            isDeleting={isDeleting}
          />
        </TabsContent>
      </Tabs>

      <UserSheet
        isOpen={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onSubmit={onSubmit}
        user={selectedUser}
        isSubmitting={isSubmitting}
        formType={activeTab === 'clienti' ? 'client' : 'user'}
      />
    </div>
  );
}