
import { PropsWithChildren } from "react";

export function AuthLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700 p-4">
      <div className="flex justify-center mb-8">
        <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center shadow-lg">
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
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        {children}
      </div>
    </div>
  );
}
