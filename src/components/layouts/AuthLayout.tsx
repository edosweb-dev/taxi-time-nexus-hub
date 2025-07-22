
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md mx-auto">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="h-32 w-32 bg-blue-50 rounded-full flex items-center justify-center shadow-lg border border-blue-100">
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
        <div className="bg-white rounded-xl shadow-xl p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
