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
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b shadow-sm">
        <TabsList className="w-full grid grid-cols-4 rounded-none h-14 bg-transparent">
          <TabsTrigger value="info" className="flex flex-col gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
            <Building2 className="h-5 w-5" />
            <span className="text-[11px] font-medium">Info</span>
          </TabsTrigger>
          <TabsTrigger value="referenti" className="flex flex-col gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative transition-all">
            <Users className="h-5 w-5" />
            <span className="text-[11px] font-medium">Referenti</span>
            {referenti.length > 0 && (
              <span className="absolute top-1.5 right-1.5 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 min-w-[18px] text-center font-semibold shadow-sm">
                {referenti.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="passeggeri" className="flex flex-col gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary relative transition-all">
            <UserCircle2 className="h-5 w-5" />
            <span className="text-[11px] font-medium">Passeggeri</span>
            {passeggeri.length > 0 && (
              <span className="absolute top-1.5 right-1.5 text-[10px] bg-primary text-primary-foreground rounded-full px-1.5 min-w-[18px] text-center font-semibold shadow-sm">
                {passeggeri.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="config" className="flex flex-col gap-1 data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
            <Settings className="h-5 w-5" />
            <span className="text-[11px] font-medium">Config</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content */}
      <div className="p-4 pb-safe-area-inset-bottom">
        <TabsContent value="info" className="mt-0 space-y-4 animate-fade-in">
          <InfoTabMobile azienda={azienda} />
        </TabsContent>

        <TabsContent value="referenti" className="mt-0 space-y-4 animate-fade-in">
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

        <TabsContent value="passeggeri" className="mt-0 space-y-4 animate-fade-in">
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

        <TabsContent value="config" className="mt-0 space-y-4 animate-fade-in">
          <ConfigTabMobile azienda={azienda} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
