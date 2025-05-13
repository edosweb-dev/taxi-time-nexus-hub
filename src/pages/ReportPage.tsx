
import React, { useState } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ReportsList } from '@/components/servizi/report/ReportsList';
import { ReportGeneratorDialog } from '@/components/servizi/report/ReportGeneratorDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConsuntivatiList } from '@/components/servizi/report/ConsuntivatiList';

export default function ReportPage() {
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"reports" | "consuntivati">("reports");
  const { profile } = useAuth();

  const isAdminOrSocio = profile?.role === 'admin' || profile?.role === 'socio';
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Report Aziende</h1>
            <p className="text-muted-foreground">
              Gestisci i report mensili dei servizi consuntivati per azienda e referente
            </p>
          </div>
          {isAdminOrSocio && (
            <Button onClick={() => setIsGenerateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Genera Report
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "reports" | "consuntivati")}>
          <TabsList className="mb-4">
            <TabsTrigger value="reports">Report Generati</TabsTrigger>
            <TabsTrigger value="consuntivati">Servizi Consuntivati</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports">
            <ReportsList />
          </TabsContent>
          
          <TabsContent value="consuntivati">
            <ConsuntivatiList />
          </TabsContent>
        </Tabs>
        
        <ReportGeneratorDialog 
          open={isGenerateDialogOpen} 
          onOpenChange={setIsGenerateDialogOpen} 
        />
      </div>
    </MainLayout>
  );
}
