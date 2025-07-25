
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
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header ottimizzato */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={handleBack} size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Indietro
            </Button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{azienda.nome}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Dettagli e gestione azienda cliente
              </p>
            </div>
          </div>
          {!isEditMode ? (
            <Button onClick={handleEditAzienda} size="sm">
              <Edit className="mr-2 h-4 w-4" /> Modifica
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancelEdit} size="sm">
                <X className="mr-2 h-4 w-4" /> Annulla
              </Button>
            </div>
          )}
        </div>

        {isEditMode ? (
          <div className="max-w-4xl">
            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-6 text-foreground">Modifica Azienda</h2>
              <AziendaForm
                azienda={azienda}
                onSubmit={handleSubmitAzienda}
                onCancel={handleCancelEdit}
                isSubmitting={isUpdating}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="info" className="text-sm font-medium">
                  <Building className="mr-2 h-4 w-4" /> Informazioni
                </TabsTrigger>
                <TabsTrigger value="referenti" className="text-sm font-medium">
                  <UsersIcon className="mr-2 h-4 w-4" /> Referenti
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-0">
                <InfoTab 
                  azienda={azienda} 
                  referenti={referenti}
                  onManageReferenti={() => setActiveTab('referenti')}
                />
              </TabsContent>
              
              <TabsContent value="referenti" className="mt-0">
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
          </div>
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
