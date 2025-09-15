
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="login-container min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center px-4 py-8 sm:p-6">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.03),transparent)]"></div>
      
      <div className="w-full max-w-[95vw] sm:max-w-sm md:max-w-md mx-auto relative z-10 space-y-8 animate-fade-in">
        {/* Logo Section - Responsive design */}
        <div className="text-center auth-enter">
          <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl shadow-lg border border-primary/10 flex items-center justify-center mb-8">
            <img 
              src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
              alt="Taxitime Logo" 
              className="h-10 w-auto sm:h-12 object-contain transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-primary text-lg font-bold tracking-wider">TAXI</div>';
                }
              }}
            />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Benvenuto</h2>
            <p className="text-sm sm:text-base text-muted-foreground">Accedi al tuo account</p>
          </div>
        </div>

        {/* Form Card - Fixed width and responsive */}
        <div className="login-form-card w-full max-w-none bg-white/95 backdrop-blur-xl border border-border/50 rounded-2xl p-4 sm:p-6 md:p-8">
          {children}
        </div>

        {/* Simplified footer */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground/60">
            Sicuro e veloce
          </p>
        </div>
      </div>
    </div>
  );
}
