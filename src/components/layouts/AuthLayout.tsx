import { PropsWithChildren } from "react";
import "../../styles/auth.css";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="auth-page min-h-screen min-h-[100dvh] w-full bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center overflow-hidden relative p-4">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.08),transparent)]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(120,119,198,0.04),transparent)]"></div>
      
      <div className="w-full max-w-sm relative z-10">
        <div className="animate-fade-in">
          <div className="space-y-4">
            {/* Logo Section - Compact */}
            <div className="text-center">
              <div className="mb-2">
                <img
                  src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
                  alt="Taxitime Logo" 
                  className="h-16 sm:h-20 w-auto mx-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLElement).parentElement;
                    if (parent) {
                      parent.innerHTML = '<div class="text-primary text-xl font-bold tracking-wider text-center">TAXI</div>';
                    }
                  }}
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Accedi al tuo account per continuare
              </p>
            </div>

            {/* Form Section */}
            <div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
