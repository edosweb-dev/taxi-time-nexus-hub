
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-background overflow-hidden">
      <div className="w-full max-w-[400px] px-6">
        {/* Logo Section - Flat and minimal */}
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
            alt="Taxitime Logo" 
            className="h-[150px] w-[150px] object-contain mx-auto mb-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              const parent = (e.target as HTMLElement).parentElement;
              if (parent) {
                parent.innerHTML = '<div class="text-foreground text-2xl font-bold tracking-wider">TAXITIME</div>';
              }
            }}
          />
          <h1 className="subsection-title text-foreground">Benvenuto</h1>
          <p className="text-sm text-muted-foreground mt-1">Accedi al tuo account</p>
        </div>

        {/* Form Section - Clean and minimal */}
        <div className="w-full bg-card border border-border rounded-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
