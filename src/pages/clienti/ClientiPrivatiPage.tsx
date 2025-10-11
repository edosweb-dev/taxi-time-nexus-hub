import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { fetchClientiPrivati, deleteClientePrivato } from "@/lib/api/clientiPrivati";
import { ClientePrivato } from "@/lib/types/servizi";
import { CreateClientePrivatoDialog } from "@/components/clienti/CreateClientePrivatoDialog";
import { EditClientePrivatoDialog } from "@/components/clienti/EditClientePrivatoDialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ClientiPrivatiPage() {
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<ClientePrivato | null>(null);
  const [deletingClienteId, setDeletingClienteId] = useState<string | null>(null);
  
  const { data: clienti, isLoading } = useQuery({
    queryKey: ['clienti-privati'],
    queryFn: fetchClientiPrivati,
  });

  const { mutate: handleDelete, isPending: isDeleting } = useMutation({
    mutationFn: deleteClientePrivato,
    onSuccess: () => {
      toast.success("Cliente eliminato con successo");
      queryClient.invalidateQueries({ queryKey: ['clienti-privati'] });
      setDeletingClienteId(null);
    },
    onError: (error) => {
      toast.error("Errore durante l'eliminazione del cliente");
      console.error(error);
    },
  });

  return (
    <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clienti Privati</h1>
            <p className="text-muted-foreground mt-2">
              Gestisci l'anagrafica dei clienti privati
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuovo Cliente
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : clienti && clienti.length > 0 ? (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cognome</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefono</TableHead>
                  <TableHead>Città</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clienti.map((cliente) => (
                  <TableRow key={cliente.id}>
                    <TableCell className="font-medium">{cliente.cognome}</TableCell>
                    <TableCell>{cliente.nome}</TableCell>
                    <TableCell>{cliente.email || '-'}</TableCell>
                    <TableCell>{cliente.telefono || '-'}</TableCell>
                    <TableCell>{cliente.citta || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingCliente(cliente)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => setDeletingClienteId(cliente.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">Nessun cliente privato trovato</p>
            <Button 
              onClick={() => setIsCreateDialogOpen(true)}
              className="mt-4"
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crea il primo cliente
            </Button>
          </div>
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

        <AlertDialog open={!!deletingClienteId} onOpenChange={(open) => !open && setDeletingClienteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
              <AlertDialogDescription>
                Questa azione non può essere annullata. Il cliente verrà eliminato permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annulla</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingClienteId && handleDelete(deletingClienteId)}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminazione..." : "Elimina"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
