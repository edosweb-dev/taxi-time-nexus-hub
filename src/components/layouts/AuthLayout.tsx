
import { PropsWithChildren } from "react";
import "../../styles/auth.css";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="auth-page login-centered min-h-screen min-h-[100dvh] w-full bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center overflow-hidden relative">
      {/* Enhanced background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.08),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.04),transparent)]"></div>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(120,119,198,0.02)_100%)]"></div>
      
      <div className="w-full flex items-center justify-center relative z-10 overflow-hidden">
        <div className="auth-form-container animate-fade-in">
          <div className="space-y-8">
            {/* Logo Section - Enhanced */}
            <div className="text-center auth-enter">
              <div className="mb-3 sm:mb-4">
                <img
                  src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
                  alt="Taxitime Logo" 
                  className="h-32 w-auto sm:h-40 mx-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="text-primary text-2xl font-bold tracking-wider text-center">TAXI</div>';
                    }
                  }}
                />
              </div>
              
              <div className="space-y-2 animate-slide-up">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Bentornato
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground font-medium">
                  Accedi al tuo account per continuare
                </p>
              </div>
            </div>

            {/* Form Section */}
            <div>
              {children}
            </div>

            {/* Footer Enhanced */}
            <div className="text-center space-y-4 animate-fade-in-delay">
              <div className="flex items-center justify-center space-x-2">
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
                <p className="text-xs text-muted-foreground/80 font-medium tracking-wide">
                  SICURO • VELOCE • AFFIDABILE
                </p>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent flex-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
