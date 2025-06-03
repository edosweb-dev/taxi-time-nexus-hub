
import React, { useState, useEffect } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle } from "lucide-react";
import { Profile } from "@/lib/types";
import { supabase } from '@/lib/supabase';

interface UserDeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  user: Profile | null;
  isDeleting: boolean;
}

interface UserDataSummary {
  servizi: number;
  stipendi: number;
  spese: number;
  turni: number;
  movimenti: number;
  spese_aziendali: number;
}

export function UserDeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  user,
  isDeleting
}: UserDeleteConfirmDialogProps) {
  const [summary, setSummary] = useState<UserDataSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadUserDataSummary();
    }
  }, [isOpen, user]);

  const loadUserDataSummary = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Count servizi
      const { count: serviziCount } = await supabase
        .from('servizi')
        .select('*', { count: 'exact', head: true })
        .eq('assegnato_a', user.id);

      // Count stipendi
      const { count: stipendiCount } = await supabase
        .from('stipendi')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count spese
      const { count: speseCount } = await supabase
        .from('spese_dipendenti')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count turni
      const { count: turniCount } = await supabase
        .from('shifts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Count movimenti
      const { count: movimentiCount } = await supabase
        .from('movimenti_aziendali')
        .select('*', { count: 'exact', head: true })
        .eq('effettuato_da_id', user.id);

      // Count spese aziendali
      const { count: speseAziendaliCount } = await supabase
        .from('spese_aziendali')
        .select('*', { count: 'exact', head: true })
        .eq('socio_id', user.id);

      setSummary({
        servizi: serviziCount || 0,
        stipendi: stipendiCount || 0,
        spese: speseCount || 0,
        turni: turniCount || 0,
        movimenti: movimentiCount || 0,
        spese_aziendali: speseAziendaliCount || 0
      });
    } catch (error) {
      console.error('Error loading user data summary:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const totalRecords = summary ? 
    summary.servizi + summary.stipendi + summary.spese + summary.turni + summary.movimenti + summary.spese_aziendali : 0;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Conferma Eliminazione Utente
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <p>
                Stai per eliminare definitivamente l'utente{" "}
                <span className="font-semibold">
                  {user.first_name} {user.last_name}
                </span>.
              </p>
              
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Caricamento dati...</span>
                </div>
              ) : summary ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium">
                    Dati che verranno sottoposti a backup prima dell'eliminazione:
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>Servizi:</span>
                      <Badge variant="outline">{summary.servizi}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Stipendi:</span>
                      <Badge variant="outline">{summary.stipendi}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Spese:</span>
                      <Badge variant="outline">{summary.spese}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Turni:</span>
                      <Badge variant="outline">{summary.turni}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Movimenti:</span>
                      <Badge variant="outline">{summary.movimenti}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Spese Aziendali:</span>
                      <Badge variant="outline">{summary.spese_aziendali}</Badge>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center font-medium">
                      <span>Totale record:</span>
                      <Badge variant={totalRecords > 0 ? "default" : "secondary"}>
                        {totalRecords}
                      </Badge>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      ℹ️ Sistema di Backup Attivo
                    </p>
                    <p className="text-blue-800">
                      Tutti i dati verranno salvati in un backup completo prima dell'eliminazione e potranno essere consultati dalla sezione amministrativa.
                    </p>
                  </div>
                </div>
              ) : null}

              <p className="text-sm text-destructive font-medium">
                Questa azione è irreversibile.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Annulla
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className="bg-destructive hover:bg-destructive/90"
            disabled={isDeleting || loading}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Eliminazione in corso...
              </>
            ) : (
              "Conferma Eliminazione"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
