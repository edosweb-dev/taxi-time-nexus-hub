
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SpeseAziendaliDashboard } from '@/components/spese-aziendali/SpeseAziendaliDashboard';
import { ChevronRight, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function SpeseAziendaliPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  if (!profile || profile.role !== 'admin') {
    return null;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
          {/* Header con breadcrumb */}
          <div className="space-y-4">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Home className="h-4 w-4" />
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Spese Aziendali</span>
            </nav>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground">Spese Aziendali</h1>
                <p className="text-muted-foreground text-lg">
                  Gestisci movimenti, incassi e pagamenti aziendali
                </p>
              </div>
            </div>
          </div>

          {/* Dashboard */}
          <SpeseAziendaliDashboard />
      </div>
    </MainLayout>
  );
}
