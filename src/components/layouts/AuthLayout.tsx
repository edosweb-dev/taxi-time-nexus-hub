
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="login-centered min-h-screen min-h-[100dvh] w-full bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.03),transparent)]"></div>
      
      <div className="w-full flex items-center justify-center relative z-10">
        <div className="w-full max-w-sm sm:max-w-md animate-fade-in">
          <div className="space-y-8">
            {/* Logo Section - Centrato */}
            <div className="text-center auth-enter">
              <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl shadow-lg border border-primary/10 flex items-center justify-center mb-6 sm:mb-8">
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
              
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Benvenuto
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Accedi al tuo account
              </p>
            </div>

            {/* Form Section */}
            {children}

            {/* Footer Links - Centrati */}
            <div className="text-center space-y-4">
              <p className="text-xs text-muted-foreground/60">
                Sicuro e veloce
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
