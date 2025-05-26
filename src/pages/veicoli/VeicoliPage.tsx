
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { VeicoloSheet, VeicoloList } from '@/components/veicoli';
import { useVeicoli, useCreateVeicolo, useUpdateVeicolo, useDeleteVeicolo } from '@/hooks/useVeicoli';
import { Veicolo, VeicoloFormData } from '@/lib/types/veicoli';

export default function VeicoliPage() {
  const { veicoli, isLoading, refetch } = useVeicoli();
  const createVeicoloMutation = useCreateVeicolo();
  const updateVeicoloMutation = useUpdateVeicolo();
  const deleteVeicoloMutation = useDeleteVeicolo();

  const [showSheet, setShowSheet] = useState(false);
  const [editingVeicolo, setEditingVeicolo] = useState<Veicolo | undefined>();
  const [veicoloToDelete, setVeicoloToDelete] = useState<Veicolo | null>(null);

  const handleCreate = () => {
    setEditingVeicolo(undefined);
    setShowSheet(true);
  };

  const handleEdit = (veicolo: Veicolo) => {
    setEditingVeicolo(veicolo);
    setShowSheet(true);
  };

  const handleSubmit = async (data: VeicoloFormData) => {
    try {
      if (editingVeicolo) {
        await updateVeicoloMutation.mutateAsync({
          id: editingVeicolo.id,
          data,
        });
      } else {
        await createVeicoloMutation.mutateAsync(data);
      }
      setShowSheet(false);
      setEditingVeicolo(undefined);
    } catch (error) {
      console.error('Error saving veicolo:', error);
    }
  };

  const handleDelete = (veicolo: Veicolo) => {
    setVeicoloToDelete(veicolo);
  };

  const confirmDelete = async () => {
    if (veicoloToDelete) {
      try {
        await deleteVeicoloMutation.mutateAsync(veicoloToDelete.id);
        setVeicoloToDelete(null);
      } catch (error) {
        console.error('Error deleting veicolo:', error);
      }
    }
  };

  const isSubmitting = createVeicoloMutation.isPending || updateVeicoloMutation.isPending;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestione Veicoli</h1>
            <p className="text-muted-foreground">
              Gestisci il parco auto aziendale
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Veicolo
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Veicoli Aziendali</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p>Caricamento veicoli...</p>
              </div>
            ) : (
              <VeicoloList
                veicoli={veicoli}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </CardContent>
        </Card>

        <VeicoloSheet
          open={showSheet}
          onOpenChange={setShowSheet}
          veicolo={editingVeicolo}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />

        <AlertDialog open={!!veicoloToDelete} onOpenChange={() => setVeicoloToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
                Disattiva Veicolo
              </AlertDialogTitle>
              <AlertDialogDescription>
                Sei sicuro di voler disattivare il veicolo <strong>{veicoloToDelete?.modello} - {veicoloToDelete?.targa}</strong>?
                Il veicolo non sarà più disponibile per nuovi servizi, ma rimane visibile nei servizi esistenti.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Disattiva
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
