
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { UsersContent } from '@/components/users/UsersContent';
import { ChevronRight, Home, Search, Users, UserPlus } from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Profile } from '@/lib/types';
import { UserFormData } from '@/lib/api/users/types';
import { toast } from '@/components/ui/use-toast';
import { createUser, updateUser, resetUserPassword } from '@/lib/api/users';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import { ResetPasswordDialog } from '@/components/users/ResetPasswordDialog';

export default function UsersPage() {
  const { users, isLoading, refetch, deleteUser, isDeleting } = useUsers();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('tutti');
  const [resetPasswordUser, setResetPasswordUser] = useState<Profile | null>(null);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsSheetOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    console.log('[UsersPage] handleEditUser called', { user, isMobile });
    if (isMobile) {
      console.log('[UsersPage] Navigating to:', `/users/${user.id}`);
      navigate(`/users/${user.id}`);
    } else {
      console.log('[UsersPage] Opening sheet for user:', user.id);
      setSelectedUser(user);
      setIsSheetOpen(true);
    }
  };

  const handleDeleteUser = async (user: Profile) => {
    console.log('Deleting user with backup:', user.id);
    deleteUser(user.id);
  };

  const handleResetPassword = async (user: Profile) => {
    setResetPasswordUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedUser) {
        await updateUser(selectedUser.id, data);
        toast({
          title: "Utente aggiornato",
          description: "L'utente è stato aggiornato con successo.",
        });
      } else {
        await createUser(data);
        toast({
          title: "Utente creato",
          description: "L'utente è stato creato con successo.",
        });
      }
      setIsSheetOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dell'utente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mobile-specific logic
  const tabs = [
    { id: 'tutti', label: 'Tutti', count: users?.length || 0 },
    { id: 'admin', label: 'Admin', count: users?.filter(u => u.role === 'admin').length || 0 },
    { id: 'dipendente', label: 'Dipendenti', count: users?.filter(u => u.role === 'dipendente').length || 0 },
    { id: 'cliente', label: 'Clienti', count: users?.filter(u => u.role === 'cliente').length || 0 }
  ];

  const filteredUsers = users?.filter(user => {
    const matchesSearch = !searchQuery || 
      user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesTab = false;
    switch (activeTab) {
      case 'tutti':
        matchesTab = true;
        break;
      case 'admin':
        matchesTab = user.role === 'admin';
        break;
      case 'dipendente':
        matchesTab = user.role === 'dipendente';
        break;
      case 'cliente':
        matchesTab = user.role === 'cliente';
        break;
      default:
        matchesTab = false;
    }

    return matchesSearch && matchesTab;
  }) || [];

  const getInitials = (user: Profile) => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'socio': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'dipendente': return 'bg-green-100 text-green-700 border-green-200';
      case 'cliente': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (isMobile) {
    if (isLoading) {
      return (
        <MainLayout title="Utenti">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </MainLayout>
      );
    }

    return (
      <MainLayout title="Utenti">
        {/* Search */}
        <div className="mobile-search">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cerca utenti..."
              className="mobile-input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Enhanced Mobile Tabs */}
        <div className="bg-background/95 backdrop-blur-sm border-b border-border/50 sticky top-0 z-30">
          <div className="flex overflow-x-auto scrollbar-hide px-4 py-3 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium 
                  whitespace-nowrap transition-all duration-300 touch-manipulation
                  min-w-fit border shadow-sm
                  ${activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground border-primary shadow-md scale-105' 
                    : 'bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground hover:border-border/80'
                  }
                  active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1
                `}
                style={{
                  transformOrigin: 'center',
                  transform: activeTab === tab.id ? 'translateY(-1px)' : 'none'
                }}
              >
                <span className="font-semibold">{tab.label}</span>
                <div className={`
                  flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold
                  transition-colors duration-200
                  ${activeTab === tab.id 
                    ? 'bg-primary-foreground text-primary' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {tab.count}
                </div>
                
                {activeTab === tab.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
          
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background/95 to-transparent pointer-events-none" />
        </div>

        {/* Users List */}
        <div className="services-list">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="mobile-card touch-feedback"
                onClick={() => handleEditUser(user)}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 border border-border/20">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {getInitials(user)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground leading-tight">
                          {user.first_name} {user.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      
                      <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                        {user.role}
                      </Badge>
                    </div>
                    
                    {user.telefono && (
                      <div className="service-info">
                        <span className="text-sm text-muted-foreground">
                          {user.telefono}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Nessun utente trovato per la ricerca' : 'Nessun utente disponibile'}
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Button */}
        <Button
          onClick={handleAddUser}
          className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg touch-target z-40"
          size="icon"
        >
          <UserPlus className="h-6 w-6" />
        </Button>
      </MainLayout>
    );
  }

  // Desktop version
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title">Gestione Utenti</h1>
              <p className="text-description">
                Amministra tutti gli utenti del sistema: staff interno e clienti aziendali
              </p>
            </div>
          </div>
        </div>

        <UsersContent
          users={users}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onAddUser={handleAddUser}
          onResetPassword={handleResetPassword}
          onSubmit={handleSubmit}
          currentUserId={profile?.id || ''}
          isDeleting={isDeleting}
          isSheetOpen={isSheetOpen}
          setIsSheetOpen={setIsSheetOpen}
          selectedUser={selectedUser}
          isSubmitting={isSubmitting}
        />

        {resetPasswordUser && (
          <ResetPasswordDialog
            open={isResetPasswordDialogOpen}
            onOpenChange={setIsResetPasswordDialogOpen}
            user={resetPasswordUser}
            onSuccess={() => {
              refetch();
            }}
          />
        )}
      </div>
    </MainLayout>
  );
}
