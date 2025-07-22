
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm">
        {/* Logo Section - Flat and minimal */}
        <div className="text-center mb-12">
          <img 
            src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
            alt="Taxitime Logo" 
            className="h-16 w-16 object-contain mx-auto mb-6"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.innerHTML = '<div class="text-foreground text-3xl font-bold tracking-wider">TAXITIME</div>';
              }
            }}
          />
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Benvenuto</h1>
          <p className="text-sm text-muted-foreground mt-2">Accedi al tuo account</p>
        </div>

        {/* Form Section - Clean and minimal */}
        <div className="bg-card border border-border rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
