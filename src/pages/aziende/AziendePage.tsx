
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { AziendaList } from '@/components/aziende/AziendaList';
import { AziendaSheet } from '@/components/aziende/AziendaSheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight, Home, Building2, Users, MapPin } from 'lucide-react';
import { useAziende } from '@/hooks/useAziende';
import { Azienda } from '@/lib/types';
import { AziendaFormData } from '@/lib/api/aziende';
import { toast } from '@/components/ui/use-toast';
import { createAzienda, updateAzienda, deleteAzienda } from '@/lib/api/aziende';

export default function AziendePage() {
  const navigate = useNavigate();
  const { aziende, refetch } = useAziende();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedAzienda, setSelectedAzienda] = useState<Azienda | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAzienda = () => {
    navigate('/nuova-azienda');
  };

  const handleViewAzienda = (azienda: Azienda) => {
    navigate(`/aziende/${azienda.id}`);
  };

  const handleEditAzienda = (azienda: Azienda) => {
    setSelectedAzienda(azienda);
    setIsSheetOpen(true);
  };

  const handleDeleteAzienda = async (azienda: Azienda) => {
    if (confirm('Sei sicuro di voler eliminare questa azienda?')) {
      try {
        await deleteAzienda(azienda.id);
        toast({
          title: "Azienda eliminata",
          description: "L'azienda è stata eliminata con successo.",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'eliminazione dell'azienda.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSubmit = async (data: AziendaFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedAzienda) {
        await updateAzienda(selectedAzienda.id, data);
        toast({
          title: "Azienda aggiornata",
          description: "L'azienda è stata aggiornata con successo.",
        });
      } else {
        await createAzienda(data);
        toast({
          title: "Azienda creata",
          description: "L'azienda è stata creata con successo.",
        });
      }
      setIsSheetOpen(false);
      refetch();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio dell'azienda.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcola statistiche
  const totalAziende = aziende.length;
  const aziendeConEmail = aziende.filter(a => a.email).length;
  const aziendeConTelefono = aziende.filter(a => a.telefono).length;
  const cittaUniche = new Set(aziende.filter(a => a.citta).map(a => a.citta)).size;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header con breadcrumb */}
        <div className="space-y-4">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">Aziende</span>
          </nav>
          
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <h1 className="page-title">Aziende</h1>
              <p className="text-description">
                Gestisci le aziende clienti
              </p>
            </div>
          </div>
        </div>

        {/* Statistiche rapide */}
        {totalAziende > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totale Aziende</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAziende}</div>
                <p className="text-xs text-muted-foreground">
                  Aziende registrate nel sistema
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Con Email</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aziendeConEmail}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((aziendeConEmail / totalAziende) * 100)}% del totale
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Con Telefono</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{aziendeConTelefono}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((aziendeConTelefono / totalAziende) * 100)}% del totale
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Città</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{cittaUniche}</div>
                <p className="text-xs text-muted-foreground">
                  Città diverse registrate
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <AziendaList 
          aziende={aziende}
          onEdit={handleEditAzienda}
          onDelete={handleDeleteAzienda}
          onView={handleViewAzienda}
          onAddAzienda={handleAddAzienda}
        />

        <AziendaSheet
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          onSubmit={handleSubmit}
          azienda={selectedAzienda}
          isSubmitting={isSubmitting}
        />
      </div>
    </MainLayout>
  );
}
