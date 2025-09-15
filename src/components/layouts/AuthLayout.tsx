
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col justify-center px-4 sm:px-6 py-8 bg-gradient-to-br from-background to-muted/20 overflow-hidden">
      <div className="w-full max-w-md mx-auto animate-fade-in">
        {/* Logo Section - Mobile optimized */}
        <div className="text-center mb-6 sm:mb-8 auth-enter">
          <div className="relative group flex justify-center mb-6 sm:mb-8">
            <img 
              src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
              alt="Taxitime Logo" 
              className="h-16 w-auto sm:h-20 object-contain transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-foreground text-2xl font-bold tracking-wider animate-pulse">TAXITIME</div>';
                }
              }}
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 animate-fade-in">Benvenuto</h1>
          <p className="text-sm sm:text-base text-muted-foreground animate-fade-in">Accedi al tuo account</p>
        </div>

        {/* Form Section - Mobile optimized card */}
        <div className="w-full bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 sm:p-6 shadow-elegant auth-enter">
          {children}
        </div>

        {/* Mobile-friendly footer */}
        <div className="text-center mt-6 px-4">
          <p className="text-xs text-muted-foreground/70">
            © 2024 Taxitime. Sicurezza e prestazioni ottimizzate.
          </p>
        </div>
      </div>
    </div>
  );
}
