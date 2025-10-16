import { useState } from 'react';
import { Building2, Users, UserCircle2, Settings } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { InfoTabMobile } from './InfoTabMobile';
import { ReferentiTabMobile } from './ReferentiTabMobile';
import { PasseggeriTabMobile } from './PasseggeriTabMobile';
import { ConfigTabMobile } from './ConfigTabMobile';
import { MobileDetailSkeleton } from './MobileDetailSkeleton';
import { Azienda, Profile } from '@/lib/types';
import { Passeggero } from '@/lib/api/passeggeri';

interface MobileAziendaDetailTabsProps {
  azienda: Azienda;
  referenti: Profile[];
  passeggeri: Passeggero[];
  isLoadingUsers: boolean;
  isLoadingPasseggeri: boolean;
  onAddReferente: () => void;
  onEditReferente: (referente: Profile) => void;
  onDeleteReferente: (referente: Profile) => void;
  onAddPasseggero?: () => void;
  onEditPasseggero?: (passeggero: Passeggero) => void;
  onDeletePasseggero?: (passeggero: Passeggero) => void;
}

export function MobileAziendaDetailTabs({ 
  azienda, 
  referenti, 
  passeggeri,
  isLoadingUsers,
  isLoadingPasseggeri,
  onAddReferente,
  onEditReferente,
  onDeleteReferente,
  onAddPasseggero,
  onEditPasseggero,
  onDeletePasseggero
}: MobileAziendaDetailTabsProps) {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tabs header sticky */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <TabsList className="w-full grid grid-cols-4 rounded-none h-12 bg-muted/50">
          <TabsTrigger value="info" className="flex flex-col gap-0.5 data-[state=active]:bg-background">
            <Building2 className="h-4 w-4" />
            <span className="text-xs">Info</span>
          </TabsTrigger>
          <TabsTrigger value="referenti" className="flex flex-col gap-0.5 data-[state=active]:bg-background relative">
            <Users className="h-4 w-4" />
            <span className="text-xs">Referenti</span>
            {referenti.length > 0 && (
              <span className="absolute top-1 right-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 min-w-[18px] text-center">
                {referenti.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="passeggeri" className="flex flex-col gap-0.5 data-[state=active]:bg-background relative">
            <UserCircle2 className="h-4 w-4" />
            <span className="text-xs">Passeggeri</span>
            {passeggeri.length > 0 && (
              <span className="absolute top-1 right-1 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 min-w-[18px] text-center">
                {passeggeri.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="config" className="flex flex-col gap-0.5 data-[state=active]:bg-background">
            <Settings className="h-4 w-4" />
            <span className="text-xs">Config</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        <TabsContent value="info" className="mt-0 space-y-4">
          <InfoTabMobile azienda={azienda} />
        </TabsContent>

        <TabsContent value="referenti" className="mt-0 space-y-3">
          {isLoadingUsers ? (
            <MobileDetailSkeleton tab="referenti" />
          ) : (
            <ReferentiTabMobile 
              referenti={referenti}
              onAdd={onAddReferente}
              onEdit={onEditReferente}
              onDelete={onDeleteReferente}
            />
          )}
        </TabsContent>

        <TabsContent value="passeggeri" className="mt-0 space-y-3">
          {isLoadingPasseggeri ? (
            <MobileDetailSkeleton tab="passeggeri" />
          ) : (
            <PasseggeriTabMobile 
              passeggeri={passeggeri}
              referenti={referenti}
              aziendaId={azienda.id}
              onAdd={onAddPasseggero}
              onEdit={onEditPasseggero}
              onDelete={onDeletePasseggero}
            />
          )}
        </TabsContent>

        <TabsContent value="config" className="mt-0 space-y-4">
          <ConfigTabMobile azienda={azienda} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
