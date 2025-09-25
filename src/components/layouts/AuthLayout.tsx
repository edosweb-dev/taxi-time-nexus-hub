
import { PropsWithChildren } from "react";
import "../../styles/auth.css";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="auth-page login-centered min-h-screen min-h-[100dvh] w-full bg-gradient-to-br from-background via-background to-muted/10 flex items-center justify-center overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.03),transparent)]"></div>
      
      <div className="w-full flex items-center justify-center relative z-10 overflow-hidden">
        <div 
          className="auth-container w-full max-w-[280px] sm:max-w-sm md:max-w-md animate-fade-in mx-auto"
          style={{ maxWidth: "min(calc(100vw - 40px), 448px)" }}
        >
          <div className="space-y-6">
            {/* Logo Section - Centrato */}
            <div className="text-center auth-enter">
              <div className="mb-4 sm:mb-6">
                <img
                  src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
                  alt="Taxitime Logo" 
                  className="h-20 w-auto sm:h-28 mx-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="text-primary text-xl font-bold tracking-wider text-center">TAXI</div>';
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
