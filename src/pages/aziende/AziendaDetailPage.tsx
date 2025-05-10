
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAziende } from '@/hooks/useAziende';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Building, Users as UsersIcon, Edit } from 'lucide-react';
import { UserDialog } from '@/components/users/UserDialog';
import { AziendaDialog } from '@/components/aziende/AziendaDialog';
import { AziendaFormData } from '@/lib/api/aziende';
import { Azienda, Profile, UserRole } from '@/lib/types';
import { toast } from '@/components/ui/sonner';
import { UserFormData } from '@/lib/api/users';
import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export default function AziendaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session } = useContext(AuthContext);
  const currentUserID = session?.user?.id;
  
  const [activeTab, setActiveTab] = useState('info');
  const [isAziendaDialogOpen, setIsAziendaDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  const { 
    getCompanyDetails, 
    updateCompany, 
    isUpdating 
  } = useAziende();
  
  const { 
    users, 
    isLoading: isLoadingUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    isCreating: isCreatingUser,
    isUpdating: isUpdatingUser,
    isDeleting: isDeletingUser 
  } = useUsers();

  const { data: azienda, isLoading, error } = getCompanyDetails(id || '');
  
  useEffect(() => {
    if (error) {
      toast.error("Errore nel caricamento dei dati aziendali");
      navigate('/aziende');
    }
  }, [error, navigate]);

  // Filtra gli utenti per mostrare solo quelli associati all'azienda e con ruolo 'cliente'
  const referenti = users.filter(user => user.azienda_id === id && user.role === 'cliente');

  const handleBack = () => {
    navigate('/aziende');
  };

  const handleEditAzienda = () => {
    setIsAziendaDialogOpen(true);
  };

  const handleSubmitAzienda = (data: AziendaFormData) => {
    if (id) {
      updateCompany(id, data);
      setIsAziendaDialogOpen(false);
    }
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (user: Profile) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (user: Profile) => {
    // Qui puoi implementare la logica per eliminare l'utente
    // o mostrare un dialog di conferma prima dell'eliminazione
    if (window.confirm(`Sei sicuro di voler eliminare ${user.first_name} ${user.last_name}?`)) {
      deleteUser(user.id);
    }
  };

  const handleSubmitUser = (userData: UserFormData) => {
    // Se stiamo modificando un utente esistente
    if (selectedUser) {
      updateUser(selectedUser.id, userData);
    } else {
      // Altrimenti stiamo creando un nuovo utente
      // Assicuriamoci che l'utente sia associato all'azienda corrente
      const userDataWithAzienda = {
        ...userData,
        azienda_id: id,
        role: 'cliente' as UserRole // Forza il ruolo a 'cliente'
      };
      
      createUser(userDataWithAzienda);
    }
    
    setIsUserDialogOpen(false);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Caricamento dettagli azienda...</span>
        </div>
      </MainLayout>
    );
  }

  if (!azienda) {
    return (
      <MainLayout>
        <div className="text-center p-12">
          <p>Azienda non trovata.</p>
          <Button onClick={handleBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Torna alla lista
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
          </Button>
          <h1 className="text-3xl font-bold flex-1">{azienda.nome}</h1>
          <Button onClick={handleEditAzienda}>
            <Edit className="mr-2 h-4 w-4" /> Modifica
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="info" className="flex items-center">
              <Building className="mr-2 h-4 w-4" /> Informazioni
            </TabsTrigger>
            <TabsTrigger value="referenti" className="flex items-center">
              <UsersIcon className="mr-2 h-4 w-4" /> Referenti
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Anagrafica Azienda</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="font-medium text-sm">Nome Azienda</h3>
                    <p className="text-lg">{azienda.nome}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Partita IVA</h3>
                    <p className="text-lg">{azienda.partita_iva}</p>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="font-medium text-sm">Email</h3>
                    <p className="text-lg">{azienda.email || '-'}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Telefono</h3>
                    <p className="text-lg">{azienda.telefono || '-'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">Indirizzo</h3>
                  <p className="text-lg">{azienda.indirizzo || '-'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">Firma Digitale</h3>
                  <p className="text-lg">{azienda.firma_digitale_attiva ? 'Attiva' : 'Non attiva'}</p>
                </div>
                
                <div>
                  <h3 className="font-medium text-sm">Data Creazione</h3>
                  <p className="text-lg">
                    {new Date(azienda.created_at).toLocaleDateString('it-IT', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="referenti">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Referenti Aziendali</CardTitle>
                <Button onClick={handleAddUser}>
                  Aggiungi Referente
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center items-center p-12">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Caricamento referenti...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {referenti.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Nessun referente associato a questa azienda.</p>
                        <Button onClick={handleAddUser} className="mt-4">
                          Aggiungi il primo referente
                        </Button>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">Nome</th>
                            <th className="text-left py-2">Cognome</th>
                            <th className="text-right py-2">Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {referenti.map((user) => (
                            <tr key={user.id} className="border-b">
                              <td className="py-3">{user.first_name || '-'}</td>
                              <td className="py-3">{user.last_name || '-'}</td>
                              <td className="py-3">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Modifica</span>
                                  </Button>
                                  
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive/80"
                                    onClick={() => handleDeleteUser(user)}
                                    disabled={user.id === currentUserID}
                                  >
                                    <ArrowLeft className="h-4 w-4" />
                                    <span className="sr-only">Elimina</span>
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <AziendaDialog
          isOpen={isAziendaDialogOpen}
          onOpenChange={setIsAziendaDialogOpen}
          onSubmit={handleSubmitAzienda}
          azienda={azienda}
          isSubmitting={isUpdating}
        />
        
        <UserDialog
          isOpen={isUserDialogOpen}
          onOpenChange={setIsUserDialogOpen}
          onSubmit={handleSubmitUser}
          user={selectedUser}
          isSubmitting={isCreatingUser || isUpdatingUser}
          defaultRole="cliente"
          hiddenRoles={['admin', 'socio', 'dipendente']}
          isNewUser={!selectedUser}
          preselectedAzienda={azienda}
        />
      </div>
    </MainLayout>
  );
}
