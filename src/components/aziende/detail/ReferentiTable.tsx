
import { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReferentiTableProps {
  referenti: Profile[];
  isLoadingUsers: boolean;
  currentUserID: string | undefined;
  onEditUser: (user: Profile) => void;
  onDeleteUser: (user: Profile) => void;
  onAddUser: () => void;
}

export function ReferentiTable({
  referenti,
  isLoadingUsers,
  currentUserID,
  onEditUser,
  onDeleteUser,
  onAddUser,
}: ReferentiTableProps) {
  if (isLoadingUsers) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2">Caricamento referenti...</span>
      </div>
    );
  }

  if (referenti.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nessun referente associato a questa azienda.</p>
        <Button onClick={onAddUser} className="mt-4">
          Aggiungi il primo referente
        </Button>
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <TableHead className="text-left py-2">Nome</TableHead>
          <TableHead className="text-left py-2">Cognome</TableHead>
          <TableHead className="text-right py-2">Azioni</TableHead>
        </tr>
      </thead>
      <tbody>
        {referenti.map((user) => (
          <tr key={user.id} className="border-b">
            <TableCell className="py-3">{user.first_name || '-'}</TableCell>
            <TableCell className="py-3">{user.last_name || '-'}</TableCell>
            <TableCell className="py-3">
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEditUser(user)}
                >
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Modifica</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive/80"
                  onClick={() => onDeleteUser(user)}
                  disabled={user.id === currentUserID}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Elimina</span>
                </Button>
              </div>
            </TableCell>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
