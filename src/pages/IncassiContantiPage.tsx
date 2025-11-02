import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { TabellaIncassiContanti } from '@/components/spese-aziendali/TabellaIncassiContanti';
import { ChevronRight, Home, Coins } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function IncassiContantiPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile || !['admin', 'socio'].includes(profile.role)) {
    navigate('/dashboard');
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <button
            onClick={() => navigate('/spese-aziendali')}
            className="hover:text-foreground transition-colors"
          >
            Spese Aziendali
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">Incassi Contanti</span>
        </div>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Coins className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                  Incassi Contanti da Servizi
                </h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Visualizza servizi pagati in contanti e traccia le consegne
              </p>
            </div>
          </div>
        </div>

        {/* Tabella */}
        <TabellaIncassiContanti />
      </div>
    </MainLayout>
  );
}
