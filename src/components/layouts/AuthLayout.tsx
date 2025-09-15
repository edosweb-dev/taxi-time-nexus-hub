
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <div className="w-full max-w-[400px] px-6 animate-fade-in">
        {/* Logo Section - Animated entrance */}
        <div className="text-center mb-8 auth-enter">
          <div className="relative group">
            <img 
              src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
              alt="Taxitime Logo" 
              className="h-[150px] w-[150px] object-contain mx-auto mb-4 transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-foreground text-2xl font-bold tracking-wider animate-pulse">TAXITIME</div>';
                }
              }}
            />
          </div>
          <h1 className="subsection-title text-foreground animate-fade-in">Benvenuto</h1>
          <p className="text-sm text-muted-foreground mt-1 animate-fade-in">Accedi al tuo account</p>
        </div>

        {/* Form Section - Enhanced with shadow and animation */}
        <div className="w-full bg-card/95 backdrop-blur-sm border border-border rounded-lg p-6 shadow-elegant auth-enter">
          {children}
        </div>

        {/* Subtle footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-muted-foreground/70">
            © 2024 Taxitime. Sicurezza e prestazioni ottimizzate.
          </p>
        </div>
      </div>
    </div>
  );
}
