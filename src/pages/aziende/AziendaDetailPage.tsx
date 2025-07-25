
import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowLeft, Building, Users as UsersIcon, Edit, Save, X } from 'lucide-react';
import { AziendaForm } from '@/components/aziende/AziendaForm';
import { UserSheet } from '@/components/users/UserSheet';
import { InfoTab } from '@/components/aziende/detail/InfoTab';
import { ReferentiTab } from '@/components/aziende/detail/ReferentiTab';
import { useAziendaDetail } from '@/hooks/useAziendaDetail';
import { useAuth } from '@/contexts/AuthContext';

export default function AziendaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const currentUserID = user?.id;
  
  const {
    azienda,
    isLoading,
    activeTab,
    setActiveTab,
    referenti,
    isLoadingUsers,
    isEditMode,
    setIsEditMode,
    isUserSheetOpen,
    setIsUserSheetOpen,
    selectedUser,
    handleBack,
    handleEditAzienda,
    handleCancelEdit,
    handleSubmitAzienda,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    handleSubmitUser,
    isUpdating,
    isCreatingUser,
    isUpdatingUser
  } = useAziendaDetail(id, currentUserID);

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
      <div className="space-y-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" onClick={handleBack} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
          </Button>
          <h1 className="text-3xl font-bold flex-1">{azienda.nome}</h1>
          {!isEditMode ? (
            <Button onClick={handleEditAzienda}>
              <Edit className="mr-2 h-4 w-4" /> Modifica
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit}>
                <X className="mr-2 h-4 w-4" /> Annulla
              </Button>
            </div>
          )}
        </div>

        {isEditMode ? (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Modifica Azienda</h2>
            <AziendaForm
              azienda={azienda}
              onSubmit={handleSubmitAzienda}
              onCancel={handleCancelEdit}
              isSubmitting={isUpdating}
            />
          </div>
        ) : (
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
              <InfoTab 
                azienda={azienda} 
                referenti={referenti}
                onManageReferenti={() => setActiveTab('referenti')}
              />
            </TabsContent>
            
            <TabsContent value="referenti">
              <ReferentiTab
                azienda={azienda}
                referenti={referenti}
                isLoadingUsers={isLoadingUsers}
                currentUserID={currentUserID}
                onAddUser={handleAddUser}
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                isUserDialogOpen={isUserSheetOpen}
                setIsUserDialogOpen={setIsUserSheetOpen}
                selectedUser={selectedUser}
                onSubmitUser={handleSubmitUser}
                isCreatingUser={isCreatingUser}
                isUpdatingUser={isUpdatingUser}
              />
            </TabsContent>
          </Tabs>
        )}
        
        <UserSheet
          isOpen={isUserSheetOpen}
          onOpenChange={setIsUserSheetOpen}
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
