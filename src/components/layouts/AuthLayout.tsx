
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col justify-center px-4 sm:px-6 py-6 bg-gradient-to-br from-background via-background to-muted/10 overflow-hidden relative">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.03),transparent)]"></div>
      
      <div className="w-full max-w-sm mx-auto relative z-10 animate-fade-in">
        {/* Logo Section - Compact mobile design */}
        <div className="text-center mb-8 auth-enter">
          <div className="relative group flex justify-center mb-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center shadow-lg border border-primary/10">
              <img 
                src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
                alt="Taxitime Logo" 
                className="h-12 w-auto sm:h-14 object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLElement).parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="text-primary text-lg font-bold tracking-wider">TAXI</div>';
                  }
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Benvenuto</h1>
            <p className="text-sm text-muted-foreground">Accedi al tuo account</p>
          </div>
        </div>

        {/* Form Card - Enhanced mobile design */}
        <div className="w-full max-w-sm mx-auto bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/5">
          {children}
        </div>

        {/* Simplified footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground/60">
            Sicuro e veloce
          </p>
        </div>
      </div>
    </div>
  );
}
