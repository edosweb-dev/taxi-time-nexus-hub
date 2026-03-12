import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface AssegnaResponsabileIncassoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servizioId: string;
  currentResponsabileId?: string | null;
  onSuccess?: () => void;
}

interface UserOption {
  id: string;
  label: string;
}

export function AssegnaResponsabileIncassoDialog({
  open,
  onOpenChange,
  servizioId,
  currentResponsabileId,
  onSuccess,
}: AssegnaResponsabileIncassoDialogProps) {
  const queryClient = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedUserId(currentResponsabileId || "");
      fetchUsers();
    }
  }, [open, currentResponsabileId]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, role")
      .in("role", ["admin", "socio"])
      .order("first_name");

    if (error) {
      toast({ title: "Errore", description: "Impossibile caricare gli utenti", variant: "destructive" });
      setLoading(false);
      return;
    }

    setUsers(
      (data || []).map((u) => ({
        id: u.id,
        label: `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Utente senza nome",
      }))
    );
    setLoading(false);
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    setSaving(true);

    const { error } = await supabase
      .from("servizi")
      .update({ consegna_contanti_a: selectedUserId })
      .eq("id", servizioId);

    if (error) {
      toast({ title: "Errore", description: "Impossibile aggiornare il responsabile incasso", variant: "destructive" });
      setSaving(false);
      return;
    }

    toast({ title: "Responsabile incasso aggiornato" });
    queryClient.invalidateQueries({ queryKey: ["servizi"] });
    queryClient.invalidateQueries({ queryKey: ["servizio", servizioId] });
    queryClient.invalidateQueries({ queryKey: ["servizio-detail", servizioId] });
    queryClient.invalidateQueries({ queryKey: ["servizi-with-passeggeri"] });
    setSaving(false);
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentResponsabileId ? "Modifica responsabile incasso" : "Assegna responsabile incasso"}
          </DialogTitle>
          <DialogDescription>
            Seleziona chi ha ricevuto il contante per questo servizio.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder={loading ? "Caricamento..." : "Seleziona utente"} />
            </SelectTrigger>
            <SelectContent>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Annulla
          </Button>
          <Button onClick={handleSave} disabled={!selectedUserId || saving}>
            {saving ? "Salvataggio..." : "Conferma"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
