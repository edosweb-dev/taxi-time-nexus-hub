
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background gradient using design tokens */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,hsl(var(--primary)/0.1)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="h-32 w-32 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border border-border">
            <img 
              src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
              alt="Taxitime Logo" 
              className="h-24 w-24 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-primary text-2xl font-bold">TAXI</div>';
                }
              }}
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-card/95 backdrop-blur-sm rounded-xl shadow-lg border border-border p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
