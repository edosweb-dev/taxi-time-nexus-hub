
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SpeseList } from '@/components/spese/SpeseList';
import { SpesaForm } from '@/components/spese/SpesaForm';
import { ChevronRight, Home, Plus, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SpeseDipendentePage() {
  const [showForm, setShowForm] = useState(false);

  const handleSpesaAdded = () => {
    setShowForm(false);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="container mx-auto p-4 md:p-6 space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Le mie spese</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Le mie spese</h1>
                <p className="text-muted-foreground text-lg">
                  Gestisci e monitora le tue spese personali
                </p>
              </div>
              
              {/* Toggle buttons */}
              <div className="flex gap-2">
                <Button 
                  variant={showForm ? "outline" : "default"}
                  onClick={() => setShowForm(false)}
                  className="flex items-center gap-2"
                >
                  <List className="h-4 w-4" />
                  Lista spese
                </Button>
                <Button 
                  variant={showForm ? "default" : "outline"}
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuova spesa
                </Button>
              </div>
            </div>
          </div>

          {/* Contenuto principale */}
          {showForm ? (
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  Registra nuova spesa
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SpesaForm onSuccess={handleSpesaAdded} />
              </CardContent>
            </Card>
          ) : (
            <SpeseList />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
