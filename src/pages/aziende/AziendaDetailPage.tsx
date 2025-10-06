import { useParams } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { AziendaForm } from '@/components/aziende/AziendaForm';
import { UserSheet } from '@/components/users/UserSheet';
import { Loader2, ArrowLeft, Edit, Save, X, Home, ChevronRight } from 'lucide-react';
import { InfoTab } from '@/components/aziende/detail/InfoTab';
import { MobileAziendaDetailHeader } from '@/components/aziende/detail/mobile/MobileAziendaDetailHeader';
import { MobileAziendaDetailTabs } from '@/components/aziende/detail/mobile/MobileAziendaDetailTabs';
import { DeleteReferenteDialog } from '@/components/aziende/DeleteReferenteDialog';
import { useAziendaDetail } from '@/hooks/useAziendaDetail';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

export default function AziendaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const currentUserID = user?.id;
  const isMobile = useIsMobile();
  
  const {
    azienda,
    isLoading,
    referenti,
    isLoadingUsers,
    isEditMode,
    setIsEditMode,
    isUserSheetOpen,
    setIsUserSheetOpen,
    selectedUser,
    deleteDialogOpen,
    setDeleteDialogOpen,
    referenteToDelete,
    passeggeri,
    isLoadingPasseggeri,
    handleBack,
    handleEditAzienda,
    handleCancelEdit,
    handleSubmitAzienda,
    handleAddUser,
    handleEditUser,
    handleDeleteUser,
    confirmDeleteUser,
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
        {/* Mobile Header */}
        {isMobile && !isEditMode && (
          <MobileAziendaDetailHeader
            azienda={azienda}
            onBack={handleBack}
            onEdit={handleEditAzienda}
          />
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div className="space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h1 className="page-title">{azienda.nome}</h1>
                <p className="text-description">
                  Dettagli e gestione azienda cliente
                </p>
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
          </div>
        )}

        {isEditMode ? (
          <AziendaForm
            azienda={azienda}
            onSubmit={handleSubmitAzienda}
            onCancel={handleCancelEdit}
            isSubmitting={isUpdating}
          />
        ) : (
          <>
            {isMobile ? (
              <MobileAziendaDetailTabs
                azienda={azienda}
                referenti={referenti}
                passeggeri={passeggeri}
                isLoadingUsers={isLoadingUsers}
                isLoadingPasseggeri={isLoadingPasseggeri}
                onAddReferente={handleAddUser}
                onEditReferente={handleEditUser}
                onDeleteReferente={handleDeleteUser}
              />
            ) : (
              <div className="space-y-6">
                <InfoTab 
                  azienda={azienda} 
                  referenti={referenti}
                  onAddReferente={handleAddUser}
                  onEditReferente={handleEditUser}
                  onDeleteReferente={handleDeleteUser}
                />
              </div>
            )}
          </>
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

        <DeleteReferenteDialog
          referente={referenteToDelete}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={confirmDeleteUser}
        />
      </div>
    </MainLayout>
  );
}
