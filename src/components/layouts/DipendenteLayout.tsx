import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { DipendenteHeader } from "@/components/dipendente/DipendenteHeader";
import { DipendenteMobileNav } from "@/components/dipendente/DipendenteMobileNav";
import { DipendenteMobileSidebar } from "@/components/dipendente/DipendenteMobileSidebar";
import { DipendenteSidebar } from "@/components/dipendente/DipendenteSidebar";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

interface DipendenteLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function DipendenteLayout({ children, title }: DipendenteLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <ImpersonationBanner />
        <DipendenteHeader onMenuToggle={() => setSidebarOpen(true)} />
        <main className="flex-1 pb-36 overflow-y-auto">
          <div className="p-4 md:p-6">
            {children}
          </div>
        </main>
        <DipendenteMobileNav />
        <DipendenteMobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        <div className="flex flex-1">
          <DipendenteSidebar />
          <main className="flex-1 overflow-y-auto">
            <ImpersonationBanner />
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
