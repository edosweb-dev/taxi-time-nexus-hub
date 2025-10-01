import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { ArrowLeft, Mail, Phone, Building2, UserCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUsers } from '@/hooks/useUsers';
import { UserForm } from '@/components/users/UserForm';
import { UserFormData } from '@/lib/api/users/types';
import { toast } from '@/components/ui/use-toast';
import { updateUser, resetUserPassword } from '@/lib/api/users';
import { Separator } from '@/components/ui/separator';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { users, refetch } = useUsers();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const user = users?.find(u => u.id === id);

  if (!user) {
    return (
      <MainLayout title="Utente">
        <div className="flex flex-col items-center justify-center py-12">
          <UserCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Utente non trovato</p>
          <Button onClick={() => navigate('/users')} className="mt-4" variant="outline">
            Torna alla lista
          </Button>
        </div>
      </MainLayout>
    );
  }

  const getInitials = () => {
    return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || 'U';
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Amministratore',
      socio: 'Socio',
      dipendente: 'Dipendente',
      cliente: 'Cliente'
    };
    return labels[role] || role;
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

  const handleSubmit = async (data: UserFormData) => {
    try {
      setIsSubmitting(true);
      await updateUser(user.id, data);
      toast({
        title: "Utente aggiornato",
        description: "L'utente è stato aggiornato con successo.",
      });
      setIsEditing(false);
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

  const handleResetPassword = async () => {
    if (!user.email) {
      toast({
        title: "Errore",
        description: "Email non disponibile per questo utente.",
        variant: "destructive",
      });
      return;
    }

    if (confirm(`Sei sicuro di voler inviare un'email di reset password a ${user.email}?`)) {
      try {
        const { success, error } = await resetUserPassword(user.email);
        
        if (success) {
          toast({
            title: "Email inviata",
            description: `Un'email di reset password è stata inviata a ${user.email}.`,
          });
        } else {
          toast({
            title: "Errore",
            description: error?.message || "Si è verificato un errore durante l'invio dell'email.",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'invio dell'email di reset.",
          variant: "destructive",
        });
      }
    }
  };

  if (isEditing) {
    return (
      <MainLayout title="Modifica Utente">
        <div className="mobile-content-unified pb-20">
          {/* Header */}
          <div className="bg-background border-b border-border sticky top-0 z-10 -mx-4 px-4 py-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(false)}
                className="touch-target"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Modifica Utente</h1>
            </div>
          </div>

          <div className="mt-4">
            <UserForm
              user={user}
              onSubmit={handleSubmit}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`${user.first_name} ${user.last_name}`}>
      <div className="mobile-content-unified pb-20">
        {/* Header */}
        <div className="bg-background border-b border-border sticky top-0 z-10 -mx-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/users')}
              className="touch-target"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">Dettagli Utente</h1>
          </div>
        </div>

        {/* User Header Card */}
        <Card className="mt-4 border-0 shadow-none">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-20 h-20 border-2 border-border/20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              
              <h2 className="mt-4 text-xl font-semibold">
                {user.first_name} {user.last_name}
              </h2>
              
              <Badge className={`mt-2 ${getRoleColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Informazioni di Contatto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.email && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="text-sm font-medium break-all">{user.email}</p>
                </div>
              </div>
            )}
            
            {user.telefono && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Telefono</p>
                  <p className="text-sm font-medium">{user.telefono}</p>
                </div>
              </div>
            )}

            {user.role === 'cliente' && user.azienda_id && (
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Azienda</p>
                  <p className="text-sm font-medium">ID: {user.azienda_id}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Ruolo e Permessi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-muted/50">
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Ruolo</p>
                <p className="text-sm font-medium">{getRoleLabel(user.role)}</p>
                {user.color && (
                  <div className="flex items-center gap-2 mt-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-border" 
                      style={{ backgroundColor: user.color }}
                    />
                    <span className="text-xs text-muted-foreground">Colore assegnato</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="mt-6 space-y-3 px-4">
          <Button 
            onClick={() => setIsEditing(true)}
            className="w-full touch-target"
            size="lg"
          >
            Modifica Informazioni
          </Button>
          
          {user.email && (
            <Button 
              onClick={handleResetPassword}
              variant="outline"
              className="w-full touch-target"
              size="lg"
            >
              Invia Reset Password
            </Button>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
