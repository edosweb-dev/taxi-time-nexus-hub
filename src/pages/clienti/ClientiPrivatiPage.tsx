import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from '@/components/layouts/MainLayout';
import { DesktopClientiPrivatiList } from '@/components/clienti/DesktopClientiPrivatiList';
import { MobileClientiPrivatiList } from '@/components/clienti/mobile-first/MobileClientiPrivatiList';
import { DeleteClientePrivatoDialog } from '@/components/clienti/DeleteClientePrivatoDialog';
import { CreateClientePrivatoDialog } from '@/components/clienti/CreateClientePrivatoDialog';
import { EditClientePrivatoDialog } from '@/components/clienti/EditClientePrivatoDialog';
import { fetchClientiPrivati, deleteClientePrivato } from '@/lib/api/clientiPrivati';
import { ClientePrivato } from '@/lib/types/servizi';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLayout } from '@/contexts/LayoutContext';
import { toast } from "sonner";

export default function ClientiPrivatiPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { setPaddingMode } = useLayout();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isMobile) {
      setPaddingMode('full-width');
    }
    return () => setPaddingMode('default');
  }, [isMobile, setPaddingMode]);
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<ClientePrivato | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<ClientePrivato | null>(null);

  const { data: clienti = [], isLoading } = useQuery({
    queryKey: ['clienti-privati'],
    queryFn: fetchClientiPrivati,
  });

  const handleAddCliente = () => {
    setIsCreateDialogOpen(true);
  };

  const handleViewCliente = (cliente: ClientePrivato) => {
    // TODO: Implementare pagina dettaglio cliente
    toast.info('Dettaglio cliente in arrivo');
  };

  const handleEditCliente = (cliente: ClientePrivato) => {
    setEditingCliente(cliente);
  };

  const handleDeleteCliente = (cliente: ClientePrivato) => {
    setClienteToDelete(cliente);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (clienteToDelete) {
      try {
        await deleteClientePrivato(clienteToDelete.id);
        queryClient.invalidateQueries({ queryKey: ['clienti-privati'] });
        toast.success("Cliente eliminato con successo");
        setDeleteDialogOpen(false);
        setClienteToDelete(null);
      } catch (error) {
        toast.error("Errore durante l'eliminazione del cliente");
        console.error(error);
      }
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Clienti Privati" showBottomNav={true}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout 
      title="Clienti Privati" 
      showBottomNav={true}
    >
      <div className="w-full px-0 md:px-4">
        <div className="space-y-6">
          {isMobile ? (
            <MobileClientiPrivatiList
              clienti={clienti}
              onEdit={handleEditCliente}
              onDelete={handleDeleteCliente}
              onView={handleViewCliente}
              onAddCliente={handleAddCliente}
            />
          ) : (
            <DesktopClientiPrivatiList 
              clienti={clienti}
              onEdit={handleEditCliente}
              onDelete={handleDeleteCliente}
              onView={handleViewCliente}
              onAddCliente={handleAddCliente}
            />
          )}

          <CreateClientePrivatoDialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          />

          {editingCliente && (
            <EditClientePrivatoDialog
              open={!!editingCliente}
              onOpenChange={(open) => !open && setEditingCliente(null)}
              cliente={editingCliente}
            />
          )}

          <DeleteClientePrivatoDialog
            cliente={clienteToDelete}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={confirmDelete}
          />
        </div>
      </div>
    </MainLayout>
  );
}
