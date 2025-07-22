
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.1)_1px,transparent_0)] bg-[length:24px_24px] opacity-30"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="h-32 w-32 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl border border-blue-200/50 ring-1 ring-blue-100/50">
            <img 
              src="/lovable-uploads/f9301fdf-4c2b-4c27-938e-04f6b32870f2.png" 
              alt="Taxitime Logo" 
              className="h-24 w-24 object-contain"
              onError={(e) => {
                // Fallback se l'immagine non è disponibile
                (e.target as HTMLImageElement).style.display = 'none';
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                  parent.innerHTML = '<div class="text-blue-700 text-2xl font-bold">TAXI</div>';
                }
              }}
            />
          </div>
        </div>

        {/* Form Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-100/50 p-8 ring-1 ring-blue-50">
          {children}
        </div>
      </div>
    </div>
  );
}
